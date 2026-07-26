'use client';
import Link from 'next/link';
import { BrainCircuit, Menu, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#090A0F]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <BrainCircuit className="w-6 h-6 text-amber-500" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
            HÓRUS OS
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Mission Control</Link>
          <Link href="/dashboard/studio" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Studio</Link>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-nexus-chat'))}
            className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors"
          >
            Falar com Consultor
          </button>
          
          <div className="w-px h-6 bg-white/10"></div>
          
          <Link 
            href="/login"
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            Acessar Sistema <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-white/70 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-20 inset-x-0 bg-[#090A0F] border-b border-white/10 p-6 flex flex-col gap-6 shadow-2xl">
          <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>Mission Control</Link>
          <Link href="/dashboard/studio" className="text-sm font-medium text-white/70 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>Studio</Link>
          
          <button 
            onClick={() => {
              setIsOpen(false);
              window.dispatchEvent(new CustomEvent('open-nexus-chat'));
            }}
            className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors text-left"
          >
            Falar com Consultor
          </button>
          
          <div className="h-px w-full bg-white/10"></div>
          
          <Link 
            href="/login"
            className="px-5 py-3 bg-amber-500 text-black font-bold rounded-lg text-sm text-center shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            onClick={() => setIsOpen(false)}
          >
            Acessar Sistema
          </Link>
        </div>
      )}
    </nav>
  );
}
