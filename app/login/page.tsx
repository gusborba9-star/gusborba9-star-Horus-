'use client';

import { Suspense, useState } from 'react';
import { BrainCircuit, ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || !data.session) {
        throw new Error(authError?.message || 'Não foi possível autenticar.');
      }

      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: data.session.access_token }),
      });
      if (!sessionResponse.ok) throw new Error('Não foi possível estabelecer a sessão segura.');

      const next = searchParams?.get('next');
      router.replace(next?.startsWith('/') ? next : '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha de autenticação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] relative font-sans overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:bg-amber-500/20 transition-all duration-500">
              <BrainCircuit className="w-7 h-7 text-amber-500" />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">HÓRUS OS</h1>
          <p className="text-white/40 text-sm font-light">Autenticação Nexus</p>
        </div>

        <div className="bg-[#090A0F]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2" htmlFor="password">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all text-sm" />
              </div>
            </div>

            {error && <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-4 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 mt-4 text-sm">
              {loading ? 'AUTENTICANDO...' : 'ACESSAR WORKSPACE'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-white/30">Acesso protegido por Supabase Auth + política de autorização Hórus.</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
      <LoginForm />
    </Suspense>
  );
}