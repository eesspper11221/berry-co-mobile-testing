# Berry Co. Mobile Store

Berry Co. is a local-first React mobile storefront for trading cards, figures, and collectibles. It showcases the customer shopping flow: browsing promotional drops, searching and filtering products, viewing product details, managing a cart and wishlist, signing in locally, and placing test orders.

The project uses a custom esbuild and Tailwind build script with a small Express static server.

## Run Locally

**Prerequisites:** Node.js 20 or newer

Create `.env.local` using `.env.example` as a template and provide the Supabase project URL and public anon/publishable key. The build injects these client values into the browser bundle; never put a service-role key in this app.

Online checkout uses PayMongo-hosted checkout sessions for GCash and card payments. Configure `BERRYCO_PAYMONGO_SECRET_KEY` with a **test** secret key in `.env.local`; it is read only by the Express server and must never be added to the client build. Keep `BERRYCO_SUPABASE_SERVICE_ROLE_KEY` server-side as well. Configure a PayMongo webhook pointing to `/api/payments/paymongo/webhook`, subscribe to `checkout_session.payment.paid`, and set its signing secret as `BERRYCO_PAYMONGO_WEBHOOK_SECRET` so successful payments update `orders.payment_status` in Supabase. `BERRYCO_SITE_URL` must be the public storefront URL used for PayMongo return redirects. For Android builds, set `BERRYCO_API_BASE_URL` to the reachable server URL (for example, the computer's LAN address during local device testing); do not use `localhost` on a physical device. Add any deployed storefront origin not already covered by `BERRYCO_SITE_URL` to the comma-separated `BERRYCO_ALLOWED_ORIGINS`.

Android PayMongo returns use a verified HTTPS App Link at `/payment-return`. Deploy the app's `server.js` and `public/.well-known/assetlinks.json` to the same host configured by `BERRYCO_SITE_URL`; verify that the asset-links file is publicly reachable as JSON. The included fingerprint is for the local debug signing key. Before distributing a release APK, add its signing certificate SHA-256 fingerprint to `assetlinks.json` and redeploy. Payment status is confirmed from Supabase/webhook data, not the redirect URL alone.

Cash on delivery continues to create a pending order without opening PayMongo. Online payment failures leave the Supabase order pending and provide a retry action.

Customer Support is available to signed-in customers from the Account screen. Customers can submit tickets, track tickets created for their account, read support replies, and respond through the existing Supabase `support_tickets` and `support_ticket_messages` tables. Administrative ticket management remains on the website.

Customer ticket conversations subscribe to new `support_ticket_messages` inserts through Supabase Realtime while the Track tickets view is open, and silently refresh every 10 seconds as a fallback. For immediate updates, enable the `support_ticket_messages` table in the Supabase `supabase_realtime` publication and ensure signed-in customers have a SELECT policy limited to messages belonging to their own tickets. The fallback polling still shows replies if Realtime publication is not enabled.

Customers can select individual cart products or select all before checkout. The order summary and checkout RPC use only the selected cart rows; unselected products remain in the cart.

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

`npm run dev` builds the browser bundle with `scripts/build.mjs` and serves the generated `dist` directory at http://localhost:3000.

## Deploy the API for Android Payments

The Android app sends online-payment requests to `BERRYCO_API_BASE_URL`. That URL must serve this project's Express `server.js`, including `/api/payments/paymongo/checkout-session`; a static storefront host is not sufficient. For Railway, set the service root directory to `deckdrop-mobile/deckdrop-mobile`. `railway.json` builds the app and starts the Express server.

Configure `BERRYCO_SUPABASE_URL`, `BERRYCO_SUPABASE_PUBLISHABLE_KEY`, `BERRYCO_PAYMONGO_SECRET_KEY`, and `BERRYCO_SITE_URL` in the Railway service. `BERRYCO_SITE_URL` must be the public storefront URL used for PayMongo return redirects. In the local `.env.local`, set `BERRYCO_API_BASE_URL` to the Railway service's public origin, without an `/api` suffix, before building the APK. Do not use `localhost` for a physical Android device.

After deployment, the checkout endpoint should answer an unauthenticated POST with HTTP 401 and a `capacitor://localhost` OPTIONS preflight with HTTP 204. Then rebuild and install the APK with `npm run android:build`.

For a typecheck without starting the server:

`npm run lint`

Railway is configured to build with Nixpacks and npm. Keep `package-lock.json` committed and do not add an empty or stale `bun.lock`, which can make Railway select Bun and fail its frozen-lockfile install.

## Build an Android APK

**Prerequisites:** Android Studio, Android SDK, and a Java 17 JDK.

Capacitor wraps the Node-built web app in a native Android project. From this directory:

1. Sync the web app into Android:
   `npm run mobile:sync`
2. Open the Android project in Android Studio:
   `npm run android:open`
3. In Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

The debug APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.

For a command-line debug APK, run:

`npm run android:build`

## Beta Testing Instructions

Please test both the Android APK and the mobile website on an Android phone. Use a test account provided by the Berry Co. team; do not share account passwords, verification codes, or payment details in feedback.

### Test on Android

1. Install the latest debug APK shared by the Berry Co. team. If Android asks for permission to install an unknown app, only allow it if you trust the person who provided the APK.
2. Connect to the internet, open Berry Co., and sign in with the provided test account.
3. Browse products, open a product page, add products to the cart, and try selecting/deselecting individual cart items and **Select all**. Check that the subtotal and checkout list include only selected items, and that unselected items remain in the cart.
4. Try checkout with test delivery details. For a payment test, choose **Card** and use only the PayMongo test card shown below. Do not use a real card or make a real QR Ph payment. Cash on delivery can be tested without opening PayMongo.
5. Under **Account → Customer Support**, submit a test ticket, open **Track tickets**, and check whether a support reply appears without refreshing. Ask the Berry Co. team to reply to that ticket during the test.
6. Repeat the main flows using the phone's back button and by backgrounding/reopening the app.

### Test in a mobile browser

1. Open the deployed storefront on your phone: <https://berry-co-mobile-testing-production.up.railway.app>.
2. Sign in with the provided test account and repeat the product browsing, cart selection, checkout, and support-ticket checks above.
3. Compare the browser behavior with the APK. Include your phone model, Android version, browser name, and whether you were on Wi-Fi or mobile data when reporting an issue.

### PayMongo test payment

Use PayMongo's test mode only. For a successful card test, enter card number `4343434343434345`, any future expiry date, any 3-digit CVC, and fictional billing/contact details. This does not use a real card. Never enter a real card number. GCash may be unavailable while it is inactive in the PayMongo account.

The payment result can be confirmed in PayMongo's test dashboard. The Berry Co. order may still display **Pending** until the PayMongo webhook and Supabase payment-status credentials have been configured; report this separately from a failed checkout. Do not scan or pay any QR Ph code during testing.

### What to report

For each issue, include the platform (APK or mobile browser), device/OS/browser, steps to reproduce, what you expected, what happened, and a screenshot or screen recording with personal information hidden. Report whether checkout opened PayMongo and whether a support reply appeared without a refresh. Do not include passwords, one-time codes, API keys, card details, or identity documents.
