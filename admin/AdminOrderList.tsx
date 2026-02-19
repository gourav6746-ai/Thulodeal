
import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { ArrowLeft, CheckCircle, Truck, ExternalLink, ShieldCheck, Clock, ChevronDown, ChevronUp, Package, MapPin, Eye, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) { alert("Update failed"); }
  };

  const updatePaymentStatus = async (orderId: string, newPStatus: PaymentStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentStatus: newPStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newPStatus } : o));
      alert(`Status updated to: ${newPStatus}`);
    } catch (err) { alert("Update failed"); }
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case 'eSewa': return <span className="text-green-400 font-black">eSewa</span>;
      case 'Khalti': return <span className="text-purple-400 font-black">Khalti</span>;
      case 'Binance': return <span className="text-yellow-500 font-black">Binance</span>;
      default: return <span className="text-zinc-500 font-black">COD</span>;
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 uppercase tracking-widest text-[10px] font-bold">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <h1 className="text-4xl font-serif italic mb-2 uppercase tracking-tighter text-white leading-none">Acquisition Ledger</h1>
        <p className="text-zinc-500 uppercase tracking-[0.4em] text-[10px] font-black">Verifying Worldwide Editorial Requests</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-24 uppercase tracking-[0.5em] text-zinc-700 animate-pulse font-black text-xs">Scanning Digital Archive...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 border-dashed text-zinc-600 italic uppercase tracking-widest text-[10px]">Archive empty. No orders recorded.</div>
        ) : orders.map(order => (
          <div key={order.id} className={`bg-zinc-900 border transition-all overflow-hidden ${selectedOrderId === order.id ? 'border-amber-400 shadow-2xl' : 'border-zinc-800'}`}>
            <div 
              onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
              className="p-6 cursor-pointer flex flex-wrap items-center justify-between gap-6 hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex items-center gap-6">
                 <div className="bg-zinc-950 p-3 border border-zinc-800 shadow-inner">
                    <Package className="text-amber-400" size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-mono text-zinc-500 mb-1">RECORD: #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs font-black uppercase tracking-widest text-white">{order.shippingAddress?.fullName || 'N/A'}</p>
                 </div>
              </div>

              <div className="flex items-center gap-10">
                 <div className="text-center hidden sm:block">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-500 mb-2 font-black">Settlement</p>
                    <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-sm ${
                      order.paymentStatus === 'Confirmed' ? 'bg-green-900/50 text-green-400 border border-green-500/20' :
                      order.paymentStatus === 'Verifying' ? 'bg-amber-900/50 text-amber-400 border border-amber-500/20' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {order.paymentStatus}
                    </span>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-500 mb-2 font-black">Total Invoiced</p>
                    <p className="text-sm font-bold text-amber-400 tracking-tighter">${order.totalPrice?.toLocaleString()}</p>
                 </div>
                 <div className="text-zinc-700">
                    {selectedOrderId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </div>
              </div>
            </div>

            {selectedOrderId === order.id && (
              <div className="border-t border-zinc-800 bg-zinc-950/40 p-8 grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                 <div className="lg:col-span-7 space-y-8">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-black mb-6 flex items-center gap-2">
                        <Eye size={16} /> ACQUISITION BREAKDOWN
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="bg-zinc-900 p-4 border border-zinc-800 flex gap-5 items-center shadow-lg group">
                              <div className="w-16 h-20 bg-black flex-shrink-0 border border-zinc-800 overflow-hidden">
                                  <img src={item.imageURLs?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                              </div>
                              <div className="flex-1">
                                  <h4 className="text-xs font-serif italic text-white mb-1">{item.name}</h4>
                                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">SIZE: {item.selectedSize} | QTY: {item.quantity}</p>
                                  <p className="text-[10px] text-amber-400/80 mt-1 font-bold">${item.price?.toLocaleString()}</p>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>

                    {order.paymentDetails?.screenshotURL && (
                       <div className="pt-6 border-t border-zinc-900">
                          <h3 className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-black mb-6 flex items-center gap-2">
                             <ImageIcon size={16} /> SETTLEMENT PROOF
                          </h3>
                          <div className="flex flex-col md:flex-row gap-8">
                             <div className="w-full md:w-48 aspect-[3/4] bg-zinc-900 border border-zinc-800 overflow-hidden relative group shadow-2xl">
                                <img src={order.paymentDetails.screenshotURL} className="w-full h-full object-contain" alt="Payment Proof" />
                                <a href={order.paymentDetails.screenshotURL} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                                   <ExternalLink size={24} className="text-white" />
                                </a>
                             </div>
                             <div className="flex-1 space-y-4">
                                <div className="p-4 bg-zinc-900 border border-zinc-800 shadow-inner">
                                   <p className="text-[8px] uppercase tracking-widest text-zinc-500 mb-2 font-black">Transfer Method</p>
                                   <p className="text-xs uppercase tracking-[0.2em]">{getPaymentBadge(order.paymentMethod)}</p>
                                </div>
                                <div className="p-4 bg-zinc-900 border border-zinc-800 shadow-inner">
                                   <p className="text-[8px] uppercase tracking-widest text-zinc-500 mb-2 font-black">Sender Wallet/Phone</p>
                                   <p className="text-xs font-black text-white tracking-widest">{order.paymentDetails.senderId || 'NOT PROVIDED'}</p>
                                </div>
                                <div className="p-4 bg-zinc-900 border border-zinc-800 shadow-inner">
                                   <p className="text-[8px] uppercase tracking-widest text-zinc-500 mb-2 font-black">Blockchain/Transaction ID</p>
                                   <p className="text-[11px] font-mono text-amber-400 break-all leading-tight font-black">{order.paymentDetails.transactionId}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="lg:col-span-5 space-y-8">
                    <div className="bg-zinc-900 p-6 border border-zinc-800 shadow-2xl">
                       <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black border-b border-zinc-800 pb-4 mb-6 flex items-center gap-2">
                          <MapPin size={16} /> LOGISTICS DATA
                       </h3>
                       <div className="text-[11px] leading-relaxed tracking-[0.1em] text-zinc-300 space-y-2">
                          <p className="text-white font-black text-sm mb-1">{order.shippingAddress?.fullName}</p>
                          <p className="font-bold">{order.shippingAddress?.address}</p>
                          <p className="font-bold">{order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</p>
                       </div>
                    </div>

                    <div className="bg-zinc-900 p-6 border border-zinc-800 space-y-4 shadow-2xl">
                       <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black border-b border-zinc-800 pb-4 mb-4">CONCIERGE CONTROL</h3>
                       <div className="grid grid-cols-1 gap-3">
                          <button onClick={() => updatePaymentStatus(order.id, 'Confirmed')} className="w-full py-3 bg-green-900/40 text-green-400 border border-green-500/20 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all">
                             VERIFY SETTLEMENT
                          </button>
                          <button onClick={() => updatePaymentStatus(order.id, 'Verifying')} className="w-full py-3 bg-amber-900/40 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-800 transition-all">
                             MARK AS VERIFYING
                          </button>
                          <div className="h-px bg-zinc-800 my-2" />
                          <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="w-full py-3 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-700 transition-all">
                             DISPATCH PACKAGE
                          </button>
                          <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all">
                             CLOSE ACQUISITION
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.35s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminOrderList;
