
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Order, PaymentStatus } from '../types';
import { Package, ShieldCheck, Wallet, Bitcoin, Clock, CheckCircle, Truck } from 'lucide-react';

const OrderHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        const sortedOrders = fetchedOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Firestore Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  const getStatusStep = (pStatus: PaymentStatus) => {
    switch (pStatus) {
      case 'Submitted': return 1;
      case 'Verifying': return 2;
      case 'Confirmed': return 3;
      default: return 1;
    }
  };

  const totalInvestment = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? (o.totalPrice || 0) : 0), 0);

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h1 className="text-4xl font-serif italic mb-2 uppercase tracking-tighter text-white">Acquisition Tracker</h1>
          <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold">Monitor Your Editorial Investment</p>
        </div>
        
        {!loading && orders.length > 0 && (
          <div className="flex gap-10 border-l border-zinc-800 pl-8">
             <div>
                <p className="text-[8px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Total Orders</p>
                <p className="text-2xl font-serif italic text-white">{orders.length}</p>
             </div>
             <div>
                <p className="text-[8px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Investment</p>
                <p className="text-2xl font-serif italic text-amber-400">${totalInvestment.toLocaleString()}</p>
             </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-12">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-900 h-64 border border-zinc-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-32 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-sm">
          <Package size={40} className="text-zinc-800 mx-auto mb-6" />
          <p className="text-zinc-500 italic mb-8">No pieces currently in your personal archive.</p>
          <a href="#/shop" className="px-10 py-4 bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-amber-400 transition-all">Curate Collection</a>
        </div>
      ) : (
        <div className="space-y-16">
          {orders.map(order => {
            const currentStep = getStatusStep(order.paymentStatus);
            return (
              <div key={order.id} className="bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                {/* Visual Tracker */}
                <div className="p-8 border-b border-zinc-800 bg-zinc-950/40">
                   <div className="flex justify-between items-center mb-10 max-w-2xl mx-auto relative">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
                      <div className="absolute top-1/2 left-0 h-0.5 bg-amber-400 -translate-y-1/2 z-0 transition-all duration-1000" 
                           style={{ width: `${((currentStep - 1) / 2) * 100}%` }} />
                      
                      {[1, 2, 3].map((step) => (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                           <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${currentStep >= step ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}>{step}</div>
                           <span className={`text-[8px] uppercase tracking-widest font-black ${currentStep >= step ? 'text-amber-400' : 'text-zinc-600'}`}>
                             {step === 1 ? 'Submitted' : step === 2 ? 'Verifying' : 'Confirmed'}
                           </span>
                        </div>
                      ))}
                   </div>

                   <div className="text-center">
                      {order.paymentStatus === 'Submitted' && <p className="text-amber-400 text-[10px] uppercase tracking-widest font-bold animate-pulse">Awaiting Manual Verification</p>}
                      {order.paymentStatus === 'Verifying' && <p className="text-amber-400 text-[10px] uppercase tracking-widest font-bold italic">Checking Transaction ID...</p>}
                      {order.paymentStatus === 'Confirmed' && (
                        <div className="flex items-center justify-center gap-2 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                           <ShieldCheck size={14} /> Acquisition Securely Verified
                        </div>
                      )}
                   </div>
                </div>

                <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Order ID</p>
                    <p className="text-xs font-mono font-bold">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Method</p>
                    <div className="flex items-center gap-2 text-xs uppercase font-bold text-zinc-300">
                       {order.paymentMethod === 'Binance' ? <Bitcoin size={12} className="text-yellow-500" /> : <Wallet size={12} />}
                       {order.paymentMethod}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Investment</p>
                    <p className="text-xs font-bold text-amber-400">${order.totalPrice?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Fulfillment</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-white">{order.status}</p>
                  </div>
                </div>

                <div className="p-8 border-t border-zinc-800 bg-zinc-950/20 space-y-6">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-center">
                      <div className="w-16 h-20 bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                        <img src={item.imageURLs?.[0] || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-serif italic text-white">{item.name}</h4>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                        <p className="text-xs font-light text-zinc-400">${item.price?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
