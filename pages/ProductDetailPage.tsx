
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ChevronLeft, ShoppingBag, Ruler, ShieldCheck } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      alert("Please select a size for your acquisition.");
      return;
    }
    addToCart(product, selectedSize);
    alert(`${product.name} (Size: ${selectedSize}) has been added to your bag.`);
  };

  if (loading) return (
    <div className="pt-40 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-400 mx-auto" />
      <p className="mt-4 uppercase tracking-[0.2em] text-zinc-500">Retrieving Metadata...</p>
    </div>
  );

  if (!product) return (
    <div className="pt-40 text-center">
      <p className="italic text-zinc-500">The piece you requested does not exist in our archive.</p>
      <button onClick={() => navigate('/shop')} className="text-amber-400 mt-4 underline uppercase tracking-widest text-xs font-bold">Return to Collections</button>
    </div>
  );

  const productImages = product.imageURLs || [];

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-zinc-500 hover:text-white mb-12 transition-colors uppercase tracking-widest text-[10px] font-bold"
        >
          <ChevronLeft size={16} /> Previous Record
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Thumbnails Sidebar - Desktop */}
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-4">
            {productImages.map((url, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(i)}
                className={`aspect-[3/4] border transition-all overflow-hidden ${activeImage === i ? 'border-amber-400' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}
              >
                <img src={url} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>

          {/* Main Image - Desktop/Mobile */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[3/4] bg-zinc-900 overflow-hidden relative group">
              <img 
                src={productImages[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              />
            </div>
            
            {/* Mobile Thumbnails */}
            <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {productImages.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-20 aspect-[3/4] border transition-all ${activeImage === i ? 'border-amber-400' : 'border-zinc-800 opacity-60'}`}
                >
                  <img src={url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-6 space-y-10">
            <div>
              <span className="text-xs uppercase tracking-[0.5em] text-amber-400 font-bold mb-4 block">Editorial {product.category}</span>
              <h1 className="text-5xl font-serif italic mb-4 leading-tight">{product.name}</h1>
              <p className="text-2xl font-light text-zinc-300 tracking-tight">${product.price.toLocaleString()}</p>
            </div>

            <div className="border-y border-zinc-900 py-10">
              <p className="text-zinc-400 leading-loose font-light text-sm">
                {product.description || "An editorial masterpiece defined by its silhouette and material choice. This piece reflects Thulodeal's commitment to quiet luxury and timeless design."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-xs uppercase tracking-widest font-bold">Size Grid</h4>
                <button className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-2 hover:text-amber-400 font-bold">
                  <Ruler size={12} /> Fit Guide
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-4 text-xs tracking-widest border transition-all ${
                      selectedSize === size 
                        ? 'border-amber-400 text-amber-400 bg-amber-400/5 font-bold shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-6 bg-white text-black text-xs uppercase tracking-[0.4em] font-black hover:bg-amber-400 transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
              >
                <ShoppingBag size={20} />
                {product.stock > 0 ? 'COMMIT TO BAG' : 'ACQUISITION CLOSED'}
              </button>
              <div className="flex justify-center gap-8 pt-4">
                 <div className="flex flex-col items-center gap-2">
                   <ShieldCheck size={24} className="text-amber-400/60" />
                   <span className="text-[8px] uppercase tracking-widest text-zinc-500">Authentic Record</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                   <Ruler size={24} className="text-amber-400/60" />
                   <span className="text-[8px] uppercase tracking-widest text-zinc-500">Perfect Drape</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
