import { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, BrainCircuit, Activity, Settings, Bell, Search } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-bold tracking-wide">HÓRUS OS</span>
          </Link>
        </div>
        
        <div className="p-4 flex-1 flex flex-col gap-1">
          <div className="text-xs font-bold text-white/30 uppercase tracking-wider mb-2 px-3 mt-4">Sistema</div>
          <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Visão Geral" />
          <NavLink href="/dashboard/agents" icon={<Users className="w-4 h-4" />} label="Funcionários Digitais" />
          <NavLink href="/dashboard/memory" icon={<BrainCircuit className="w-4 h-4" />} label="Memória Infinita" />
          <NavLink href="/dashboard/logs" icon={<Activity className="w-4 h-4" />} label="Trilha de Auditoria" />
          
          <div className="text-xs font-bold text-white/30 uppercase tracking-wider mb-2 px-3 mt-8">Configurações</div>
          <NavLink href="/dashboard/settings" icon={<Settings className="w-4 h-4" />} label="Ajustes" />
        </div>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-white/10" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">CTO / Admin</div>
              <div className="text-xs text-white/50 truncate">admin@horus.ai</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-md z-10">
          <div className="flex items-center bg-white/5 rounded-lg px-3 py-2 w-96 border border-white/10 focus-within:border-cyan-500/50 transition-colors">
            <Search className="w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Buscar agentes, memórias ou logs..." 
              className="bg-transparent border-none outline-none text-sm ml-2 flex-1 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-white/60 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full"></span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group"
    >
      <span className="text-white/40 group-hover:text-cyan-400 transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  );
}
