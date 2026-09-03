import React from 'react';
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
import { AuthView } from './components/views/AuthView';

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
      <MobileFrame>
        <Toast />
        <Header />
        <MainScreenRouter />
        <BottomNav />
      </MobileFrame>
    </StoreProvider>
  );
}
