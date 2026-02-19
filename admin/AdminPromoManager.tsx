
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PromoCode } from '../types';
import { ArrowLeft, Plus, Trash2, Tag, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPromoManager: React.FC = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [newCode, setNewCode] = useState({ code: '', discount: 10 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    const snap = await getDocs(collection(db, 'promos'));
    setPromos(snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoCode)));
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.code) return;
    try {
      await addDoc(collection(db, 'promos'), {
        code: newCode.code.toUpperCase(),
        discount: Number(newCode.discount),
        isActive: true,
        createdAt: Date.now()
      });
      setNewCode({ code: '', discount: 10 });
      fetchPromos();
    } catch (err) { alert("Failed to add promo"); }
  };

  const toggleStatus = async (id: string, status: boolean) => {
    await updateDoc(doc(db, 'promos', id), { isActive: !status });
    fetchPromos();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this promo?")) return;
    await deleteDoc(doc(db, 'promos', id));
    fetchPromos();
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase tracking-widest text-[10px] font-bold">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-zinc-900 border border-zinc-800 p-8 mb-12">
        <h2 className="text-3xl font-serif italic mb-8">Promo Code Manager</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Code</label>
            <input 
              type="text" required 
              className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xs focus:border-amber-400 uppercase font-bold"
              placeholder="LUXURY20"
              value={newCode.code}
              onChange={e => setNewCode({...newCode, code: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Discount %</label>
            <input 
              type="number" required min="1" max="100"
              className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xs focus:border-amber-400"
              value={newCode.discount}
              onChange={e => setNewCode({...newCode, discount: Number(e.target.value)})}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors">
              Deploy Code
            </button>
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase tracking-widest text-zinc-600 bg-zinc-950">
            <tr>
              <th className="px-6 py-4">Active Promo</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {promos.map(p => (
              <tr key={p.id} className="border-t border-zinc-800">
                <td className="px-6 py-4 font-bold tracking-widest flex items-center gap-3">
                  <Tag size={12} className="text-amber-400" /> {p.code}
                </td>
                <td className="px-6 py-4 text-amber-400 font-bold">{p.discount}%</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(p.id, p.isActive)} className={`flex items-center gap-2 ${p.isActive ? 'text-green-500' : 'text-red-500'}`}>
                    <Power size={12} /> {p.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-zinc-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {!loading && promos.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-zinc-600 italic">No promo codes active.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromoManager;
