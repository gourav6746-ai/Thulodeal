
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const thumbnail = product.imageURLs?.[0] || `https://picsum.photos/600/800?random=${product.id}`;

  return (
    <Link to={`/product/${product.id}`} className="group block mb-8">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 mb-4">
        <img 
          src={thumbnail} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        {product.stock === 0 && (
          <div className="absolute top-4 left-4 bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 text-[8px] uppercase tracking-[0.2em] font-bold">
            Sold Out
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
