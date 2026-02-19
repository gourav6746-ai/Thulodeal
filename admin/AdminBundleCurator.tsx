
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product, Bundle } from '../types';
import { ArrowLeft, Plus, Trash2, Package, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminBundleCurator: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [newBundle, setNewBundle] = useState({ name: '', price: 0, imageURL: '', productIds: [] as string[] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const prodSnap = await getDocs(collection(db, 'products'));
    const bundleSnap = await getDocs(collection(db, 'bundles'));
    setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    setBundles(bundleSnap.docs.map(d => ({ id: d.id, ...d.data() } as Bundle)));
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBundle.productIds.length < 2) return alert("Select at least 2 products for a bundle");
    try {
      await addDoc(collection(db, 'bundles'), {
        ...newBundle,
        active: true,
        createdAt: Date.now()
      });
      // Also add as a special product type
      await addDoc(collection(db, 'products'), {
        name: newBundle.name,
        price: Number(newBundle.price),
        category: 'bundles',
        imageURLs: [newBundle.imageURL],
        description: `Editorial Bundle: Includes ${newBundle.productIds.length} premium pieces.`,
        sizes: ['One Size'],
        stock: 99,
        createdAt: Date.now(),
        isBundle: true,
        bundleItems: newBundle.productIds
      });
      setNewBundle({ name: '', price: 0, imageURL: '', productIds: [] });
      fetchData();
    } catch (err) { alert("Failed to curate bundle"); }
  };

  const toggleProduct = (id: string) => {
    setNewBundle(prev => ({
      ...prev,
      productIds: prev.productIds.includes(id) 
        ? prev.productIds.filter(pid => pid !== id)
        : [...prev.productIds, id]
    }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this bundle?")) return;
    await deleteDoc(doc(db, 'bundles', id));
    fetchData();
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase tracking-widest text-[10px] font-bold">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-zinc-900 border border-zinc-800 p-8 h-fit">
          <h2 className="text-3xl font-serif italic mb-8">Curate Editorial Bundle</h2>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Bundle Title</label>
              <input 
                type="text" required 
                className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xs focus:border-amber-400"
                placeholder="Ex: The Spring Classic Set"
                value={newBundle.name}
                onChange={e => setNewBundle({...newBundle, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Bundle Price ($)</label>
                <input 
                  type="number" required 
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xs focus:border-amber-400"
                  value={newBundle.price}
                  onChange={e => setNewBundle({...newBundle, price: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Cover Image URL</label>
                <input 
                  type="text" required 
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xs focus:border-amber-400"
                  placeholder="https://..."
                  value={newBundle.imageURL}
                  onChange={e => setNewBundle({...newBundle, imageURL: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Select Components ({newBundle.productIds.length})</label>
               <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      className={`w-full p-3 text-left flex items-center gap-4 border transition-all ${newBundle.productIds.includes(p.id) ? 'border-amber-400 bg-amber-400/5' : 'border-zinc-800 bg-zinc-950'}`}
                    >
                      <div className="w-8 h-10 overflow-hidden bg-black flex-shrink-0">
                        <img src={p.imageURLs[0]} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest flex-1">{p.name}</span>
                      {newBundle.productIds.includes(p.id) && <Plus size={14} className="text-amber-400" />}
                    </button>
                  ))}
               </div>
            </div>

            <button type="submit" className="w-full py-5 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-xl">
              Publish Bundle to Shop
            </button>
          </form>
        </div>

        <div className="space-y-8">
           <h3 className="text-xl font-serif italic mb-6 flex items-center gap-3">
             <Layers size={20} className="text-amber-400" /> Active Bundles
           </h3>
           <div className="grid grid-cols-1 gap-4">
             {bundles.map(b => (
               <div key={b.id} className="bg-zinc-900 border border-zinc-800 p-4 flex gap-4 items-center group">
                 <div className="w-16 h-20 bg-zinc-950 overflow-hidden">
                   <img src={b.imageURL} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-xs uppercase tracking-widest font-bold">{b.name}</h4>
                    <p className="text-[10px] text-zinc-500">{b.productIds.length} Items Included</p>
                    <p className="text-amber-400 font-bold mt-1">${b.price}</p>
                 </div>
                 <button onClick={() => handleDelete(b.id)} className="text-zinc-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                 </button>
               </div>
             ))}
             {!loading && bundles.length === 0 && (
               <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 border-dashed text-zinc-600">
                 No bundles curated yet.
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBundleCurator;
