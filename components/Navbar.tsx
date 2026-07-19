'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/40 backdrop-blur-md border-b border-white/5' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-black group-hover:scale-105 transition-transform">
            H
          </div>
          <span className="text-xl font-bold font-display tracking-tighter uppercase">Hórus OS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#recursos" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Recursos
          </Link>
          <Link href="#como-funciona" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Como Funciona
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Acessar Sistema
          </Link>
          <Link href="/dashboard" className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-cyan-400 transition-colors">
            Painel Admin
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-neutral-400"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-0 w-full bg-[#050505] border-b border-white/5 p-6 flex flex-col gap-4 shadow-xl"
        >
          <Link href="#recursos" className="text-base font-medium text-white/60 py-2" onClick={() => setMobileMenuOpen(false)}>Recursos</Link>
          <Link href="#como-funciona" className="text-base font-medium text-white/60 py-2" onClick={() => setMobileMenuOpen(false)}>Como Funciona</Link>
          <Link href="/dashboard" className="text-base font-medium text-white/60 py-2" onClick={() => setMobileMenuOpen(false)}>Acessar Sistema</Link>
          <hr className="border-white/5 my-2" />
          <Link href="/dashboard" className="w-full px-5 py-3 bg-white text-center text-black rounded-xl text-base font-bold" onClick={() => setMobileMenuOpen(false)}>Painel Admin</Link>
        </motion.div>
      )}
    </header>
  );
}
