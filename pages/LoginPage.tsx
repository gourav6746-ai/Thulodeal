
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center opacity-40">
        <h1 className="text-[15vw] font-serif italic text-white/5 tracking-tighter pointer-events-none uppercase">THULODEAL</h1>
      </div>
      
      <div className="relative z-10 w-full max-w-md bg-zinc-900/50 backdrop-blur-md p-10 border border-zinc-800">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif italic mb-2">{isLogin ? 'Welcome Back' : 'Join the Inner Circle'}</h2>
          <p className="text-zinc-500 uppercase tracking-widest text-[10px]">Your editorial journey begins here.</p>
        </div>

        {error && <p className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 text-xs mb-6">{error}</p>}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="jane.doe@thulodeal.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button className="w-full py-4 bg-white text-black text-xs uppercase tracking-[0.3em] font-bold hover:bg-amber-400 transition-all">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-zinc-600 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 border border-zinc-800 flex items-center justify-center gap-3 text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5" />
            Sign in with Google
          </button>
        </div>

        <p className="mt-10 text-center text-zinc-500 text-[10px] uppercase tracking-widest">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="ml-2 text-amber-400 underline font-bold"
          >
            {isLogin ? 'Register Now' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
