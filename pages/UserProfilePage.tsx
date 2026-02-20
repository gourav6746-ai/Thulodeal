import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { User, ShoppingBag, Lock, LogOut, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile update
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Order))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfile(auth.currentUser, { displayName });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !currentUser?.email) return;
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: 'Current password is incorrect or session expired.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const totalSpent = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.totalPrice || 0), 0);
  const initials = (currentUser?.displayName || currentUser?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-black text-xl font-black font-serif">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-serif italic text-white">{currentUser?.displayName || 'Member'}</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-1">{currentUser?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-red-400 font-black border border-zinc-800 px-5 py-3 hover:border-red-400 transition-all"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-zinc-800 mb-16 border border-zinc-800">
        {[
          { label: 'Total Orders', value: orders.length },
          { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}` },
          { label: 'Active Orders', value: orders.filter(o => o.status === 'Pending' || o.status === 'Shipped').length },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-950 p-8 text-center">
            <p className="text-3xl font-serif italic text-amber-400 mb-2">{stat.value}</p>
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left: Settings */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-4">Account Settings</h3>

          {/* Tabs */}
          {[
            { id: 'profile', label: 'Edit Profile', icon: <User size={14} /> },
            { id: 'password', label: 'Change Password', icon: <Lock size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between px-5 py-4 border transition-all text-[10px] uppercase tracking-widest font-black ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                  : 'border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600'
              }`}
            >
              <span className="flex items-center gap-3">{tab.icon}{tab.label}</span>
              <ChevronRight size={12} />
            </button>
          ))}

          <button
            onClick={() => navigate('/orders')}
            className="w-full flex items-center justify-between px-5 py-4 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all text-[10px] uppercase tracking-widest font-black mt-2"
          >
            <span className="flex items-center gap-3"><ShoppingBag size={14} />Order History</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-10">
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <h2 className="text-2xl font-serif italic text-white">Edit Profile</h2>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">Email Address</label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full bg-zinc-900 border border-zinc-800 p-4 text-sm text-zinc-600 cursor-not-allowed"
                />
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Email cannot be changed here.</p>
              </div>

              {profileMsg && (
                <div className={`flex items-center gap-3 p-4 border text-[10px] uppercase tracking-widest font-bold ${
                  profileMsg.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {profileMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-widest font-black hover:bg-amber-400 transition-all disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-8">
              <h2 className="text-2xl font-serif italic text-white">Change Password</h2>

              {[
                { label: 'Current Password', val: currentPassword, setter: setCurrentPassword },
                { label: 'New Password', val: newPassword, setter: setNewPassword },
                { label: 'Confirm New Password', val: confirmPassword, setter: setConfirmPassword },
              ].map(field => (
                <div key={field.label} className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">{field.label}</label>
                  <input
                    type="password"
                    required
                    value={field.val}
                    onChange={e => field.setter(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              ))}

              {passwordMsg && (
                <div className={`flex items-center gap-3 p-4 border text-[10px] uppercase tracking-widest font-bold ${
                  passwordMsg.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {passwordMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-widest font-black hover:bg-amber-400 transition-all disabled:opacity-50"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
                                                
