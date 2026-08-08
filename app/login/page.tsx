'use client';

import { useEffect, useState } from 'react';
import { BrainCircuit, ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) router.replace('/dashboard/studio');
    });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (!remember) {
      // Supabase's browser client persists the authenticated session by default.
      // Keep the existing client contract unchanged; the checkbox is presentation-only
      // until an explicit session-storage policy is introduced at the auth boundary.
    }

    router.replace('/dashboard/studio');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] relative font-sans overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"></div>

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
              <label htmlFor="email" className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Identificação (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@empresa.com" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Chave de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all text-sm" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer group text-xs">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="sr-only" />
              <span className={`w-4 h-4 rounded border bg-black/50 transition-colors ${remember ? 'border-amber-500 bg-amber-500/20' : 'border-white/20 group-hover:border-amber-500/50'}`} />
              <span className="text-white/50 group-hover:text-white/70 transition-colors">Lembrar sessão</span>
            </label>

            {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-4 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'AUTENTICANDO…' : 'ACESSAR WORKSPACE'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-white/30">
          Acesso autenticado pelo Supabase Auth. O Studio valida a sessão no boundary da API.
        </div>
      </div>
    </div>
  );
}
