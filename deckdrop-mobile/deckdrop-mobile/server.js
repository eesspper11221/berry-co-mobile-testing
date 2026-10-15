import {createHmac, timingSafeEqual} from 'node:crypto';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createClient} from '@supabase/supabase-js';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(rootDirectory, 'dist');
dotenv.config({path: path.join(rootDirectory, '.env.local')});

const app = express();
const port = process.env.PORT || 3000;
const payMongoApiUrl = 'https://api.paymongo.com/v1';
const supabaseUrl = process.env.BERRYCO_SUPABASE_URL;
const supabasePublishableKey = process.env.BERRYCO_SUPABASE_PUBLISHABLE_KEY;
const allowedOrigins = new Set([
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
  process.env.BERRYCO_SITE_URL,
  ...(process.env.BERRYCO_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()),
].filter(Boolean));

app.use('/api', (request, response, next) => {
  const origin = request.get('origin');
  if (origin && allowedOrigins.has(origin)) {
    response.set('Access-Control-Allow-Origin', origin);
    response.set('Vary', 'Origin');
    response.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }
  next();
});

const getPayMongoSecretKey = () => {
  const secretKey = process.env.BERRYCO_PAYMONGO_SECRET_KEY;
  if (!secretKey || !secretKey.startsWith('sk_test_')) {
    throw new Error('Set a PayMongo test secret key in BERRYCO_PAYMONGO_SECRET_KEY.');
  }
  return secretKey;
};

const getAuthenticatedUser = async (request) => {
  const authorization = request.get('authorization') || '';
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!accessToken || !supabaseUrl || !supabasePublishableKey) return null;

  const client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {autoRefreshToken: false, persistSession: false},
  });
  const {data: {user}, error} = await client.auth.getUser(accessToken);
  if (error || !user) return null;

  return {user, accessToken};
};

const createUserSupabaseClient = (accessToken) => createClient(supabaseUrl, supabasePublishableKey, {
  auth: {autoRefreshToken: false, persistSession: false},
  global: {headers: {Authorization: `Bearer ${accessToken}`}},
});

app.post(
  '/api/payments/paymongo/webhook',
  express.raw({type: 'application/json'}),
  async (request, response) => {
    const webhookSecret = process.env.BERRYCO_PAYMONGO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      response.status(503).json({error: 'PayMongo webhook verification is not configured.'});
      return;
    }
    if (!request.body || !Buffer.isBuffer(request.body)) {
      response.status(400).json({error: 'Expected a JSON webhook payload.'});
      return;
    }

    const signatureHeader = request.get('paymongo-signature') || '';
    const signatureParts = Object.fromEntries(
      signatureHeader.split(',').map((part) => part.split('=').map((value) => value.trim())),
    );
    const timestamp = signatureParts.t;
    const providedSignature = signatureParts.te;
    if (!timestamp || !providedSignature) {
      response.status(400).json({error: 'Invalid PayMongo webhook signature.'});
      return;
    }

    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${request.body.toString('utf8')}`)
      .digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(providedSignature, 'hex');
    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      response.status(400).json({error: 'Invalid PayMongo webhook signature.'});
      return;
    }

    let event;
    try {
      event = JSON.parse(request.body.toString('utf8'));
    } catch {
      response.status(400).json({error: 'Invalid JSON webhook payload.'});
      return;
    }

    const eventAttributes = event?.data?.attributes;
    if (eventAttributes?.type !== 'checkout_session.payment.paid') {
      response.status(200).json({received: true});
      return;
    }

    const checkoutAttributes = eventAttributes.data?.attributes;
    const orderId = checkoutAttributes?.metadata?.order_id;
    if (!orderId) {
      response.status(400).json({error: 'PayMongo event is missing its order reference.'});
      return;
    }

    const serviceRoleKey = process.env.BERRYCO_SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey || !supabaseUrl) {
      response.status(503).json({error: 'Supabase payment updates are not configured.'});
      return;
    }

    try {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {autoRefreshToken: false, persistSession: false},
      });
      const {data, error} = await adminClient
        .from('orders')
        .update({payment_status: 'paid'})
        .eq('id', orderId)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        response.status(404).json({error: 'The referenced order was not found.'});
        return;
      }
      response.status(200).json({received: true});
    } catch (error) {
      console.error('Unable to record PayMongo payment in Supabase:', error.message);
      response.status(500).json({error: 'Unable to record the payment.'});
    }
  },
);

app.use(express.json());

app.post('/api/payments/paymongo/checkout-session', async (request, response) => {
  try {
    const authentication = await getAuthenticatedUser(request);
    if (!authentication) {
      response.status(401).json({error: 'Sign in again before starting payment.'});
      return;
    }

    const {orderId, paymentMethod} = request.body || {};
    if (typeof orderId !== 'string' || !orderId || !['gcash', 'card'].includes(paymentMethod)) {
      response.status(400).json({error: 'A valid order and online payment method are required.'});
      return;
    }

    const secretKey = getPayMongoSecretKey();
    const userClient = createUserSupabaseClient(authentication.accessToken);
    const {data: order, error: orderError} = await userClient
      .from('orders')
      .select('id,order_number,customer_id,customer_email,total_amount,payment_status,status')
      .eq('id', orderId)
      .eq('customer_id', authentication.user.id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) {
      response.status(404).json({error: 'Order not found.'});
      return;
    }
    if (String(order.status).toLowerCase() === 'cancelled' || String(order.payment_status).toLowerCase() === 'paid') {
      response.status(409).json({error: 'This order is not eligible for payment.'});
      return;
    }

    const {data: items, error: itemsError} = await userClient
      .from('order_items')
      .select('product_name,quantity,price')
      .eq('order_id', order.id);
    if (itemsError) throw itemsError;
    if (!items?.length) {
      response.status(400).json({error: 'This order has no items to pay for.'});
      return;
    }

    const itemAmounts = items.map((item) => {
      const amount = Math.round(Number(item.price) * 100);
      const quantity = Number(item.quantity);
      if (!Number.isSafeInteger(amount) || amount < 100 || !Number.isSafeInteger(quantity) || quantity < 1) {
        throw new Error('The order contains an invalid item amount.');
      }
      return {amount, quantity, lineItem: {
        currency: 'PHP',
        amount,
        name: String(item.product_name).slice(0, 100),
        quantity,
      }};
    });
    const expectedTotal = Math.round(Number(order.total_amount) * 100);
    const itemsTotal = itemAmounts.reduce((total, item) => total + item.amount * item.quantity, 0);
    const shippingFee = expectedTotal - itemsTotal;
    const lineItems = itemAmounts.map((item) => item.lineItem);
    if (shippingFee > 0) {
      lineItems.push({currency: 'PHP', amount: shippingFee, name: 'Delivery fee', quantity: 1});
    }
    const lineItemsTotal = lineItems.reduce((total, item) => total + item.amount * item.quantity, 0);
    if (!Number.isSafeInteger(expectedTotal) || expectedTotal < 100 || shippingFee < 0 || lineItemsTotal !== expectedTotal) {
      throw new Error('The order total does not match its items. Refresh your cart and try again.');
    }

    const siteUrl = (process.env.BERRYCO_SITE_URL || '').replace(/\/+$/, '');
    if (!siteUrl) throw new Error('Set BERRYCO_SITE_URL to the storefront URL for payment redirects.');

    const responseFromPayMongo = await fetch(`${payMongoApiUrl}/checkout_sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: lineItems,
            payment_method_types: [paymentMethod === 'gcash' ? 'gcash' : 'card'],
            description: `Berry Co. order ${order.order_number}`,
            reference_number: order.order_number,
            metadata: {order_id: order.id},
            success_url: `${siteUrl}/?payment=success&order=${encodeURIComponent(order.id)}`,
            cancel_url: `${siteUrl}/?payment=cancelled&order=${encodeURIComponent(order.id)}`,
          },
        },
      }),
    });
    const payMongoResult = await responseFromPayMongo.json();
    if (!responseFromPayMongo.ok) {
      const message = payMongoResult?.errors?.[0]?.detail || 'PayMongo could not start this payment.';
      response.status(responseFromPayMongo.status >= 500 ? 502 : 400).json({error: message});
      return;
    }

    const checkoutSession = payMongoResult?.data;
    if (!checkoutSession?.id || !checkoutSession?.attributes?.checkout_url) {
      throw new Error('PayMongo returned an incomplete checkout session.');
    }
    response.status(201).json({
      checkoutUrl: checkoutSession.attributes.checkout_url,
      checkoutSessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Unable to create PayMongo checkout session:', error.message);
    response.status(500).json({error: error.message || 'Unable to start payment.'});
  }
});

app.use(express.static(distDirectory));
app.get('*', (_request, response) => {
  response.sendFile(path.join(distDirectory, 'index.html'));
});

const startServer = (candidatePort) => {
  const server = app.listen(candidatePort, () => {
    console.log(`Server running at http://localhost:${candidatePort}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && !process.env.PORT) {
      console.warn(`Port ${candidatePort} is in use; trying ${Number(candidatePort) + 1}.`);
      startServer(Number(candidatePort) + 1);
      return;
    }

    console.error(`Unable to start server on port ${candidatePort}:`, error.message);
    process.exitCode = 1;
  });
};

startServer(port);