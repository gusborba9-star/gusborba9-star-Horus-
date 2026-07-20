'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import BackButton from '@/components/BackButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating authentication delay
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 mb-4">
        <BackButton label="Voltar para a Home" fallbackHref="/" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center font-bold text-black mb-4 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <BrainCircuit className="w-8 h-8" />
            </Link>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white">Acessar Hórus OS</h1>
            <p className="text-white/50 text-sm mt-2 text-center">Entre no centro de comando da sua força de trabalho digital.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500/50" />
                <span className="text-white/60 hover:text-white transition-colors">Lembrar de mim</span>
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Esqueceu a senha?</a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/50">
            Não possui uma conta? <a href="/#precos" className="text-white font-semibold hover:text-cyan-400 transition-colors">Veja nossos planos</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
