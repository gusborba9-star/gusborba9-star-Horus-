'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const PROJECT_ID = 'prj_xQDty1690tXrnIWH4IIHOOXWF7CG';
const REPO_ID = 1305414552;

export default function StudioConnectorsPage() {
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [created, setCreated] = useState(false);

  async function createVercelConnector() {
    if (!secret.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('AUTHENTICATION_REQUIRED');
      const response = await fetch('/api/studio/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          provider: 'vercel',
          permissions: ['DEPLOY_PREVIEW'],
          project_id: null,
          label: 'Hórus Studio Vercel Preview',
          metadata: { vercelProjectId: PROJECT_ID, repoId: REPO_ID, ref: 'main' },
          secret,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'CONNECTOR_CREATION_FAILED');
      setSecret('');
      setCreated(true);
      setMessage(`Connector conectado: ${payload.connector.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'CONNECTOR_CREATION_FAILED');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 lg:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/dashboard/studio" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white"><ArrowLeft className="w-4 h-4" /> Voltar ao Studio</Link>
        <header>
          <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase"><ShieldCheck className="w-4 h-4" /> Connector Authorization</div>
          <h1 className="text-3xl md:text-5xl font-light mt-3">Vercel Preview</h1>
          <p className="text-sm text-white/40 mt-4 leading-relaxed">A credencial é enviada somente ao endpoint autenticado do Studio e armazenada no Vault server-side. Ela não é persistida no React nem retornada pela API.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4"><div className="text-white/30 uppercase tracking-widest text-[9px]">Vercel Project</div><div className="mt-2 font-mono">{PROJECT_ID}</div></div>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4"><div className="text-white/30 uppercase tracking-widest text-[9px]">GitHub Repo ID</div><div className="mt-2 font-mono">{REPO_ID}</div></div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Vercel credential</label>
            <input type="password" autoComplete="off" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Cole a credencial autorizada" className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/40" />
          </div>
          <div className="rounded-2xl border border-[#D4AF37]/10 bg-[#D4AF37]/[0.03] p-4 text-xs text-white/50">Permission única nesta etapa: <strong className="text-white/70">DEPLOY_PREVIEW</strong>. O provider permanece isolado do fluxo de execução.</div>
          <button disabled={busy || !secret.trim() || created} onClick={() => void createVercelConnector()} className="w-full rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest py-3 disabled:opacity-40 flex items-center justify-center gap-2">{created ? <><CheckCircle2 className="w-4 h-4" /> Connector conectado</> : busy ? 'Conectando…' : 'Conectar Vercel'}</button>
          {message && <div className="text-xs text-white/60 break-all">{message}</div>}
        </section>
      </div>
    </main>
  );
}
