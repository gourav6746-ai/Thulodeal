
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl animate-slide-in">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-serif tracking-widest flex items-center gap-3">
              <ShoppingBag size={20} className="text-amber-400" />
              YOUR BAG
            </h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <p className="text-zinc-500 italic">Your bag is currently empty.</p>
                <Link to="/shop" onClick={onClose} className="text-amber-400 underline uppercase tracking-widest text-sm">Start Shopping</Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                  <div className="w-24 aspect-[3/4] bg-zinc-900 flex-shrink-0">
                    <img src={item.imageURLs?.[0] || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-serif text-lg">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-zinc-500 hover:text-red-400">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500">Size: {item.selectedSize}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-zinc-800 bg-zinc-900 rounded-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="p-2 hover:text-amber-400"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="p-2 hover:text-amber-400"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-light">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 space-y-4">
              <div className="flex justify-between items-center text-lg font-serif">
                <span>Subtotal</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Taxes and shipping calculated at checkout.</p>
              <Link 
                to="/checkout" 
                onClick={onClose}
                className="block w-full py-4 bg-white text-black text-center text-sm font-bold uppercase tracking-[0.2em] hover:bg-amber-400 transition-colors"
              >
                Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;
