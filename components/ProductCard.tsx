import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const thumbnail = product.imageURLs?.[0] || `https://picsum.photos/600/800?random=${product.id}`;
  const { addToCart, cart } = useCart();
  const [showSizes, setShowSizes] = useState(false);
  const [addedSize, setAddedSize] = useState('');

  const cartQty = cart.filter(i => i.id === product.id).reduce((sum, i) => sum + i.quantity, 0);
  const isOutOfStock = product.stock === 0 || cartQty >= product.stock;

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, size);
    setAddedSize(size);
    setTimeout(() => {
      setAddedSize('');
      setShowSizes(false);
    }, 1200);
  };

  const handleBagClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setShowSizes(true);
  };

  const handleCloseSizes = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSizes(false);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block mb-8">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 mb-4">
        <img
          src={thumbnail}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {isOutOfStock && (
          <div className="absolute top-4 left-4 bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 text-[8px] uppercase tracking-[0.2em] font-bold">
            Sold Out
          </div>
        )}

        {!isOutOfStock && !showSizes && (
          <button
            onClick={handleBagClick}
            className="absolute bottom-0 left-0 right-0 bg-white text-black py-3 text-[9px] uppercase tracking-[0.3em] font-black flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-amber-400"
          >
            <ShoppingBag size={13} /> Quick Add
          </button>
        )}

        {showSizes && (
          <div
            className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center gap-3 p-4"
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex justify-between items-center w-full mb-1">
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">Select Size</span>
              <button onClick={handleCloseSizes} className="text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(e, size)}
                  className={`py-2 border text-[9px] font-black uppercase tracking-widest transition-all ${
                    addedSize === size
                      ? 'border-amber-400 bg-amber-400 text-black'
                      : 'border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400'
                  }`}
                >
                  {addedSize === size ? '✓' : size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center text-center">
        <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2 font-bold">{product.category}</span>
        <h3 className="text-lg font-serif mb-1 group-hover:text-amber-400 transition-colors italic tracking-tight">{product.name}</h3>
        <p className="text-zinc-400 font-light text-sm">${product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
