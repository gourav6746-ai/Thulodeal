
import React from 'react';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif tracking-[0.2em] italic uppercase">THULODEAL</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Defining the future of luxury fashion through editorial curation and timeless aesthetics.
            </p>
            <div className="flex space-x-4">
              <Instagram size={20} className="text-zinc-400 hover:text-amber-400 cursor-pointer" />
              <Twitter size={20} className="text-zinc-400 hover:text-amber-400 cursor-pointer" />
              <Facebook size={20} className="text-zinc-400 hover:text-amber-400 cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-6 font-bold">Shop</h4>
            <ul className="space-y-4 text-sm text-zinc-400 font-light">
              <li className="hover:text-white cursor-pointer">New Arrivals</li>
              <li className="hover:text-white cursor-pointer">Collections</li>
              <li className="hover:text-white cursor-pointer">Men's Editorial</li>
              <li className="hover:text-white cursor-pointer">Women's Lookbook</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-6 font-bold">Support</h4>
            <ul className="space-y-4 text-sm text-zinc-400 font-light">
              <li className="hover:text-white cursor-pointer">Shipping & Returns</li>
              <li className="hover:text-white cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer">Sustainability</li>
              <li className="hover:text-white cursor-pointer">Contact Us</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-6 font-bold">Newsletter</h4>
            <p className="text-sm text-zinc-500 mb-6">Join the inner circle for exclusive editorial previews.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-transparent border-b border-zinc-800 flex-1 py-2 text-xs uppercase tracking-widest focus:outline-none focus:border-amber-400"
              />
              <button className="text-xs uppercase tracking-widest font-bold ml-4 hover:text-amber-400 transition-colors">Join</button>
            </form>
          </div>
        </div>
        
        <div className="text-center pt-10 border-t border-zinc-900">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em]">
            &copy; {new Date().getFullYear()} THULODEAL EDITORIAL. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
