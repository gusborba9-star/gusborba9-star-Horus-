'use client';

import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, Check, Mic, Shield, Smartphone, Sparkles, Volume2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Persona = { id: string; display_name: string };
type Permission = { id: string; capability_id: string; autonomy: string; confirmation_required: boolean; status: string };

export default function PersonalHome() {
  const [token, setToken] = useState('');
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'personal'; text: string }[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [notice, setNotice] = useState('');
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);

  async function load() {
    const [{ data: sessionData }, plansResponse] = await Promise.all([supabase.auth.getSession(), fetch('/api/personal/plans')]);
    const session = sessionData.session;
    if (!session) return;
    setToken(session.access_token);
    const [personalResponse, permissionResponse] = await Promise.all([
      fetch('/api/personal', { headers: { Authorization: `Bearer ${session.access_token}` } }),
      fetch('/api/personal/permissions', { headers: { Authorization: `Bearer ${session.access_token}` } }),
    ]);
    setData(await personalResponse.json());
    setPermissions((await permissionResponse.json()).permissions ?? []);
    setPlans((await plansResponse.json()).plans ?? []);
    setDeviceId(localStorage.getItem('horus-personal-device-id') ?? '');
  }

  // Authentication is an external system synchronization; the async loader owns the state transition.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  async function subscribe(tier: string) {
    const response = await fetch('/api/personal/subscriptions', { method: 'POST', headers: authHeaders, body: JSON.stringify({ tier }) });
    const body = await response.json();
    if (!response.ok) return setNotice(body.error ?? 'Falha ao registrar assinatura.');
    setData((current: any) => ({ ...(current ?? {}), subscription: body.subscription }));
  }

  async function activatePersona(personaId: string) {
    const response = await fetch('/api/personal', { method: 'POST', headers: authHeaders, body: JSON.stringify({ persona_id: personaId }) });
    const body = await response.json();
    if (!response.ok) return setNotice(body.error ?? 'Falha ao ativar persona.');
    setData((current: any) => ({ ...current, profile: body.profile }));
    setNotice(`Identidade ${body.profile?.display_name ?? personaId} ativada.`);
  }

  async function registerDevice() {
    const deviceKey = crypto.randomUUID();
    const response = await fetch('/api/personal/devices', { method: 'POST', headers: authHeaders, body: JSON.stringify({ device_key: deviceKey, platform: 'WEB', app_version: 'personal-1.0' }) });
    const body = await response.json();
    if (!response.ok) return setNotice(body.error ?? 'Falha ao vincular dispositivo.');
    setDeviceId(body.device?.id ?? '');
    localStorage.setItem('horus-personal-device-id', body.device?.id ?? '');
    setNotice('Dispositivo vinculado.');
  }

  async function send() {
    const intent = input.trim();
    if (!intent) return;
    setInput('');
    setChat((items) => [...items, { role: 'user', text: intent }]);
    const response = await fetch('/api/personal/execute', { method: 'POST', headers: { ...authHeaders, 'idempotency-key': crypto.randomUUID(), 'x-horus-device-id': deviceId }, body: JSON.stringify({ intent, device_id: deviceId }) });
    const body = await response.json();
    setChat((items) => [...items, { role: 'personal', text: body.execution?.result?.text ?? body.error ?? 'Não foi possível concluir a solicitação.' }]);
  }

  async function grantReminder() {
    const response = await fetch('/api/personal/permissions', { method: 'POST', headers: authHeaders, body: JSON.stringify({ capability_id: 'REMINDERS_CREATE', autonomy: 'EXECUTE', confirmation_required: true }) });
    const body = await response.json();
    if (!response.ok) return setNotice(body.error ?? 'Falha ao conceder permissão.');
    setPermissions((items) => [...items.filter((item) => item.capability_id !== 'REMINDERS_CREATE'), body.permission]);
  }

  async function revokeReminder() {
    const permission = permissions.find((item) => item.capability_id === 'REMINDERS_CREATE' && item.status === 'GRANTED');
    if (!permission) return;
    const response = await fetch('/api/personal/permissions', { method: 'DELETE', headers: authHeaders, body: JSON.stringify({ grant_id: permission.id }) });
    if (response.ok) setPermissions((items) => items.map((item) => item.id === permission.id ? { ...item, status: 'REVOKED' } : item));
  }

  if (!token) return <div className="flex h-full items-center justify-center bg-[#080808] text-sm text-white/50">Faça login para acessar o Hórus Personal.</div>;
  const activeSubscription = ['ACTIVE', 'PAST_DUE', 'PAUSED'].includes(data?.subscription?.status);
  const activePersona = data?.profile?.persona_id;
  const reminderGrant = permissions.find((item) => item.capability_id === 'REMINDERS_CREATE');

  return <div className="h-full overflow-y-auto bg-[#080808] p-5 md:p-8 text-white"><div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#101010] p-6 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10"><BrainCircuit className="h-6 w-6 text-amber-400" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">Hórus Personal</p><h1 className="text-2xl font-black">Seu Personal cognitivo</h1></div></div><button onClick={() => void registerDevice()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold hover:bg-white/10"><Smartphone className="h-4 w-4" /> Vincular dispositivo</button></header>
    {!activeSubscription ? <><section className="grid gap-4 md:grid-cols-3">{plans.map((plan) => <div key={plan.id} className="rounded-2xl border border-white/10 bg-[#101010] p-5"><p className="text-xs font-bold text-amber-400">{plan.name}</p><p className="mt-2 text-3xl font-black">R$ {Number(plan.price_brl).toFixed(2).replace('.', ',')}</p><p className="mt-2 text-xs text-white/40">{plan.positioning}</p><button onClick={() => void subscribe(plan.id)} className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-3 text-xs font-black text-black">Selecionar plano</button></div>)}</section><p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">A assinatura é criada como PENDING e só é ativada pelo domínio de Billing. O Personal não autoautoriza acesso pago.</p></> : <>
      <section className="rounded-3xl border border-white/10 bg-[#101010] p-6"><div className="mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-400" /><h2 className="text-sm font-black uppercase tracking-widest">Escolha sua identidade</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(data?.personas ?? []).map((persona: Persona) => <button key={persona.id} onClick={() => void activatePersona(persona.id)} className={`rounded-2xl border p-4 text-left ${activePersona === persona.id ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/10 bg-white/[0.02]'}`}><div className="flex items-center justify-between"><span className="text-lg font-bold">{persona.display_name}</span>{activePersona === persona.id && <Check className="h-4 w-4 text-amber-400" />}</div><p className="mt-2 text-xs text-white/40">PT-BR · voz feminina · identidade persistente</p></button>)}</div></section>
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"><div className="flex min-h-[520px] flex-col rounded-3xl border border-white/10 bg-[#101010]"><div className="border-b border-white/10 p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{data?.personas?.find((p: Persona) => p.id === activePersona)?.display_name ?? 'Personal'}</p><h2 className="text-lg font-bold">Conversa</h2></div><div className="flex-1 space-y-3 overflow-y-auto p-5">{chat.length === 0 && <div className="flex h-full items-center justify-center text-center text-sm text-white/30">Prompt Optimization → Task Profile → Nexus → routing adaptativo → memória → provider → resultado.</div>}{chat.map((item, index) => <div key={index} className={`max-w-[85%] rounded-2xl p-4 text-sm ${item.role === 'user' ? 'ml-auto bg-amber-500 text-black' : 'border border-white/10 bg-white/[0.03] text-white/80'}`}>{item.text}</div>)}</div><div className="border-t border-white/10 p-4"><div className="flex gap-2"><button title="Voz" className="rounded-xl border border-white/10 px-3 text-white/50"><Mic className="h-4 w-4" /></button><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void send(); }} placeholder="Fale com seu Personal…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none" /><button onClick={() => void send()} className="rounded-xl bg-amber-500 px-5 text-xs font-black text-black">Enviar</button></div></div></div>
      <aside className="space-y-6"><div className="rounded-3xl border border-white/10 bg-[#101010] p-5"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-amber-400" /><h2 className="text-sm font-black">Permission Center</h2></div><p className="mt-2 text-xs text-white/40">Cada capability possui escopo, autonomia, confirmação, revogação e auditoria.</p><div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"><div className="flex items-center justify-between"><span className="text-xs">Lembretes</span><span className={`text-[10px] font-bold ${reminderGrant?.status === 'GRANTED' ? 'text-emerald-400' : 'text-white/30'}`}>{reminderGrant?.status === 'GRANTED' ? 'PERMITIDO' : 'NÃO PERMITIDO'}</span></div><div className="mt-3">{reminderGrant?.status === 'GRANTED' ? <button onClick={() => void revokeReminder()} className="rounded-lg bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-300">Revogar</button> : <button onClick={() => void grantReminder()} className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold">Conceder</button>}</div></div></div><div className="rounded-3xl border border-white/10 bg-[#101010] p-5"><div className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-amber-400" /><h2 className="text-sm font-black">Voice Runtime</h2></div><p className="mt-2 text-xs text-white/40">STT/TTS provider-neutral, voz primária e fallback compatível, sem trocar a identidade da persona.</p></div></aside></section>
    </>}
    {notice && <button onClick={() => setNotice('')} className="fixed bottom-6 right-6 flex items-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-xs shadow-2xl">{notice}<X className="h-3 w-3" /></button>}
  </div></div>;
}
