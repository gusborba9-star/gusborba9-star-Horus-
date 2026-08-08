'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Revision = {
  id: string;
  project_id: string;
  version: number;
  change_class: string;
  approval_state: string;
  preview?: { status?: string; url?: string | null; verified?: boolean };
  deployment?: Record<string, unknown>;
};
type Project = { id: string; name: string; objective: string };

export default function StudioLifecyclePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function authFetch(path: string, init?: RequestInit) {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) throw new Error('AUTHENTICATION_REQUIRED');
    return fetch(path, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}`, ...(init?.headers ?? {}) } });
  }

  async function load() {
    const response = await authFetch('/api/studio/projects');
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? 'PROJECT_LOAD_FAILED');
    const next = payload.projects ?? [];
    setProjects(next);
    const selected = project && next.find((item: Project) => item.id === project.id) ? project : next[0] ?? null;
    setProject(selected);
    if (selected) {
      const revisionsResponse = await authFetch(`/api/studio/projects/${selected.id}/revisions`);
      const revisionsPayload = await revisionsResponse.json();
      if (!revisionsResponse.ok) throw new Error(revisionsPayload.error ?? 'REVISION_LOAD_FAILED');
      setRevisions(revisionsPayload.revisions ?? []);
    }
  }

  useEffect(() => { void load().catch((error) => setMessage(error instanceof Error ? error.message : 'LOAD_FAILED')); }, []);

  async function callRevision(revision: Revision, action: 'verify' | 'approve') {
    setBusy(`${action}:${revision.id}`);
    setMessage('');
    try {
      const path = action === 'verify'
        ? `/api/studio/projects/${revision.project_id}/revisions/${revision.id}/preview/verify`
        : `/api/studio/projects/${revision.project_id}/revisions/${revision.id}/approval`;
      const response = await authFetch(path, { method: 'POST', body: JSON.stringify(action === 'approve' ? { state: 'APPROVED' } : {}) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `${action.toUpperCase()}_FAILED`);
      setMessage(action === 'verify' ? 'Preview verificado contra o deployment real.' : 'Revision aprovada.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${action.toUpperCase()}_FAILED`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between"><Link href="/dashboard/studio" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white"><ArrowLeft className="w-4 h-4" /> Studio</Link><Link href="/dashboard/studio/connectors" className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-xl border border-white/10 hover:border-[#D4AF37]/30"><ShieldCheck className="w-4 h-4" /> Connectors</Link></div>
        <header><div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Lifecycle</div><h1 className="text-4xl md:text-6xl font-light mt-2">Revision Operations</h1><p className="text-sm text-white/40 mt-3">Ações exibidas aqui chamam somente boundaries reais. Nenhum estado de deployment é fabricado no cliente.</p></header>

        <div className="flex gap-2 flex-wrap">{projects.map((item) => <button key={item.id} onClick={() => { setProject(item); }} className={`px-4 py-2 rounded-xl border text-xs ${project?.id === item.id ? 'border-[#D4AF37]/40 text-[#D4AF37]' : 'border-white/10 text-white/50'}`}>{item.name}</button>)}</div>

        {project && <section className="space-y-4">
          {revisions.map((revision) => {
            const previewReady = revision.preview?.status === 'READY';
            const verified = revision.preview?.verified === true;
            const approved = revision.approval_state === 'APPROVED';
            return <article key={revision.id} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5"><div><div className="text-sm">Revision {revision.version} <span className="text-white/30">· {revision.change_class}</span></div><div className="text-[10px] uppercase tracking-widest text-white/30 mt-2">Approval · {revision.approval_state}</div></div><div className="flex gap-2 flex-wrap">{previewReady && revision.preview?.url ? <a href={revision.preview.url.startsWith('http') ? revision.preview.url : `https://${revision.preview.url}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl border border-white/10 text-[9px] uppercase tracking-widest"><ExternalLink className="w-3 h-3 inline mr-1" /> Preview</a> : null}{previewReady && !verified ? <button disabled={busy === `verify:${revision.id}`} onClick={() => void callRevision(revision, 'verify')} className="px-3 py-2 rounded-xl bg-[#D4AF37] text-black font-bold text-[9px] uppercase tracking-widest">{busy === `verify:${revision.id}` ? 'Verificando…' : 'Verificar Preview'}</button> : null}{verified && !approved ? <button disabled={busy === `approve:${revision.id}`} onClick={() => void callRevision(revision, 'approve')} className="px-3 py-2 rounded-xl bg-[#D4AF37] text-black font-bold text-[9px] uppercase tracking-widest">{busy === `approve:${revision.id}` ? 'Aprovando…' : 'Aprovar Revision'}</button> : null}</div></div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">{[['Planning', true], ['Preview', previewReady], ['Verification', verified], ['Approval', approved], ['Staging', Boolean((revision.deployment as { staging?: { status?: string } } | undefined)?.staging?.status === 'READY')]].map(([label, done]) => <div key={String(label)} className="rounded-2xl border border-white/5 bg-black/20 p-4"><div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/35">{done ? <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" /> : <Circle className="w-3 h-3" />} {String(label)}</div></div>)}</div>
            </article>;
          })}
          {!revisions.length && <div className="text-sm text-white/30">Nenhuma revision neste projeto.</div>}
        </section>}
        {message && <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60 break-all">{message}</div>}
      </div>
    </main>
  );
}
