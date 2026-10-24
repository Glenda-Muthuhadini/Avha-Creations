import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BusinessProvider } from './context/BusinessContext';
import { WishlistProvider } from './context/WishlistContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App';
import './styles/index.css';
import './styles/home.css';
import './styles/shop.css';
import './styles/hair.css';

createRoot(document.getElementById('root')).render(
  <StrictMode><ErrorBoundary><BrowserRouter><AuthProvider><BusinessProvider><CartProvider><WishlistProvider><App /></WishlistProvider></CartProvider></BusinessProvider></AuthProvider></BrowserRouter></ErrorBoundary></StrictMode>,
);
