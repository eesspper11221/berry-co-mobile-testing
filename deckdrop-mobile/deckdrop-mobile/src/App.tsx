import React, { useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { InAppBrowser } from '@capgo/capacitor-inappbrowser';
import { LoaderCircle } from 'lucide-react';
import { matchesPaymentReturnUrl } from '../lib/paymentReturnUrls.js';
import { StoreProvider, useStore } from './context/StoreContext';
import { MobileFrame } from './components/common/MobileFrame';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Toast } from './components/common/Toast';

// Views
import { HomeView } from './components/views/HomeView';
import { CatalogView } from './components/views/CatalogView';
import { ProductDetailView } from './components/views/ProductDetailView';
import { CartView } from './components/views/CartView';
import { CheckoutView } from './components/views/CheckoutView';
import { OrderSuccessView } from './components/views/OrderSuccessView';
import { OrdersView } from './components/views/OrdersView';
import { OrderDetailView } from './components/views/OrderDetailView';
import { WishlistView } from './components/views/WishlistView';
import { ProfileView } from './components/views/ProfileView';
import { SupportView } from './components/views/SupportView';
import { AuthView } from './components/views/AuthView';

const isPaymentReturnUrl = (value: string): boolean => {
  return matchesPaymentReturnUrl(
    value,
    Capacitor.isNativePlatform(),
    __BERRYCO_SITE_URL__,
    window.location.origin,
  );
};

const NativeAppLifecycle: React.FC = () => {
  const { currentUser, goBack, navigateTo, navigateToPaymentOrder, refreshOrders, showToast } = useStore();
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null);
  const isHandlingReturn = useRef(false);
  const actions = useRef({ goBack });
  actions.current = { goBack };

  useEffect(() => {
    const capturePaymentReturn = (url: string) => {
      if (!isPaymentReturnUrl(url)) return;
      setPendingPaymentUrl(url);
      if (Capacitor.isNativePlatform()) {
        void Browser.close().catch(() => {});
        void InAppBrowser.close().catch(() => {});
      }
    };

    if (Capacitor.isNativePlatform()) {
      const appUrlListener = CapacitorApp.addListener('appUrlOpen', ({ url }) => capturePaymentReturn(url));
      const backListener = CapacitorApp.addListener('backButton', () => {
        if (!actions.current.goBack()) void CapacitorApp.exitApp();
      });
      const webViewUrlListener = Capacitor.getPlatform() === 'android'
        ? InAppBrowser.addListener('urlChangeEvent', ({url}) => capturePaymentReturn(url))
        : undefined;
      const webViewSchemeListener = Capacitor.getPlatform() === 'android'
        ? InAppBrowser.addListener('customSchemeIntercepted', ({url}) => capturePaymentReturn(url))
        : undefined;
      void appUrlListener.then((listener) => {
        if (!Capacitor.isNativePlatform()) void listener.remove();
      });
      void backListener.then((listener) => {
        if (!Capacitor.isNativePlatform()) void listener.remove();
      });
      void webViewUrlListener?.then((listener) => {
        if (Capacitor.getPlatform() !== 'android') void listener.remove();
      });
      void webViewSchemeListener?.then((listener) => {
        if (Capacitor.getPlatform() !== 'android') void listener.remove();
      });
      void CapacitorApp.getLaunchUrl().then((launch) => {
        if (launch?.url) capturePaymentReturn(launch.url);
      });
      return () => {
        void appUrlListener.then((listener) => listener.remove());
        void backListener.then((listener) => listener.remove());
        void webViewUrlListener?.then((listener) => listener.remove());
        void webViewSchemeListener?.then((listener) => listener.remove());
      };
    }

    capturePaymentReturn(window.location.href);
    return undefined;
  }, []);

  useEffect(() => {
    if (!pendingPaymentUrl || !currentUser || isHandlingReturn.current) return;
    isHandlingReturn.current = true;

    const handlePaymentReturn = async () => {
      const url = new URL(pendingPaymentUrl);
      const orderId = url.searchParams.get('order');
      const paymentResult = url.searchParams.get('payment');
      if (!orderId || !['success', 'cancelled'].includes(paymentResult || '')) {
        showToast('The payment return link is invalid.', 'error');
        return;
      }

      let userOrders = await refreshOrders();
      let returnedOrder = userOrders.find((order) => order.id === orderId);
      if (!returnedOrder) {
        showToast('The payment return does not match an order on this account.', 'error');
        return;
      }

      if (paymentResult === 'success' && returnedOrder.payment_status !== 'paid') {
        for (let attempt = 0; attempt < 8; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          userOrders = await refreshOrders();
          returnedOrder = userOrders.find((order) => order.id === orderId);
          if (!returnedOrder || returnedOrder.payment_status === 'paid') break;
        }
      }

      if (paymentResult === 'cancelled') {
        navigateTo('order-detail', {orderId}, 'root');
        showToast('Payment was not completed. The order is still pending.', 'info');
      } else {
        navigateToPaymentOrder(orderId);
        if (returnedOrder.payment_status === 'paid') {
          showToast('Payment confirmed.', 'success');
        } else {
          showToast('Payment received. Confirmation is still processing.', 'info');
        }
      }
    };

    void handlePaymentReturn()
      .catch((error) => showToast(error instanceof Error ? error.message : 'Unable to confirm payment.', 'error'))
      .finally(() => {
        if (!Capacitor.isNativePlatform()) window.history.replaceState({}, '', '/');
        isHandlingReturn.current = false;
        setPendingPaymentUrl(null);
      });
  }, [currentUser, navigateToPaymentOrder, pendingPaymentUrl, refreshOrders, showToast]);

  if (!pendingPaymentUrl) return null;

  const isCancelledReturn = new URL(pendingPaymentUrl).searchParams.get('payment') === 'cancelled';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F3E4C8] px-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-sm space-y-5 text-center">
        <LoaderCircle size={42} className="mx-auto animate-spin text-[#E23B2E]" />
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#E23B2E]">
            {isCancelledReturn ? 'Payment not completed' : 'Payment pending'}
          </p>
          <h1 className="text-xl font-black text-[#35322E]">
            {isCancelledReturn ? 'Returning to your order' : 'Confirming your PayMongo transaction'}
          </h1>
          <p className="text-sm font-medium leading-relaxed text-[#35322E]/70">
            {isCancelledReturn
              ? 'Your order is still pending. We are loading its latest status.'
              : 'PayMongo returned you to Berry Co. We are checking your payment and loading your order.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const MainScreenRouter: React.FC = () => {
  const { currentScreen } = useStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeView />;
      case 'catalog':
        return <CatalogView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-success':
        return <OrderSuccessView />;
      case 'orders':
        return <OrdersView />;
      case 'order-detail':
        return <OrderDetailView />;
      case 'wishlist':
        return <WishlistView />;
      case 'profile':
        return <ProfileView />;
      case 'support':
        return <SupportView />;
      case 'login':
      case 'register':
        return <AuthView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="flex-1">
        {renderScreen()}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <NativeAppLifecycle />
      <MobileFrame>
        <Toast />
        <Header />
        <MainScreenRouter />
        <BottomNav />
      </MobileFrame>
    </StoreProvider>
  );
}
