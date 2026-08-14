'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BrainCircuit, Check, Mic, Shield, Smartphone, Sparkles, Volume2, X, CreditCard, Database, Zap, Settings2, ExternalLink, Loader2, Monitor } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Persona = { id: string; display_name: string; locale?: string; voice_profile?: Record<string, unknown> };
type Permission = { id: string; capability_id: string; autonomy: string; confirmation_required: boolean; status: string };
type Subscription = { id: string; tier: string; status: string; economic_profile?: string | null; current_period_end?: string | null; external_subscription_id?: string | null };

type PersonalData = { profile: { persona_id: string; status: string } | null; subscription: Subscription | null; personas: Persona[] };

const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Ativo', PENDING: 'Aguardando billing', PAST_DUE: 'Pagamento pendente', PAUSED: 'Pausado', CANCELED: 'Cancelado', EXPIRED: 'Expirado' };

export default function PersonalHome() {
  const [token, setToken] = useState('');
  const [data, setData] = useState<PersonalData | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'personal'; text: string }[]>([]);
  const [notice, setNotice] = useState('');
  const [busyTier, setBusyTier] = useState<string | null>(null);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);
  const activeSubscription = data?.subscription?.status === 'ACTIVE';
  const activePersona = data?.profile?.persona_id;
  const reminderGrant = permissions.find((item) => item.capability_id === 'REMINDERS_CREATE');
  const activePersonaData = data?.personas.find((persona) => persona.id === activePersona);

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) return;
    setToken(session.access_token);
    const headers = { Authorization: `Bearer ${session.access_token}` };
    const [personalResponse, permissionResponse, plansResponse, subscriptionsResponse] = await Promise.all([
      fetch('/api/personal', { headers }),
      fetch('/api/personal/permissions', { headers }),
      fetch('/api/personal/plans'),
      fetch('/api/personal/subscriptions', { headers }),
    ]);
    const personal = await personalResponse.json();
    const permissionsBody = await permissionResponse.json();
    const plansBody = await plansResponse.json();
    const subscriptionsBody = await subscriptionsResponse.json();
    const subscriptions = subscriptionsBody.subscriptions ?? [];
    setData({ ...personal, subscription: subscriptions[0] ?? personal.subscription ?? null });
    setPermissions(permissionsBody.permissions ?? []);
    setPlans(plansBody.plans ?? []);
    setDeviceId(localStorage.getItem('horus-personal-device-id') ?? '');
  }

  useEffect(() => { void load(); }, []);

  async function checkout(tier: string) {
    setBusyTier(tier);
    const response = await fetch('/api/personal/billing/checkout', { method: 'POST', headers: authHeaders, body: JSON.stringify({ tier }) });
    const body = await response.json();
    setBusyTier(null);
    if (!response.ok) return setNotice(body.error ?? 'Não foi possível iniciar o checkout Efí.');
    const url = body.checkout?.payment_url;
    if (!url) return setNotice('A Efí não retornou um checkout válido.');
    window.open(url, '_blank', 'noopener,noreferrer');
    setNotice('Checkout de produção da Efí aberto. O acesso será liberado somente após reconciliação pelo Billing.');
    await load();
  }

  async function activatePersona(personaId: string) {
    const response = await fetch('/api/personal', { method: 'POST', headers: authHeaders, body: JSON.stringify({ persona_id: personaId }) });
    const body = await response.json();
    if (!response.ok) return setNotice(body.error ?? 'Falha ao ativar persona.');
    setData((current) => current ? { ...current, profile: body.profile } : current);
    setNotice(`Identidade ${body.profile?.display_name ?? personaId} ativada.`);
  }

  async function registerDevice() {
    const deviceKey = crypto.randomUUID();
    const response = await fetch('/api/personal/devices', { method: 'POST', headers: authHeaders, body: JSON.stringify({ device_key: deviceKey, platform: 'WEB', app_version: 'personal-1.0' }) });
    const body = await response.json();
    if (!response.ok) return setNotice(body.error ?? 'Falha ao vincular dispositivo.');
    const id = body.device?.id ?? '';
    setDeviceId(id);
    localStorage.setItem('horus-personal-device-id', id);
    setNotice('Dispositivo vinculado e pronto para execução.');
  }

  async function send() {
    const intent = input.trim();
    if (!intent || !deviceId) return setNotice(deviceId ? 'Digite uma solicitação.' : 'Vincule um dispositivo antes de executar.');
    setInput('');
    setChat((items) => [...items, { role: 'user', text: intent }]);
    const response = await fetch('/api/personal/execute', { method: 'POST', headers: { ...authHeaders, 'idempotency-key': crypto.randomUUID(), 'x-horus-device-id': deviceId }, body: JSON.stringify({ intent, device_id: deviceId }) });
    const body = await response.json();
    if (!response.ok) setNotice(body.error ?? 'A execução foi recusada pelo runtime.');
    setChat((items) => [...items, { role: 'personal', text: body.execution?.result?.text ?? body.error ?? 'Não foi possível concluir a solicitação.' }]);
  }

  async function grantReminder() {
    const response = await fetch('/api/personal/permissions', { method: 'POST', headers: authHeaders, body: JSON.stringify({ capability_id: 'REMINDERS_CREATE', autonomy: 'EXECUTE', confirmation_required: true }) });
    const body = await response.json();
    if (!response.ok) return setNotice(body.error ?? 'Falha ao conceder permissão.');
    setPermissions((items) => [...items.filter((item) => item.capability_id !== 'REMINDERS_CREATE'), body.permission]);
  }

  async function revokeReminder() {
    if (!reminderGrant) return;
    const response = await fetch('/api/personal/permissions', { method: 'DELETE', headers: authHeaders, body: JSON.stringify({ grant_id: reminderGrant.id }) });
    if (!response.ok) return setNotice((await response.json()).error ?? 'Falha ao revogar permissão.');
    setPermissions((items) => items.map((item) => item.id === reminderGrant.id ? { ...item, status: 'REVOKED' } : item));
  }

  if (!token) return <div className="flex h-full items-center justify-center bg-[#080808] text-sm text-white/50">Faça login para acessar o Hórus Personal.</div>;
  if (!data) return <div className="flex h-full items-center justify-center bg-[#080808] text-sm text-white/50"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sincronizando estado do Personal…</div>;

  return <div className="h-full overflow-y-auto bg-[#080808] p-5 md:p-8 text-white"><div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#101010] p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10"><BrainCircuit className="h-6 w-6 text-amber-400" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">Hórus Personal</p><h1 className="text-2xl font-black">Seu Personal cognitivo</h1><p className="mt-1 text-xs text-white/40">Estado governado pelo runtime, subscription e capabilities reais.</p></div></div>
      <div className="flex flex-wrap gap-2"><Link href="/dashboard/personal/voice" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold hover:bg-white/10"><Mic className="h-4 w-4" /> Voice</Link><Link href="/dashboard/personal/companion" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold hover:bg-white/10"><Monitor className="h-4 w-4" /> Companion</Link><Link href="/dashboard/personal/setup" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold hover:bg-white/10"><Settings2 className="h-4 w-4" /> Configuração</Link></div>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {[
        ['Subscription', data.subscription ? STATUS_LABEL[data.subscription.status] ?? data.subscription.status : 'Não contratada', data.subscription?.status === 'ACTIVE'],
        ['Persona', activePersonaData?.display_name ?? 'Não configurada', Boolean(activePersona)],
        ['Device', deviceId ? 'Vinculado' : 'Não vinculado', Boolean(deviceId)],
        ['Voice', activeSubscription && deviceId ? 'Disponível' : 'Bloqueado', activeSubscription && Boolean(deviceId)],
        ['Permissions', `${permissions.filter((item) => item.status === 'GRANTED').length} concedida(s)`, permissions.length > 0],
      ].map(([label, value, ok]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#101010] p-4"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</span>{ok ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <X className="h-3.5 w-3.5 text-white/20" />}</div><p className="mt-2 text-sm font-bold">{String(value)}</p></div>)}
    </section>

    {!activeSubscription ? <section className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-amber-400" /><h2 className="text-lg font-black">Ative seu Personal</h2></div><p className="mt-2 max-w-2xl text-sm text-white/50">Escolha um plano e abra o checkout oficial da Efí. O Hórus não altera o status para ACTIVE no frontend; a liberação depende da reconciliação de Billing.</p></div><span className="rounded-full border border-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">{data.subscription ? STATUS_LABEL[data.subscription.status] ?? data.subscription.status : 'Sem assinatura'}</span></div><div className="mt-5 grid gap-4 md:grid-cols-3">{plans.map((plan) => <div key={plan.id} className="rounded-2xl border border-white/10 bg-[#101010] p-5"><p className="text-xs font-bold text-amber-400">{plan.name}</p><p className="mt-2 text-3xl font-black">R$ {Number(plan.price_brl).toFixed(2).replace('.', ',')}</p><p className="mt-2 text-xs text-white/40">{plan.positioning}</p><button disabled={busyTier !== null} onClick={() => void checkout(plan.id)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-black text-black disabled:opacity-50">{busyTier === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />} Checkout Efí</button></div>)}</div></section> : <>
      <section className="rounded-3xl border border-white/10 bg-[#101010] p-6"><div className="mb-4 flex items-center justify-between gap-4"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-400" /><h2 className="text-sm font-black uppercase tracking-widest">Identidade da persona</h2></div><span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Billing ACTIVE</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.personas.map((persona) => <button key={persona.id} onClick={() => void activatePersona(persona.id)} className={`rounded-2xl border p-4 text-left ${activePersona === persona.id ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}><div className="flex items-center justify-between"><span className="text-lg font-bold">{persona.display_name}</span>{activePersona === persona.id && <Check className="h-4 w-4 text-amber-400" />}</div><p className="mt-2 text-xs text-white/40">{persona.locale ?? 'pt-BR'} · identidade persistente · voice profile governado pelo backend</p></button>)}</div></section>
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"><div className="flex min-h-[520px] flex-col rounded-3xl border border-white/10 bg-[#101010]"><div className="border-b border-white/10 p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{activePersonaData?.display_name ?? 'Personal'}</p><h2 className="text-lg font-bold">Conversa</h2></div><div className="flex-1 space-y-3 overflow-y-auto p-5">{chat.length === 0 && <div className="flex h-full items-center justify-center text-center text-sm text-white/30">Prompt Optimization → Task Profile → Nexus → memória → routing adaptativo → provider.</div>}{chat.map((item, index) => <div key={index} className={`max-w-[85%] rounded-2xl p-4 text-sm ${item.role === 'user' ? 'ml-auto bg-amber-500 text-black' : 'border border-white/10 bg-white/[0.03] text-white/80'}`}>{item.text}</div>)}</div><div className="border-t border-white/10 p-4"><div className="flex gap-2"><Link href="/dashboard/personal/voice" title="Executar Voice" className="rounded-xl border border-white/10 px-3 py-3 text-white/50 hover:text-white"><Mic className="h-4 w-4" /></Link><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void send(); }} placeholder="Fale com seu Personal…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none" /><button onClick={() => void send()} className="rounded-xl bg-amber-500 px-5 text-xs font-black text-black">Enviar</button></div></div></div>
      <aside className="space-y-6"><div className="rounded-3xl border border-white/10 bg-[#101010] p-5"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-amber-400" /><h2 className="text-sm font-black">Permission Center</h2></div><p className="mt-2 text-xs text-white/40">Capabilities reais, com concessão e revogação auditáveis.</p><div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"><div className="flex items-center justify-between"><span className="text-xs">REMINDERS_CREATE</span><span className={`text-[10px] font-bold ${reminderGrant?.status === 'GRANTED' ? 'text-emerald-400' : 'text-white/30'}`}>{reminderGrant?.status === 'GRANTED' ? 'GRANTED' : reminderGrant?.status === 'REVOKED' ? 'REVOKED' : 'NOT GRANTED'}</span></div><div className="mt-3">{reminderGrant?.status === 'GRANTED' ? <button onClick={() => void revokeReminder()} className="rounded-lg bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-300">Revogar</button> : <button onClick={() => void grantReminder()} className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold">Conceder</button>}</div></div></div><div className="rounded-3xl border border-white/10 bg-[#101010] p-5"><div className="flex items-center gap-2"><Database className="h-4 w-4 text-amber-400" /><h2 className="text-sm font-black">Memory / Context</h2></div><p className="mt-2 text-xs text-white/40">O runtime recupera memória do usuário antes do Nexus e persiste o resultado da execução.</p></div><div className="rounded-3xl border border-white/10 bg-[#101010] p-5"><div className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-amber-400" /><h2 className="text-sm font-black">Voice Runtime</h2></div><p className="mt-2 text-xs text-white/40">STT/TTS provider-neutral com routing e fallback governados pelo runtime.</p><Link href="/dashboard/personal/voice" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-amber-400">Abrir Voice <Zap className="h-3 w-3" /></Link></div></aside></section>
    </>}
    {notice && <button onClick={() => setNotice('')} className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-xs shadow-2xl">{notice}<X className="h-3 w-3 shrink-0" /></button>}
  </div></div>;
}
