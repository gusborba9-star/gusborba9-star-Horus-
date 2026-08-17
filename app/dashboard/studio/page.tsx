'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Archive, ArrowUp, Check, ChevronDown, Code2, Copy, FileText, FolderOpen,
  Image as ImageIcon, Link2, Menu, MoreHorizontal, Music2, Pencil,
  RefreshCw, Settings2, Sparkles, Video, Wand2, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Project = {
  id: string;
  name: string;
  objective: string;
  status: string;
  environment: string;
  capabilities: string[];
  updated_at: string;
};
type Revision = {
  id: string;
  version: number;
  approval_state: string;
  preview?: { resultId?: string };
  created_at: string;
};
type Result = {
  id: string;
  capability: string;
  result_type: string;
  status: string;
  content_text: string | null;
  artifact_url: string | null;
};
type Message = { id: string; role: 'user' | 'nexus'; text: string };

const nav = [
  ['Studio', '/dashboard/studio', Sparkles],
  ['Projetos', '/dashboard/projects', FolderOpen],
  ['Arquivos', '/dashboard/library', FileText],
  ['Codex', '/dashboard/studio/code', Code2],
  ['Conectores', '/dashboard/studio/connectors', Link2],
  ['Integrações', '/dashboard/integrations', Link2],
  ['Histórico', '/dashboard/logs', Archive],
  ['Configurações', '/dashboard/settings', Settings2],
] as const;

const examples = [
  'Crie uma imagem cinematográfica de uma mulher andando na chuva.',
  'Preciso de uma landing page para uma clínica.',
  'Analise estes documentos e produza um relatório executivo.',
  'Quero criar um jogo mobile de estratégia.',
];

const kind = (r?: Result | null) => {
  const value = String(r?.result_type ?? r?.capability ?? '').toUpperCase();
  if (value.includes('IMAGE')) return 'IMAGE';
  if (value.includes('VIDEO')) return 'VIDEO';
  if (value.includes('AUDIO') || value.includes('MUSIC')) return 'AUDIO';
  if (value.includes('CODE') || value.includes('DEV')) return 'CODE';
  return 'TEXT';
};

const status = (value?: string) => ({
  PLANNING: 'Entendendo',
  READY: 'Pronto',
  EXECUTING: 'Criando',
  REVIEW: 'Revisando',
  STAGED: 'Pronto para usar',
  DELIVERED: 'Concluído',
  ARCHIVED: 'Arquivado',
} as Record<string, string>)[value ?? ''] ?? 'Em preparação';

function Viewer({ result }: { result: Result }) {
  const type = kind(result);
  if (type === 'IMAGE' && result.artifact_url) {
    return <div className="overflow-hidden rounded-2xl bg-black/50"><img src={result.artifact_url} alt="Resultado criado pelo Hórus" className="mx-auto max-h-[68vh] max-w-full object-contain" /></div>;
  }
  if (type === 'VIDEO' && result.artifact_url) {
    return <video controls className="mx-auto max-h-[68vh] w-full rounded-2xl bg-black/50" src={result.artifact_url} />;
  }
  if (type === 'AUDIO' && result.artifact_url) {
    return <div className="rounded-2xl border border-white/[.07] bg-black/30 p-8"><Music2 className="mb-5 h-8 w-8 text-white/50" /><audio controls className="w-full" src={result.artifact_url} /></div>;
  }
  if (type === 'CODE') {
    return <pre className="max-h-[68vh] overflow-auto rounded-2xl bg-black/60 p-5 text-sm leading-7 text-white/75">{result.content_text ?? ''}</pre>;
  }
  return <article className="max-h-[68vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-black/30 p-6 text-[15px] leading-7 text-white/80">{result.content_text ?? 'Resultado sem conteúdo disponível.'}</article>;
}

export default function StudioHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [request, setRequest] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [mobile, setMobile] = useState(false);
  const [projectMenu, setProjectMenu] = useState(false);
  const [rename, setRename] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const idRef = useRef<string | null>(null);
  const input = useRef<HTMLTextAreaElement | null>(null);

  const auth = useCallback(async (path: string, init?: RequestInit) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw Error('AUTHENTICATION_REQUIRED');
    return fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }, []);

  const select = useCallback((project: Project | null) => {
    idRef.current = project?.id ?? null;
    setSelected(project);
    setResult(null);
    setRevisions([]);
    setMessages([]);
    setNotice('');
    setProjectMenu(false);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await auth('/api/studio/projects');
      const payload = await response.json();
      if (!response.ok) throw Error(payload.error ?? 'PROJECT_LOAD_FAILED');
      const list: Project[] = payload.projects ?? [];
      setProjects(list);
      const current = list.find(project => project.id === idRef.current) ?? (!idRef.current ? list[0] : null);
      if (current && !idRef.current) select(current);
      if (!current && idRef.current) {
        idRef.current = null;
        setSelected(null);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'PROJECT_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, [auth, select]);

  const state = useCallback(async (projectId: string) => {
    try {
      const projectResponse = await auth(`/api/studio/projects/${projectId}`);
      const projectPayload = await projectResponse.json();
      if (projectResponse.ok && projectPayload.project) setSelected(projectPayload.project);

      const revisionsResponse = await auth(`/api/studio/projects/${projectId}/revisions`);
      const revisionsPayload = await revisionsResponse.json();
      if (!revisionsResponse.ok) return;
      const items: Revision[] = revisionsPayload.revisions ?? [];
      setRevisions(items);
      const resultId = items[0]?.preview?.resultId;
      if (resultId) {
        const resultResponse = await auth(`/api/studio/results/${resultId}`);
        const resultPayload = await resultResponse.json();
        if (resultResponse.ok && resultPayload.result) setResult(resultPayload.result);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'PROJECT_STATE_LOAD_FAILED');
    }
  }, [auth]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (selected?.id) void state(selected.id); }, [selected?.id, state]);

  async function run(text = request) {
    const clean = text.trim();
    if (!clean || busy) return;
    setBusy(true);
    setNotice('');
    setRequest('');
    setMessages(messagesValue => [...messagesValue, { id: `u${Date.now()}`, role: 'user', text: clean }]);

    try {
      let currentProject = selected;
      if (!currentProject) {
        const response = await auth('/api/studio/projects', {
          method: 'POST',
          body: JSON.stringify({
            name: clean.length > 58 ? `${clean.slice(0, 55).trim()}…` : clean,
            objective: clean,
          }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.project?.id) throw Error(payload.error ?? 'PROJECT_CREATE_FAILED');
        currentProject = payload.project as Project;
        idRef.current = currentProject.id;
        setSelected(currentProject);
        setProjects(value => [currentProject as Project, ...value]);
      }

      if (!currentProject?.id) throw Error('PROJECT_CREATE_FAILED');
      const projectId = currentProject.id;
      const response = await auth(`/api/studio/projects/${projectId}/nexus`, {
        method: 'POST',
        body: JSON.stringify({ message: clean }),
      });
      const payload = await response.json();
      if (!response.ok) throw Error(payload.error ?? 'NEXUS_RESULT_FAILED');
      setMessages(messagesValue => [...messagesValue, {
        id: `n${Date.now()}`,
        role: 'nexus',
        text: payload.result ? 'Entendido. Preparei uma nova versão do resultado.' : payload.nexus?.message ?? 'Entendido. Preciso de mais contexto antes de criar o resultado.',
      }]);
      if (payload.result) setResult(payload.result);
      await state(projectId);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'NEXUS_RESULT_FAILED');
      setMessages(messagesValue => [...messagesValue, { id: `e${Date.now()}`, role: 'nexus', text: 'Não consegui concluir esta etapa. Tente novamente.' }]);
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    if (!selected || !revisions[0] || busy || revisions[0].approval_state === 'APPROVED') return;
    setBusy(true);
    try {
      const response = await auth(`/api/studio/projects/${selected.id}/revisions/${revisions[0].id}/approval`, {
        method: 'POST',
        body: JSON.stringify({ state: 'APPROVED' }),
      });
      const payload = await response.json();
      if (!response.ok) throw Error(payload.error ?? 'APPROVAL_FAILED');
      setNotice('Resultado aprovado.');
      await state(selected.id);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'APPROVAL_FAILED');
    } finally {
      setBusy(false);
    }
  }

  async function renameProject() {
    if (!selected || !renameValue.trim() || busy) return;
    setBusy(true);
    try {
      const response = await auth(`/api/studio/projects/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.project) throw Error(payload.error ?? 'PROJECT_RENAME_FAILED');
      setSelected(payload.project);
      setProjects(value => value.map(project => project.id === selected.id ? payload.project : project));
      setRename(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'PROJECT_RENAME_FAILED');
    } finally {
      setBusy(false);
    }
  }

  const resultKind = kind(result);
  const approved = revisions[0]?.approval_state === 'APPROVED';

  const composer = (refine = false) => (
    <form onSubmit={(event: FormEvent) => { event.preventDefault(); void run(); }} className={`${refine ? 'sticky bottom-3 z-10 mt-7' : 'mt-10'} w-full max-w-3xl rounded-[28px] border border-white/[.11] bg-[#0d0d0d] p-2 text-left shadow-2xl shadow-black/40 backdrop-blur-xl`}>
      <textarea ref={input} value={request} onChange={event => setRequest(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void run(); } }} rows={refine ? 3 : 4} placeholder={refine ? 'Refine ou descreva o próximo passo…' : 'Descreva qualquer coisa que você queira criar, analisar, transformar ou executar…'} className="min-h-[90px] w-full resize-none bg-transparent px-4 py-3 text-sm leading-7 outline-none placeholder:text-white/25 sm:text-base" />
      <div className="flex justify-end px-2 pb-1"><button type="submit" disabled={busy || !request.trim()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black disabled:opacity-30">{busy ? 'Preparando…' : 'Criar preview'}<ArrowUp className="h-4 w-4" /></button></div>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <div className="flex min-h-screen">
        <aside className={`${mobile ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'} w-[248px] shrink-0 flex-col border-r border-white/[.07] bg-[#090909] lg:flex`}>
          <div className="flex h-16 items-center justify-between border-b border-white/[.06] px-5"><a href="/dashboard/studio" className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Sparkles className="h-4 w-4" /></span><span className="text-sm font-semibold">Studio Hórus</span></a><button type="button" onClick={() => setMobile(false)} className="p-2 text-white/40 lg:hidden" aria-label="Fechar"><X className="h-4 w-4" /></button></div>
          <nav className="flex-1 space-y-1 p-3">{nav.map(([label, href, Icon]) => <a key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${label === 'Studio' ? 'bg-white/[.08] text-white' : 'text-white/45 hover:bg-white/[.05] hover:text-white'}`}><Icon className="h-4 w-4" />{label}</a>)}</nav>
          <div className="border-t border-white/[.06] p-4"><p className="text-xs font-medium">Nexus</p><p className="mt-1 text-[11px] leading-5 text-white/35">Você descreve o resultado. O Hórus conduz o trabalho.</p></div>
        </aside>
        {mobile && <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMobile(false)} aria-label="Fechar menu" />}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[.06] bg-[#060606]/90 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex min-w-0 items-center gap-2"><button type="button" onClick={() => setMobile(true)} className="p-2 text-white/60 lg:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></button><button type="button" onClick={() => setProjectMenu(value => !value)} className="flex items-center gap-1 text-sm lg:hidden">{selected?.name ?? 'Studio'}<ChevronDown className="h-3.5 w-3.5 text-white/30" /></button><div className="hidden items-center gap-2 text-sm lg:flex"><Sparkles className="h-4 w-4 text-white/55" /><span className="text-white/50">Studio</span>{selected && <><span className="text-white/15">/</span><span className="max-w-[360px] truncate">{selected.name}</span></>}</div></div>
            <div className="flex gap-1"><button type="button" onClick={() => void load()} className="p-2.5 text-white/40 hover:text-white" aria-label="Atualizar"><RefreshCw className="h-4 w-4" /></button>{selected && <button type="button" onClick={() => { setRenameValue(selected.name); setRename(true); }} className="p-2.5 text-white/40 hover:text-white" aria-label="Renomear projeto"><Pencil className="h-4 w-4" /></button>}<button type="button" onClick={() => setProjectMenu(value => !value)} className="p-2.5 text-white/40 hover:text-white" aria-label="Projetos"><MoreHorizontal className="h-4 w-4" /></button></div>
          </header>

          {projectMenu && <div className="border-b border-white/[.06] bg-[#0a0a0a] p-3 lg:hidden">{projects.map(project => <button type="button" key={project.id} onClick={() => select(project)} className={`block w-full rounded-xl p-3 text-left ${selected?.id === project.id ? 'bg-white/[.07]' : ''}`}><div className="truncate text-sm">{project.name}</div><div className="mt-1 truncate text-[11px] text-white/35">{project.objective}</div></button>)}</div>}

          <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
            {!selected ? (
              <section className="mx-auto flex min-h-[calc(100vh-150px)] max-w-5xl flex-col items-center justify-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[.04]"><Wand2 className="h-6 w-6" /></div>
                <p className="mt-6 text-[11px] uppercase tracking-[.3em] text-white/30">Studio Hórus™</p>
                <h1 className="mt-4 text-4xl font-medium tracking-[-.055em] sm:text-6xl lg:text-7xl">Crie qualquer coisa.</h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">Você descreve o resultado. O Nexus entende a intenção, preserva o contexto e conduz o trabalho até uma primeira versão.</p>
                {composer(false)}
                <div className="mt-7 flex max-w-4xl flex-wrap justify-center gap-2">{examples.map(example => <button type="button" key={example} onClick={() => { setRequest(example); input.current?.focus(); }} className="rounded-full border border-white/[.08] bg-white/[.02] px-3.5 py-2 text-[11px] text-white/45 hover:text-white">{example}</button>)}</div>
                {notice && <div className="mt-5 rounded-xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-xs text-white/50">{notice}</div>}
              </section>
            ) : (
              <section className="mx-auto grid max-w-[1240px] gap-8 xl:grid-cols-[minmax(0,1fr)_250px]">
                <div className="min-w-0">
                  <div className="mb-7 flex items-start justify-between gap-4"><div className="min-w-0"><span className="rounded-full border border-white/[.08] bg-white/[.025] px-2.5 py-1 text-[10px] text-white/40">{status(selected.status)}</span><h1 className="mt-3 truncate text-2xl font-medium sm:text-3xl">{selected.name}</h1><p className="mt-2 text-sm leading-6 text-white/40">{selected.objective}</p></div></div>
                  {messages.length === 0 && !result && <div className="mb-7 rounded-[30px] border border-white/[.07] bg-white/[.025] p-8"><h2 className="text-xl font-medium">Continue seu trabalho.</h2><p className="mt-2 text-sm leading-6 text-white/40">Converse naturalmente com o Nexus. O contexto deste projeto permanece ativo.</p></div>}
                  <div className="space-y-5">
                    {messages.map(message => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={message.role === 'user' ? 'max-w-[90%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-black' : 'max-w-[90%] rounded-2xl rounded-bl-md border border-white/[.07] bg-white/[.025] px-4 py-3 text-white/75'}><p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p></div></div>)}
                    {busy && <div className="flex items-center gap-3 px-2 text-sm text-white/35"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />{result ? 'Aplicando seu refinamento…' : 'O Nexus está entendendo e preparando o trabalho…'}</div>}
                    {result && <section className="overflow-hidden rounded-[30px] border border-white/[.08] bg-[#0b0b0b]"><div className="flex items-center justify-between border-b border-white/[.06] px-4 py-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/[.06]">{resultKind === 'IMAGE' ? <ImageIcon className="h-4 w-4" /> : resultKind === 'VIDEO' ? <Video className="h-4 w-4" /> : resultKind === 'AUDIO' ? <Music2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span><div><p className="text-xs">Resultado</p><p className="text-[10px] text-white/30">Versão {revisions[0]?.version ?? 1}</p></div></div><span className="text-[10px] text-white/25">{result.status === 'READY' || result.status === 'COMPLETED' ? 'Pronto' : 'Preparando'}</span></div><div className="p-4"><Viewer result={result} /></div><div className="flex flex-wrap justify-between gap-2 border-t border-white/[.06] px-4 py-3"><div className="flex gap-1.5">{result.artifact_url && <><a href={result.artifact_url} target="_blank" rel="noreferrer" className="px-3 py-2 text-xs text-white/50 hover:text-white">Abrir</a><button type="button" onClick={() => void navigator.clipboard?.writeText(result.artifact_url ?? '')} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-white/50 hover:text-white"><Copy className="h-3.5 w-3.5" />Copiar link</button></>}</div><div className="flex gap-2"><button type="button" onClick={() => input.current?.focus()} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-white/70">Refinar</button><button type="button" disabled={busy || approved || !revisions[0]} onClick={() => void approve()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black disabled:opacity-30">{approved && <Check className="h-3.5 w-3.5" />}{approved ? 'Aprovado' : 'Aprovar resultado'}</button></div></div></section>}
                  </div>
                  {composer(true)}
                  {notice && <div className="mt-3 rounded-xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-xs text-white/50">{notice}</div>}
                </div>
                <aside className="hidden xl:block"><div className="sticky top-24 space-y-3"><div className="rounded-2xl border border-white/[.07] bg-white/[.02] p-4"><div className="mb-3 flex justify-between"><span className="text-[10px] uppercase tracking-[.2em] text-white/30">Projetos</span><span className="text-[10px] text-white/20">{projects.length}</span></div>{loading ? <p className="p-3 text-xs text-white/25">Carregando…</p> : projects.map(project => <button type="button" key={project.id} onClick={() => select(project)} className={`block w-full rounded-xl p-3 text-left ${selected.id === project.id ? 'bg-white/[.08]' : 'hover:bg-white/[.035]'}`}><div className="truncate text-xs">{project.name}</div><div className="mt-1 truncate text-[10px] text-white/30">{project.objective}</div></button>)}</div></div></aside>
              </section>
            )}
          </div>
        </main>
      </div>

      {rename && <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] p-6"><div className="flex justify-between"><h2 className="text-xl">Renomear projeto</h2><button type="button" onClick={() => setRename(false)} aria-label="Fechar"><X className="h-4 w-4" /></button></div><input autoFocus value={renameValue} onChange={event => setRenameValue(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void renameProject(); }} className="mt-5 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" /><button type="button" onClick={() => void renameProject()} disabled={busy || !renameValue.trim()} className="mt-4 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black disabled:opacity-30">{busy ? 'Salvando…' : 'Salvar nome'}</button></div></div>}
    </div>
  );
}
