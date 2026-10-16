import React, { useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
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
import { OrdersView } from './components/views/OrdersView';
import { OrderDetailView } from './components/views/OrderDetailView';
import { WishlistView } from './components/views/WishlistView';
import { ProfileView } from './components/views/ProfileView';
import { SupportView } from './components/views/SupportView';
import { AuthView } from './components/views/AuthView';

const isPaymentReturnUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.hostname === 'berry-co-mobile-testing-production.up.railway.app'
      && url.pathname === '/payment-return';
  } catch {
    return false;
  }
};

const NativeAppLifecycle: React.FC = () => {
  const { currentUser, goBack, navigateToPaymentOrder, refreshOrders, showToast } = useStore();
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null);
  const isHandlingReturn = useRef(false);
  const actions = useRef({ goBack });
  actions.current = { goBack };

  useEffect(() => {
    const capturePaymentReturn = (url: string) => {
      if (!isPaymentReturnUrl(url)) return;
      setPendingPaymentUrl(url);
      if (Capacitor.isNativePlatform()) void Browser.close().catch(() => {});
    };

    if (Capacitor.isNativePlatform()) {
      const appUrlListener = CapacitorApp.addListener('appUrlOpen', ({ url }) => capturePaymentReturn(url));
      const backListener = CapacitorApp.addListener('backButton', () => {
        if (!actions.current.goBack()) void CapacitorApp.exitApp();
      });
      void appUrlListener.then((listener) => {
        if (!Capacitor.isNativePlatform()) void listener.remove();
      });
      void backListener.then((listener) => {
        if (!Capacitor.isNativePlatform()) void listener.remove();
      });
      void CapacitorApp.getLaunchUrl().then((launch) => {
        if (launch?.url) capturePaymentReturn(launch.url);
      });
      return () => {
        void appUrlListener.then((listener) => listener.remove());
        void backListener.then((listener) => listener.remove());
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

      navigateToPaymentOrder(orderId);
      if (paymentResult === 'cancelled') {
        showToast('Payment was not completed. The order is still pending.', 'info');
      } else if (returnedOrder?.payment_status === 'paid') {
        showToast('Payment confirmed.', 'success');
      } else {
        showToast('Payment received. Confirmation is still processing.', 'info');
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

  return null;
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
