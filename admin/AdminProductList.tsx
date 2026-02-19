
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product } from '../types';
import { Trash2, Edit, Plus, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently remove this piece? This action is irreversible.")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 uppercase tracking-widest text-[10px] font-bold">
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-serif italic mb-2">Inventory Manifest</h1>
          <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold">Editorial Collection Management</p>
        </div>
        <Link to="/admin/add" className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors">
          <Plus size={16} /> New Entry
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase tracking-widest text-zinc-600 bg-zinc-950">
              <tr>
                <th className="px-6 py-4 font-normal">Piece</th>
                <th className="px-6 py-4 font-normal">Category</th>
                <th className="px-6 py-4 font-normal">Price</th>
                <th className="px-6 py-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-zinc-500 uppercase tracking-widest font-bold">Scanning Archive...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-zinc-500 italic">Catalog is empty.</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-12 bg-zinc-950 overflow-hidden relative">
                          <img src={product.imageURLs?.[0]} className="w-full h-full object-cover transition-all" />
                          {(product.imageURLs?.length || 0) > 1 && (
                            <div className="absolute bottom-0 right-0 bg-amber-400 text-black text-[6px] px-1 font-bold">+{product.imageURLs.length - 1}</div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-serif text-sm italic">{product.name}</span>
                          <span className="text-[8px] text-zinc-500 font-mono">Stock: {product.stock} units</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase tracking-widest text-[10px] text-zinc-400 font-bold">{product.category}</td>
                    <td className="px-6 py-4 font-light font-bold">${product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link to={`/admin/edit/${product.id}`} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all rounded-sm">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-all rounded-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProductList;
