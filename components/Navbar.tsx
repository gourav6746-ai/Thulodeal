
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Navbar: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-400 hover:text-white">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-3xl font-serif tracking-widest text-white uppercase italic">
                Thulodeal
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/shop" className="text-[10px] uppercase tracking-widest hover:text-amber-400 transition-colors">Shop All</Link>
              <Link to="/shop?category=shirts" className="text-[10px] uppercase tracking-widest hover:text-amber-400 transition-colors">Shirts</Link>
              <Link to="/shop?category=jeans" className="text-[10px] uppercase tracking-widest hover:text-amber-400 transition-colors">Jeans</Link>
              <Link to="/shop?category=shoes" className="text-[10px] uppercase tracking-widest hover:text-amber-400 transition-colors">Shoes</Link>
            </div>

            <div className="flex items-center space-x-5">
              {isAdmin && (
                <Link to="/admin" className="text-amber-400 hover:text-amber-300 hidden md:block" title="Admin Panel">
                  <ShieldCheck size={22} />
                </Link>
              )}
              <button onClick={() => setIsCartOpen(true)} className="relative text-zinc-300 hover:text-white">
                <ShoppingBag size={22} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </button>
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <Link to="/orders" className="text-zinc-300 hover:text-white hidden sm:block"><User size={22} /></Link>
                  <button onClick={handleLogout} className="text-zinc-300 hover:text-white"><LogOut size={22} /></button>
                </div>
              ) : (
                <Link to="/login" className="text-zinc-300 hover:text-white"><User size={22} /></Link>
              )}
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-6 space-y-4">
            <Link to="/shop" className="block text-lg uppercase tracking-widest hover:text-amber-400" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
            <Link to="/shop?category=shirts" className="block text-lg uppercase tracking-widest hover:text-amber-400" onClick={() => setIsMobileMenuOpen(false)}>Shirts</Link>
            <Link to="/shop?category=jeans" className="block text-lg uppercase tracking-widest hover:text-amber-400" onClick={() => setIsMobileMenuOpen(false)}>Jeans</Link>
            <Link to="/shop?category=shoes" className="block text-lg uppercase tracking-widest hover:text-amber-400" onClick={() => setIsMobileMenuOpen(false)}>Shoes</Link>
            {isAdmin && <Link to="/admin" className="block text-lg uppercase tracking-widest text-amber-400" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>}
            {currentUser && <Link to="/orders" className="block text-lg uppercase tracking-widest hover:text-amber-400" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>}
          </div>
        )}
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
