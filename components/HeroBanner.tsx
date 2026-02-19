
import React from 'react';
import { Link } from 'react-router-dom';

const HeroBanner: React.FC = () => {
  return (
    <div className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h2 className="text-sm uppercase tracking-[0.4em] mb-4 text-amber-400 animate-fade-in">The New Standard</h2>
        <h1 className="text-6xl md:text-8xl font-serif text-white mb-8 tracking-tighter leading-none italic">
          Timeless Elegance
        </h1>
        <p className="text-zinc-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Discover a curated collection of high-end garments and footwear designed for the modern editorial aesthetic.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/shop?category=shirts" 
            className="px-10 py-4 bg-white text-black text-sm uppercase tracking-widest font-bold hover:bg-amber-400 transition-all duration-300 w-full sm:w-auto text-center"
          >
            Explore Shirts
          </Link>
          <Link 
            to="/shop?category=shoes" 
            className="px-10 py-4 border border-white text-white text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto text-center"
          >
            Shop Shoes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
