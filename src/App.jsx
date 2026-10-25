import { Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import HomePage from './pages/public/HomePage';
import HairServicesPage from './pages/public/HairServicesPage';
import ShopPage from './pages/public/ShopPage';
import DetailPage from './pages/public/DetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import OrderSuccessPage from './pages/public/OrderSuccessPage';
import NotFoundPage from './pages/public/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ResourcePage from './pages/admin/ResourcePage';
import ProductEditorPage from './pages/admin/ProductEditorPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import SettingsPage from './pages/admin/SettingsPage';

export default function App() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="shop" element={<ShopPage />} />
      <Route path="favorites" element={<ShopPage key="favorites" favoritesOnly />} />
      <Route path="shop/:slug" element={<DetailPage kind="products" />} />
      <Route path="hair-services" element={<HairServicesPage />} />
      <Route path="hair-services/:slug" element={<DetailPage kind="services" />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="order-success/:orderNumber" element={<OrderSuccessPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route path="admin/login" element={<LoginPage />} />
    <Route element={<ProtectedAdminRoute />}>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ResourcePage resource="products" />} />
        <Route path="products/new" element={<ProductEditorPage />} />
        <Route path="products/:id/edit" element={<ProductEditorPage />} />
        <Route path="categories" element={<ResourcePage resource="categories" />} />
        <Route path="services" element={<ResourcePage resource="services" />} />
        <Route path="orders" element={<ResourcePage resource="orders" />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Route>
  </Routes>;
}
