const fs = require('fs');

const code = `'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BrainCircuit, Smartphone, Users, Settings, Database, Activity, Code, Menu, X, Sparkles, Plus, Kanban, Shield, LogOut, Layers, ChevronRight, Zap, Target, BookOpen, Briefcase, MessageSquare, CreditCard, PieChart, Bell, Puzzle, FileBox } from 'lucide-react';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Workspace Cognitivo', href: '/dashboard', icon: Target },
    { name: 'Agente Interno Hórus', href: '/nexus', icon: BrainCircuit },
    { name: 'Memory Graph', href: '/dashboard/memory', icon: Database },
    { name: 'Colaboradores Digitais', href: '/dashboard/agents', icon: Users },
    { name: 'Operações Pessoais', href: '/dashboard/personal', icon: Smartphone },
    { name: 'Studio Hórus', href: '/dashboard/studio', icon: Sparkles },
    { name: 'CRM & Vendas', href: '/dashboard/crm', icon: Kanban },
    { name: 'Tarefas & Fluxos', href: '/dashboard/tasks', icon: Layers },
    { name: 'Integrações', href: '/dashboard/integrations', icon: Zap },
    { name: 'Inteligência Financeira', href: '/dashboard/finance', icon: CreditCard },
    { name: 'Relatórios Core', href: '/dashboard/reports', icon: PieChart },
    { name: 'Marketplace', href: '/dashboard/plugins', icon: Puzzle },
    { name: 'Projetos Específicos', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Biblioteca Corporativa', href: '/dashboard/library', icon: FileBox },
  ];

  return (
    <div className="flex h-screen bg-[#080808] text-[#FAFAFA] overflow-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-[#FAFAFA]">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden h-16 bg-[#080808]/90 backdrop-blur-md border-b border-[#1C1C1C] flex items-center justify-between px-4 z-40 fixed top-0 left-0 right-0">
        <button 
          className="p-2 text-[#FAFAFA]/70 hover:text-[#FAFAFA]"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
           <BrainCircuit className="w-5 h-5 text-[#D4AF37]" />
           <span className="font-extrabold text-sm tracking-[0.2em] text-[#FAFAFA]">HÓRUS OS</span>
        </div>
        <div className="w-10 h-10"></div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#080808]/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={\`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#101010]/95 border-[#1C1C1C] backdrop-blur-2xl border-r flex flex-col transition-transform duration-300 ease-in-out
        \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      \`}>
        
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-[#1C1C1C] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:bg-[#D4AF37]/20 transition-all">
              <BrainCircuit className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-[0.2em] group-hover:text-[#D4AF37] transition-colors">HÓRUS OS</span>
              <span className="block text-[10px] text-[#FAFAFA]/40 uppercase tracking-[0.3em] font-bold">Mission Control</span>
            </div>
          </Link>
        </div>

        {/* User Workspace Info */}
        <div className="p-4 border-b border-[#1C1C1C] shrink-0">
           <div className="bg-[#141414] border border-[#1C1C1C] rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#181818] hover:border-[#D4AF37]/20 transition-all group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E5D2A0] p-[1px]">
                 <div className="w-full h-full bg-[#080808] rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-sm font-bold text-[#D4AF37]">EX</span>
                 </div>
              </div>
              <div className="flex-1 overflow-hidden">
                 <h4 className="font-bold text-sm truncate text-[#FAFAFA]">Nexus Corp</h4>
                 <p className="text-[9px] text-[#C9A55C] font-bold uppercase tracking-[0.2em]">Enterprise Plan</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FAFAFA]/30 group-hover:text-[#D4AF37] transition-colors" />
           </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(\`\${item.href}/\`);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={\`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs tracking-wide font-medium
                  \${isActive 
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'text-[#FAFAFA]/60 hover:text-[#FAFAFA] hover:bg-[#141414] border border-transparent'}
                \`}
              >
                <item.icon className={\`w-4 h-4 \${isActive ? 'text-[#D4AF37]' : 'text-[#FAFAFA]/40'}\`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1C1C1C] shrink-0 space-y-2">
           <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAFAFA]/60 hover:text-[#FAFAFA] hover:bg-[#141414] transition-colors text-xs font-medium">
             <Settings className="w-4 h-4 text-[#FAFAFA]/40" />
             Configurações Globais
           </Link>
           <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAFAFA]/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-xs font-medium">
             <ArrowLeft className="w-4 h-4 text-[#D4AF37]/50" />
             Sair do Console (Home)
           </Link>
        </div>
        
        <button 
          className="lg:hidden p-2 text-[#FAFAFA]/50 hover:text-[#FAFAFA] absolute right-4 top-6"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col bg-[#080808] min-w-0 min-h-0 overflow-hidden pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
`;

fs.writeFileSync('app/dashboard/layout.tsx', code);
