
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product, Order } from '../types';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, Tag, Layers, PlusCircle, ArrowRight } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        const orderSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        
        const products = prodSnap.docs.map(doc => doc.data() as Product);
        const orders = orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
        const totalRev = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalPrice : 0), 0);
        
        setStats({
          products: products.length,
          orders: orders.length,
          revenue: totalRev
        });
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="pt-32 text-center text-zinc-500 uppercase tracking-widest">Loading Analytics...</div>;

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif italic mb-2">Thulodeal Dashboard</h1>
          <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold">Management & Analytics</p>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/add" className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors">
            <PlusCircle size={16} /> New Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-4">
          <Package className="text-amber-400" size={32} />
          <p className="text-zinc-500 uppercase tracking-widest text-[8px] font-bold">Inventory</p>
          <h3 className="text-4xl font-serif italic">{stats.products}</h3>
          <Link to="/admin/products" className="text-[10px] text-amber-400 flex items-center gap-2 hover:underline font-bold uppercase tracking-widest">
            Manage <ArrowRight size={10} />
          </Link>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-4">
          <ShoppingCart className="text-amber-400" size={32} />
          <p className="text-zinc-500 uppercase tracking-widest text-[8px] font-bold">Sales</p>
          <h3 className="text-4xl font-serif italic">{stats.orders}</h3>
          <Link to="/admin/orders" className="text-[10px] text-amber-400 flex items-center gap-2 hover:underline font-bold uppercase tracking-widest">
             Orders <ArrowRight size={10} />
          </Link>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-4">
          <Tag className="text-amber-400" size={32} />
          <p className="text-zinc-500 uppercase tracking-widest text-[8px] font-bold">Discounts</p>
          <h3 className="text-4xl font-serif italic">Promo</h3>
          <Link to="/admin/promos" className="text-[10px] text-amber-400 flex items-center gap-2 hover:underline font-bold uppercase tracking-widest">
             Manage <ArrowRight size={10} />
          </Link>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-4">
          <Layers className="text-amber-400" size={32} />
          <p className="text-zinc-500 uppercase tracking-widest text-[8px] font-bold">Editorial</p>
          <h3 className="text-4xl font-serif italic">Bundles</h3>
          <Link to="/admin/bundles" className="text-[10px] text-amber-400 flex items-center gap-2 hover:underline font-bold uppercase tracking-widest">
             Curate <ArrowRight size={10} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h4 className="text-xs uppercase tracking-widest font-bold">Recent Acquisitions</h4>
            <Link to="/admin/orders" className="text-[10px] text-zinc-500 uppercase hover:text-white">See all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase tracking-widest text-zinc-600 bg-zinc-950">
                <tr>
                  <th className="px-6 py-4 font-normal">Order ID</th>
                  <th className="px-6 py-4 font-normal">Customer</th>
                  <th className="px-6 py-4 font-normal">Total</th>
                  <th className="px-6 py-4 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-zinc-500">#{order.id.slice(-6)}</td>
                    <td className="px-6 py-4">{order.shippingAddress.fullName}</td>
                    <td className="px-6 py-4">${order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full ${
                        order.status === 'Pending' ? 'bg-amber-900/50 text-amber-400' :
                        order.status === 'Shipped' ? 'bg-blue-900/50 text-blue-400' :
                        order.status === 'Delivered' ? 'bg-green-900/50 text-green-400' :
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-6">
              <h4 className="text-xs uppercase tracking-widest font-bold text-amber-400">Marketing Tools</h4>
              <ul className="space-y-4">
                 <li>
                    <Link to="/admin/promos" className="flex items-center justify-between text-xs text-zinc-400 hover:text-white group uppercase tracking-widest font-bold">
                      Promo Code Manager <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                 </li>
                 <li>
                    <Link to="/admin/offers" className="flex items-center justify-between text-xs text-zinc-400 hover:text-white group uppercase tracking-widest font-bold">
                      Special Offers (B2G1) <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                 </li>
                 <li>
                    <Link to="/admin/bundles" className="flex items-center justify-between text-xs text-zinc-400 hover:text-white group uppercase tracking-widest font-bold">
                      Bundle Curator <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                 </li>
              </ul>
           </div>

           <div className="bg-amber-400 p-8 text-black shadow-[0_0_50px_rgba(212,175,55,0.2)]">
              <TrendingUp size={24} className="mb-4" />
              <h4 className="font-serif italic text-2xl mb-2">Editorial Growth</h4>
              <p className="text-[10px] uppercase tracking-widest font-bold leading-relaxed mb-6">
                Optimization tools are active. Monitor promo performance in real-time.
              </p>
              <button className="text-[10px] uppercase tracking-widest font-black border-b-2 border-black">Performance Report</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
