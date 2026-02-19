
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { ChevronLeft, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { PaymentMethod, PaymentDetails } from '../types';

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({ fullName: '', address: '', city: '', zipCode: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({ senderId: '', transactionId: '', screenshotURL: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const finalTotal = cart.length >= 3 
    ? cartTotal - [...cart].sort((a, b) => a.price - b.price).slice(0, Math.floor(cart.length / 3)).reduce((sum, item) => sum + item.price, 0)
    : cartTotal;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) return alert("File size limit 3MB.");
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!currentUser) return alert("Please log in to finalize your acquisition.");
    if (cart.length === 0) return;
    
    if (paymentMethod !== 'COD') {
      if (!paymentDetails.transactionId || !paymentDetails.senderId) {
        return alert("Please provide Transaction ID and Payer ID.");
      }
      if (!screenshotFile) {
        return alert("Please upload a screenshot of your payment proof.");
      }
    }

    setIsProcessing(true);
    try {
      let url = '';
      if (screenshotFile) {
        try {
          // Using uploadBytes for simpler one-off upload without resumable task hang
          const storageRef = ref(storage, `receipts/${currentUser.uid}_${Date.now()}.jpg`);
          const result = await uploadBytes(storageRef, screenshotFile);
          url = await getDownloadURL(result.ref);
        } catch (uploadError) {
          console.error("Storage Error:", uploadError);
          throw new Error("Payment proof upload failed. Please try a smaller image or check your connection.");
        }
      }

      await addDoc(collection(db, 'orders'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        items: cart,
        totalPrice: finalTotal,
        status: 'Pending',
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Confirmed' : 'Submitted',
        paymentDetails: { ...paymentDetails, screenshotURL: url },
        shippingAddress: shippingInfo,
        createdAt: Date.now(),
      });

      setIsSuccess(true);
      clearCart();
      setTimeout(() => navigate('/orders'), 3000);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong. Please refresh and try again.");
      setIsProcessing(false); // Reset processing state so button is clickable again
    }
  };

  const getPayerLabel = () => {
    switch (paymentMethod) {
      case 'eSewa': return 'Your eSewa ID / Phone Number';
      case 'Khalti': return 'Your Khalti ID / Number';
      case 'Binance': return 'Your Binance Pay ID';
      default: return 'Account / Wallet ID';
    }
  };

  const instr = (() => {
    switch (paymentMethod) {
      case 'eSewa': return { id: '+977-9708324987', label: 'eSewa ID', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=esewa-9708324987' };
      case 'Khalti': return { id: '+977-9708324987', label: 'Khalti ID', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=khalti-9708324987' };
      case 'Binance': return { id: '67469736', label: 'Binance Pay ID', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=67469736' };
      default: return null;
    }
  })();

  if (isSuccess) return (
    <div className="pt-40 text-center space-y-8 px-4 max-w-xl mx-auto">
      <CheckCircle2 size={64} className="text-amber-400 mx-auto animate-bounce" />
      <h1 className="text-4xl font-serif italic text-white uppercase tracking-tighter">Acquisition Recorded</h1>
      <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-black">Transmission complete. Verifying settlement... Redirecting.</p>
    </div>
  );

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-10 text-[10px] uppercase tracking-[0.2em] font-black transition-all">
        <ChevronLeft size={16} /> Return to Archive
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div className="space-y-16">
          <section className="space-y-8">
            <h2 className="text-4xl font-serif italic text-white leading-none">Logistics</h2>
            <form onSubmit={handleSubmitOrder} id="checkout-form" className="space-y-5">
              <input type="text" placeholder="Full Name" required value={shippingInfo.fullName} onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-5 text-xs text-white uppercase tracking-widest focus:border-amber-400" />
              <input type="text" placeholder="Full Street Address" required value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-5 text-xs text-white uppercase tracking-widest focus:border-amber-400" />
              <div className="grid grid-cols-2 gap-5">
                <input type="text" placeholder="City" required value={shippingInfo.city} onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-5 text-xs text-white uppercase tracking-widest focus:border-amber-400" />
                <input type="text" placeholder="Postal Code" required value={shippingInfo.zipCode} onChange={e => setShippingInfo({...shippingInfo, zipCode: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-5 text-xs text-white uppercase tracking-widest focus:border-amber-400" />
              </div>
            </form>
          </section>

          <section className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-serif italic text-white leading-none">Settlement</h2>
              <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-black">Method Selection</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['COD', 'eSewa', 'Khalti', 'Binance'].map(m => (
                <button 
                  key={m} 
                  type="button"
                  onClick={() => { setPaymentMethod(m as any); setErrorMessage(''); }} 
                  className={`p-4 border text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === m ? 'border-amber-400 bg-amber-400/5 text-amber-400' : 'border-zinc-800 text-zinc-600 hover:text-white'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            {paymentMethod !== 'COD' && instr && (
              <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-8 animate-fade-in shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-8 items-center border-b border-zinc-800 pb-8">
                  <div className="w-40 h-40 bg-white p-2 flex-shrink-0 shadow-xl">
                    <img src={instr.qr} className="w-full h-full object-contain" alt="QR Code" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mb-2">{instr.label}</p>
                    <p className="text-2xl font-bold text-amber-400 tracking-tighter">{instr.id}</p>
                    <p className="text-[8px] text-zinc-600 uppercase mt-4 tracking-widest font-bold">SCAN OR TRANSFER DIRECTLY</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">{getPayerLabel()}</label>
                    <input type="text" placeholder="e.g. 98XXXXXXXX / User ID" required value={paymentDetails.senderId} onChange={e => setPaymentDetails({...paymentDetails, senderId: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xs text-white tracking-widest focus:border-amber-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">TRANSACTION ID (TXID)</label>
                    <input type="text" placeholder="Unique Transfer ID" required value={paymentDetails.transactionId} onChange={e => setPaymentDetails({...paymentDetails, transactionId: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xs text-white tracking-widest focus:border-amber-400" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">SCREENSHOT PROOF</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full bg-zinc-950 border-2 border-dashed border-zinc-800 p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-amber-400/40 transition-all group">
                      {screenshotPreview ? (
                        <div className="relative w-full max-h-64 flex justify-center">
                           <img src={screenshotPreview} className="max-h-64 object-contain shadow-2xl" alt="Preview" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <span className="text-[10px] uppercase tracking-widest text-white font-black">Change Image</span>
                           </div>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} className="text-zinc-700 group-hover:text-amber-400 transition-all" />
                          <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-black">Tap to Upload Receipt (Max 3MB)</span>
                        </>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="lg:sticky lg:top-32 h-fit bg-zinc-900 border border-zinc-800 p-10 space-y-8 shadow-2xl">
          <h3 className="text-2xl font-serif italic text-white border-b border-zinc-800 pb-5 uppercase tracking-widest text-center">Invoiced Summary</h3>
          
          <div className="space-y-4">
             <div className="flex justify-between text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                <span>Gross Value</span>
                <span>${cartTotal.toLocaleString()}</span>
             </div>
             {finalTotal !== cartTotal && (
               <div className="flex justify-between text-green-500 text-[10px] uppercase tracking-widest font-black">
                  <span>Acquisition Reward</span>
                  <span>-${(cartTotal - finalTotal).toLocaleString()}</span>
               </div>
             )}
             <div className="flex justify-between text-3xl font-serif text-white pt-6 border-t border-zinc-800">
               <span>Total</span>
               <span className="text-amber-400 font-bold tracking-tighter">${finalTotal.toLocaleString()}</span>
             </div>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 flex gap-3 items-center">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <button 
            form="checkout-form" 
            type="submit" 
            disabled={isProcessing} 
            className="w-full py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-amber-400 transition-all disabled:opacity-50 shadow-xl"
          >
            {isProcessing ? 'SYNCHRONIZING...' : 'FINALIZE ACQUISITION'}
          </button>
          
          <div className="text-center">
            <p className="text-[8px] text-zinc-600 uppercase tracking-[0.3em] font-black">Encryption Enabled / Verified Settlement</p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
