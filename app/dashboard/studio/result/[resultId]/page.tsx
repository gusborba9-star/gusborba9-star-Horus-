'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Result {
  id: string;
  capability: string;
  result_type: string;
  status: string;
  content_text: string | null;
  artifact_url: string | null;
}

export default function StudioResultPage({ params }: { params: Promise<{ resultId: string }> }) {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void params.then(async ({ resultId }) => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) { if (active) { setError('AUTHENTICATION_REQUIRED'); setLoading(false); } return; }
      const response = await fetch(`/api/studio/results/${resultId}`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!active) return;
      if (!response.ok) setError(payload.error ?? 'RESULT_LOAD_FAILED');
      else setResult(payload.result);
      setLoading(false);
    });
    return () => { active = false; };
  }, [params]);

  if (loading) return <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center text-sm text-white/40">Carregando resultado…</main>;
  if (error || !result) return <main className="min-h-screen bg-[#080808] text-white p-8"><div className="max-w-4xl mx-auto rounded-3xl border border-white/10 p-8"><p className="text-sm text-red-300">{error || 'RESULT_NOT_FOUND'}</p><button onClick={() => router.push('/dashboard/studio')} className="mt-6 text-xs uppercase tracking-widest text-[#D4AF37]">Voltar ao Studio</button></div></main>;

  return <main className="min-h-screen bg-[#080808] text-white p-6 lg:p-10"><div className="max-w-5xl mx-auto space-y-6">
    <header className="flex items-center justify-between"><button onClick={() => router.push('/dashboard/studio')} className="flex items-center gap-2 text-xs text-white/50 hover:text-white"><ArrowLeft className="w-4 h-4" /> Studio</button><div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]"><Sparkles className="w-4 h-4" /> Resultado Nexus</div></header>
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6"><div><div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{result.capability}</div><h1 className="text-2xl font-light mt-2">Preview do resultado</h1></div><span className="text-[10px] uppercase tracking-widest text-emerald-300">{result.status}</span></div>
      {result.result_type === 'IMAGE' && result.artifact_url ? <div className="rounded-2xl overflow-hidden border border-white/10 bg-black"><img src={result.artifact_url} alt="Resultado gerado pelo Nexus" className="w-full max-h-[720px] object-contain" /></div> : result.content_text ? <pre className="whitespace-pre-wrap rounded-2xl bg-black/40 border border-white/10 p-5 text-sm leading-relaxed">{result.content_text}</pre> : <div className="rounded-2xl border border-white/10 p-10 text-sm text-white/40">O provider não retornou um conteúdo visualizável.</div>}
      <div className="flex flex-wrap gap-3 mt-6"><button onClick={() => router.push('/dashboard/studio')} className="px-4 py-3 rounded-xl border border-white/10 text-xs uppercase tracking-widest text-white/60">Refinar</button><button onClick={() => window.location.reload()} className="px-4 py-3 rounded-xl border border-white/10 text-xs uppercase tracking-widest text-white/60"><RefreshCw className="w-4 h-4 inline mr-2" />Gerar novamente</button><button onClick={() => router.push('/dashboard/studio')} className="px-5 py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest">Aprovar</button></div>
    </section>
  </div></main>;
}
