
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CheckoutPage from './pages/CheckoutPage';

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import AdminAddProduct from './admin/AdminAddProduct';
import AdminEditProduct from './admin/AdminEditProduct';
import AdminProductList from './admin/AdminProductList';
import AdminOrderList from './admin/AdminOrderList';
import AdminPromoManager from './admin/AdminPromoManager'; // New
import AdminBundleCurator from './admin/AdminBundleCurator'; // New

const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* User Routes */}
                <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/add" element={<ProtectedRoute adminOnly><AdminAddProduct /></ProtectedRoute>} />
                <Route path="/admin/edit/:id" element={<ProtectedRoute adminOnly><AdminEditProduct /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProductList /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrderList /></ProtectedRoute>} />
                <Route path="/admin/promos" element={<ProtectedRoute adminOnly><AdminPromoManager /></ProtectedRoute>} />
                <Route path="/admin/bundles" element={<ProtectedRoute adminOnly><AdminBundleCurator /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
