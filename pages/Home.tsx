
import React, { useState, useEffect } from 'react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product } from '../types';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="pt-20">
      <HeroBanner />
      
      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-xs uppercase tracking-[0.5em] text-amber-400 mb-4 font-bold">Curated Selection</span>
          <h2 className="text-4xl md:text-5xl font-serif italic mb-4">Latest Editorial</h2>
          <div className="w-12 h-px bg-amber-400" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-zinc-900 mb-4 rounded-sm" />
                <div className="h-4 bg-zinc-900 w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-zinc-900 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Editorial Content */}
      <section className="bg-zinc-900 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 relative group">
            <div className="aspect-[4/5] bg-zinc-800 overflow-hidden">
               <img 
                src="https://images.unsplash.com/photo-1539109132314-347515d1ee3b?q=80&w=2070&auto=format&fit=crop" 
                alt="Model" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
               />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-64 bg-zinc-950 border border-zinc-800 hidden lg:block p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-serif mb-4 leading-relaxed">
                "Fashion is the most powerful art there is. Its movement, design and architecture all in one."
              </p>
              <span className="text-[8px] uppercase tracking-[0.4em] text-amber-400">— Blair Waldorf</span>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 space-y-8">
            <h3 className="text-xs uppercase tracking-[0.5em] text-zinc-500 font-bold">The Craftsmanship</h3>
            <h2 className="text-5xl md:text-6xl font-serif italic leading-tight">Mastery in Every Stitch</h2>
            <p className="text-zinc-400 font-light leading-loose">
              We believe in quality over quantity. Each piece in our collection is meticulously crafted by master artisans who share our vision for aesthetic perfection. From the selection of Italian leathers to the drape of Japanese silk, excellence is our only standard.
            </p>
            <button className="px-10 py-4 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black transition-all duration-300 uppercase tracking-widest text-xs font-bold">
              Read Our Story
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
