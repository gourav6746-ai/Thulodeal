
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Package } from 'lucide-react';

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = searchParams.get('category') as Category | null;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const sorted = allProducts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        if (activeCategory) {
          // Case-insensitive filtering to ensure 'shirts' matches 'Shirts'
          const filtered = sorted.filter(p => 
            p.category?.toLowerCase() === activeCategory.toLowerCase()
          );
          setProducts(filtered);
        } else {
          setProducts(sorted);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories: { id: Category | ''; label: string }[] = [
    { id: '', label: 'All Pieces' },
    { id: 'shirts', label: 'Shirts' },
    { id: 'jeans', label: 'Jeans' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'jackets', label: 'Jackets' },
    { id: 'accessories', label: 'Accessories' },
  ];

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header aligned to the RIGHT side */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="SEARCH THE ARCHIVE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border-b border-zinc-800 py-4 pl-12 pr-4 text-[10px] uppercase tracking-[0.2em] focus:outline-none focus:border-amber-400 text-white transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 bg-zinc-900 border transition-all ${showFilters ? 'border-amber-400 text-amber-400' : 'border-zinc-800 text-zinc-500'}`}
          >
            <Filter size={20} />
          </button>
        </div>

        <div className="w-full md:w-auto md:text-right">
          <h1 className="text-6xl font-serif italic mb-2 text-white leading-tight">
            {activeCategory ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) : 'Collection'}
          </h1>
          <p className="text-zinc-500 uppercase tracking-[0.4em] text-[10px] font-black">
            Archive Inventory / {filteredProducts.length} Selected
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-12`}>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-black mb-8 text-amber-400 border-b border-zinc-800 pb-2">Filter Category</h4>
            <div className="flex flex-col space-y-5">
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => {
                    cat.id === '' ? setSearchParams({}) : setSearchParams({ category: cat.id });
                    if (window.innerWidth < 1024) setShowFilters(false);
                  }}
                  className={`text-[10px] text-left uppercase tracking-[0.2em] transition-all font-bold ${
                    (cat.id === '' && !activeCategory) || cat.id?.toLowerCase() === activeCategory?.toLowerCase() 
                      ? 'text-amber-400 pl-2 border-l-2 border-amber-400' 
                      : 'text-zinc-500 hover:text-white pl-0 border-l-0 border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-8 bg-zinc-900/50 border border-zinc-800">
             <h4 className="text-[10px] uppercase tracking-widest font-black mb-4 text-amber-400">Editorial Note</h4>
             <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                Only items meeting our quality standards for silhouette and material are curated into the archive.
             </p>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-zinc-900 rounded-sm mb-6" />
                  <div className="h-3 bg-zinc-900 w-3/4 mb-2" />
                  <div className="h-3 bg-zinc-900 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-32 text-center space-y-8 border border-zinc-800 border-dashed bg-zinc-900/10">
               <Package size={48} className="mx-auto text-zinc-800" />
               <p className="text-zinc-500 italic text-sm tracking-widest">NO RECORDS MATCH THE CURRENT FILTER.</p>
               <button onClick={() => { setSearchTerm(''); setSearchParams({}); }} className="px-10 py-4 bg-zinc-800 text-white uppercase tracking-widest text-[10px] font-bold hover:bg-zinc-700">RESET VIEW</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
