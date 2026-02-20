import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Package, X, ChevronDown } from 'lucide-react';

const COLORS = ['Black', 'White', 'Blue', 'Grey', 'Brown', 'Red', 'Green', 'Navy', 'Beige'];
const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: '$100 – $200', min: 100, max: 200 },
  { label: '$200 – $500', min: 200, max: 500 },
  { label: 'Above $500', min: 500, max: Infinity },
];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A–Z', value: 'name_asc' },
];

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const activeCategory = searchParams.get('category') as Category | null;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const sorted = allProducts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (activeCategory) {
          setProducts(sorted.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase()));
        } else {
          setProducts(sorted);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    setSelectedColors([]);
    setSelectedPriceRange(null);
    setSelectedSizes([]);
  }, [activeCategory]);

  const allSizes = Array.from(new Set(products.flatMap(p => p.sizes || []))).sort();

  const toggleColor = (color: string) =>
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);

  const toggleSize = (size: string) =>
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const resetFilters = () => {
    setSelectedColors([]);
    setSelectedPriceRange(null);
    setSelectedSizes([]);
    setSearchTerm('');
    setSortBy('newest');
  };

  const hasActiveFilters = selectedColors.length > 0 || selectedPriceRange !== null || selectedSizes.length > 0 || searchTerm !== '' || sortBy !== 'newest';

  const filteredProducts = products
    .filter(p => {
      if (searchTerm && !p.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedColors.length > 0) {
        const haystack = `${p.name} ${p.description}`.toLowerCase();
        if (!selectedColors.some(c => haystack.includes(c.toLowerCase()))) return false;
      }
      if (selectedPriceRange !== null) {
        const range = PRICE_RANGES[selectedPriceRange];
        if (p.price < range.min || p.price > range.max) return false;
      }
      if (selectedSizes.length > 0) {
        if (!selectedSizes.some(s => (p.sizes || []).includes(s))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'name_asc': return a.name.localeCompare(b.name);
        default: return (b.createdAt || 0) - (a.createdAt || 0);
      }
    });

  const categories: { id: Category | ''; label: string }[] = [
    { id: '', label: 'All Pieces' },
    { id: 'shirts', label: 'Shirts' },
    { id: 'jeans', label: 'Jeans' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'jackets', label: 'Jackets' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort';

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
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
            className={`p-4 bg-zinc-900 border transition-all relative ${showFilters ? 'border-amber-400 text-amber-400' : 'border-zinc-800 text-zinc-500'}`}
          >
            <Filter size={20} />
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />}
          </button>
        </div>

        <div className="w-full md:w-auto md:text-right flex flex-col md:items-end gap-3">
          <h1 className="text-6xl font-serif italic mb-0 text-white leading-tight">
            {activeCategory ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) : 'Collection'}
          </h1>
          <div className="flex items-center gap-4 justify-end">
            <p className="text-zinc-500 uppercase tracking-[0.4em] text-[10px] font-black">
              {filteredProducts.length} Selected
            </p>
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-zinc-400 hover:text-amber-400 border border-zinc-800 px-3 py-2 transition-all"
              >
                {currentSortLabel} <ChevronDown size={10} />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 z-50 min-w-[160px] shadow-2xl">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }}
                      className={`block w-full text-left px-4 py-3 text-[9px] uppercase tracking-widest font-black transition-all ${
                        sortBy === opt.value ? 'text-amber-400 bg-amber-400/5' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-10`}>

          {/* Category */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-black mb-6 text-amber-400 border-b border-zinc-800 pb-2">Category</h4>
            <div className="flex flex-col space-y-4">
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

          {/* Color */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-black mb-6 text-amber-400 border-b border-zinc-800 pb-2">Color</h4>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`text-[9px] uppercase tracking-widest px-3 py-1.5 border transition-all font-bold ${
                    selectedColors.includes(color)
                      ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-400 hover:text-white'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-black mb-6 text-amber-400 border-b border-zinc-800 pb-2">Price Range</h4>
            <div className="flex flex-col space-y-3">
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                  className={`text-[10px] text-left uppercase tracking-[0.2em] transition-all font-bold ${
                    selectedPriceRange === i
                      ? 'text-amber-400 pl-2 border-l-2 border-amber-400'
                      : 'text-zinc-500 hover:text-white pl-0 border-l-0 border-transparent'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          {allSizes.length > 0 && (
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.3em] font-black mb-6 text-amber-400 border-b border-zinc-800 pb-2">Size</h4>
              <div className="flex flex-wrap gap-2">
                {allSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`text-[9px] uppercase tracking-widest w-10 h-10 border transition-all font-bold ${
                      selectedSizes.includes(size)
                        ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-400 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 font-bold transition-all"
            >
              <X size={12} /> Clear All Filters
            </button>
          )}

          <div className="p-6 bg-zinc-900/50 border border-zinc-800">
            <h4 className="text-[10px] uppercase tracking-widest font-black mb-3 text-amber-400">Editorial Note</h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed italic">
              Only items meeting our quality standards for silhouette and material are curated into the archive.
            </p>
          </div>
        </aside>

        {/* Products Grid */}
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
              <button
                onClick={() => { resetFilters(); setSearchParams({}); }}
                className="px-10 py-4 bg-zinc-800 text-white uppercase tracking-widest text-[10px] font-bold hover:bg-zinc-700"
              >
                RESET VIEW
              </button>
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
                                                                         
