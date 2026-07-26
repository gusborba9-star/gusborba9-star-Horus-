'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BrainCircuit, Smartphone, Users, Settings, Database, Activity, Code, 
  Menu, X, Sparkles, Plus, Kanban, Shield, LogOut, 
  Layers, ChevronRight, Zap, Target, BookOpen, 
  Briefcase, MessageSquare, CreditCard, PieChart,
  Bell, Puzzle, FileBox
} from 'lucide-react';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Workspace', href: '/dashboard', icon: Target },
    { name: 'Consultor Nexus', href: '/nexus', icon: BrainCircuit },
    { name: 'Memória Operacional', href: '/dashboard/memory', icon: Database },
    { name: 'Colab. Empresariais', href: '/dashboard/agents', icon: Users },
    { name: 'Colab. de Presença', href: '/dashboard/personal', icon: Smartphone },
    { name: 'Studio Hórus', href: '/dashboard/studio', icon: Sparkles },
    { name: 'CRM & Vendas', href: '/dashboard/crm', icon: Kanban },
    { name: 'Tarefas & Fluxos', href: '/dashboard/tasks', icon: Layers },
    { name: 'Integrações', href: '/dashboard/integrations', icon: Zap },
    { name: 'Inteligência Financeira', href: '/dashboard/finance', icon: CreditCard },
    { name: 'Relatórios Core', href: '/dashboard/reports', icon: PieChart },
    { name: 'Notificações', href: '/dashboard/notifications', icon: Bell },
    { name: 'Marketplace', href: '/dashboard/plugins', icon: Puzzle },
    { name: 'Projetos (Avulsos)', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Biblioteca Cognitiva', href: '/dashboard/library', icon: FileBox },
  ];

  return (
    <div className="flex h-screen bg-[#050508] text-white overflow-hidden font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none z-0"></div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden h-16 bg-[#0A0A0C]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-40 fixed top-0 left-0 right-0">
        <button 
          className="p-2 text-white/70 hover:text-white"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
           <BrainCircuit className="w-5 h-5 text-amber-500" />
           <span className="font-extrabold text-sm tracking-tight text-white">HÓRUS OS</span>
        </div>
        <div className="w-10 h-10"></div> {/* Spacer for centering */}
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#0A0A0C]/95 border-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:bg-amber-500/20 transition-all">
              <BrainCircuit className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight group-hover:text-amber-400 transition-colors">HÓRUS OS</span>
              <span className="block text-[10px] text-white/40 uppercase tracking-widest font-bold">Mission Control</span>
            </div>
          </Link>
        </div>

        {/* User Workspace Info */}
        <div className="p-4 border-b border-white/10 shrink-0">
           <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5">
                 <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-sm font-bold text-amber-400">EX</span>
                 </div>
              </div>
              <div className="flex-1 overflow-hidden">
                 <h4 className="font-bold text-sm truncate">Nexus Corp</h4>
                 <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Enterprise Plan</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
           </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                  ${isActive 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-white/40'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 shrink-0 space-y-2">
           <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
             <Settings className="w-5 h-5 text-white/40" />
             Configurações Globais
           </Link>
           <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
             <LogOut className="w-5 h-5 text-white/40" />
             Encerrar Sessão
           </Link>
        </div>
      
          <button 
            className="lg:hidden p-2 text-white/50 hover:text-white absolute right-4 top-6"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>

      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col bg-[#0A0A0C] min-w-0 min-h-0 overflow-hidden pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
