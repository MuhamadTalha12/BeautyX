import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Toaster } from 'sonner';
import './styles.css';

import Home from './pages/Home';
import Bras from './pages/Bras';
import Panties from './pages/Panties';
import Sets from './pages/Sets';
import Shapewear from './pages/Shapewear';
import Sleepwear from './pages/Sleepwear';
import NewArrivals from './pages/NewArrivals';
import Sale from './pages/Sale';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import GoogleSuccess from './pages/GoogleSuccess';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Account from './pages/Account';
import TrackOrder from './pages/TrackOrder';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Faqs from './pages/Faqs';
import SizeGuide from './pages/SizeGuide';
import ReturnsExchanges from './pages/ReturnsExchanges';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { setCredentials } from './redux/slices/authSlice';
import { setCart } from './redux/slices/cartSlice';
import { setWishlist } from './redux/slices/wishlistSlice';
import { getProfile, getDBCart, syncDBCart, getDBWishlist, syncDBWishlist } from './services/authService';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  
  const lastUserId = useRef<string | null>(null);

  // 1. Session Recovery on mount
  useEffect(() => {
    const recoverSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profileRes = await getProfile();
          const userData = profileRes.data.data.user;
          dispatch(setCredentials({ user: userData, accessToken: token }));
        } catch (err) {
          console.error("Failed to recover profile session", err);
          localStorage.removeItem('token');
        }
      }
    };
    recoverSession();
  }, [dispatch]);

  // 2. User authentication change: merge cart/wishlist
  useEffect(() => {
    const handleUserChange = async () => {
      if (user) {
        if (lastUserId.current !== user._id) {
          lastUserId.current = user._id;
          
          try {
            // Merge Cart
            const dbCart = await getDBCart();
            const localCart = JSON.parse(localStorage.getItem('beautyx_cart') || '[]');
            const mergedCart = [...localCart];
            
            dbCart.forEach((dbItem: any) => {
              const existing = mergedCart.find(
                item => item._id === dbItem._id && item.color === dbItem.color && item.size === dbItem.size
              );
              if (existing) {
                existing.quantity = Math.max(existing.quantity, dbItem.quantity);
              } else {
                mergedCart.push(dbItem);
              }
            });
            dispatch(setCart(mergedCart));
            
            // Merge Wishlist
            const dbWishlist = await getDBWishlist();
            const localWishlist = JSON.parse(localStorage.getItem('beautyx_wishlist') || '[]');
            const mergedWishlist = [...localWishlist];
            
            dbWishlist.forEach((dbItem: any) => {
              if (!mergedWishlist.some(item => item._id === dbItem._id)) {
                mergedWishlist.push(dbItem);
              }
            });
            dispatch(setWishlist(mergedWishlist));
          } catch (err) {
            console.error("Error syncing cart/wishlist on login", err);
          }
        }
      } else {
        if (lastUserId.current !== null) {
          lastUserId.current = null;
          dispatch(setCart([]));
          dispatch(setWishlist([]));
          localStorage.removeItem('beautyx_cart');
          localStorage.removeItem('beautyx_wishlist');
        }
      }
    };

    handleUserChange();
  }, [user, dispatch]);

  // 3. Sync Cart changes to DB
  useEffect(() => {
    if (!user || lastUserId.current !== user._id) return;

    const performCartSync = async () => {
      try {
        const cartSyncPayload = cartItems.map(item => ({
          _id: item._id,
          color: item.color,
          size: item.size,
          quantity: item.quantity
        }));
        await syncDBCart(cartSyncPayload);
      } catch (err) {
        console.error("Error syncing cart to database", err);
      }
    };

    performCartSync();
  }, [cartItems, user]);

  // 4. Sync Wishlist changes to DB
  useEffect(() => {
    if (!user || lastUserId.current !== user._id) return;

    const performWishlistSync = async () => {
      try {
        const wishlistSyncPayload = wishlistItems.map(item => item._id);
        await syncDBWishlist(wishlistSyncPayload);
      } catch (err) {
        console.error("Error syncing wishlist to database", err);
      }
    };

    performWishlistSync();
  }, [wishlistItems, user]);

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bras" element={<Bras />} />
        <Route path="/panties" element={<Panties />} />
        <Route path="/sets" element={<Sets />} />
        <Route path="/shapewear" element={<Shapewear />} />
        <Route path="/sleepwear" element={<Sleepwear />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/auth/google/success" element={<GoogleSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/account" element={<Account />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/size-guide" element={<SizeGuide />} />
        <Route path="/returns-exchanges" element={<ReturnsExchanges />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);
