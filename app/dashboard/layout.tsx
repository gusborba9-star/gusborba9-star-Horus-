'use client';
import { 
  BrainCircuit, LayoutDashboard, Sparkles, Activity, Plus,
  CreditCard, PieChart, Database, Network, Puzzle, FileBox, X,
  Menu, ArrowLeft, Bot, Workflow, Layers, Briefcase, Zap, Settings, Shield, Target, Users, Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Nexus', href: '/nexus', icon: BrainCircuit },
    { name: 'Hórus Operations™', href: '/dashboard', icon: Target },
    { name: 'Studio Hórus™', href: '/dashboard/studio', icon: Sparkles },
    { name: 'Equipes Cognitivas™', href: '/dashboard/agents', icon: Users },
    { name: 'Memory Graph™', href: '/dashboard/memory', icon: Database },
  ];

  return (
    <div className="h-screen w-full flex bg-[#080808] text-[#FAFAFA] font-sans overflow-hidden">
      
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-[#1C1C1C] bg-[#101010]/95 backdrop-blur-xl z-30 flex items-center justify-between px-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 text-[#FAFAFA]/70 hover:text-[#FAFAFA]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-[#D4AF37]" />
          <span className="font-extrabold text-xs tracking-[0.2em]">HÓRUS OS</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#080808]/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#101010]/95 border-[#1C1C1C] backdrop-blur-2xl border-r flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
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
        <div className="p-4 border-b border-[#1C1C1C] shrink-0 relative">
           <div className="text-[10px] text-[#FAFAFA]/40 font-bold uppercase tracking-[0.2em] mb-2 px-1">Hórus Workspaces™</div>
           
           <div className="group relative">
               <div className="bg-[#141414] border border-[#1C1C1C] rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#181818] hover:border-[#D4AF37]/20 transition-all peer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E5D2A0] p-[1px] shrink-0">
                     <div className="w-full h-full bg-[#080808] rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-sm font-bold text-[#D4AF37]">NC</span>
                     </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                     <h4 className="font-bold text-sm truncate text-[#FAFAFA]">Nexus Corp</h4>
                     <p className="text-[9px] text-[#C9A55C] font-bold uppercase tracking-[0.2em]">Operação Enterprise</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#FAFAFA]/30 group-hover:text-[#D4AF37] transition-colors shrink-0" />
               </div>
               
               {/* Dropdown menu */}
               <div className="absolute top-full left-0 mt-2 w-full bg-[#101010] border border-[#1C1C1C] rounded-xl shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all z-50 overflow-hidden">
                   <div className="p-3 border-b border-[#1C1C1C]">
                      <p className="text-[9px] font-bold text-[#FAFAFA]/40 uppercase tracking-[0.2em] mb-1">Hórus Workspaces™</p>
                   </div>
                   <div className="p-2 space-y-1">
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg bg-[#141414] border border-[#D4AF37]/30 text-left">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E5D2A0] p-[1px] shrink-0">
                             <div className="w-full h-full bg-[#080808] rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-[#D4AF37]">NC</span>
                             </div>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-[#FAFAFA]">Nexus Corp</p>
                             <p className="text-[8px] text-[#D4AF37] uppercase tracking-wider">Operação Enterprise</p>
                          </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#141414] border border-transparent transition-colors text-left text-white/50 hover:text-white">
                          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                             <span className="text-xs font-bold">OP</span>
                          </div>
                          <div>
                             <p className="text-xs font-bold">Minha Operação Pessoal</p>
                             <p className="text-[8px] uppercase tracking-wider">Pro</p>
                          </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#141414] border border-transparent transition-colors text-left text-white/50 hover:text-white">
                          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                             <span className="text-xs font-bold">MC</span>
                          </div>
                          <div>
                             <p className="text-xs font-bold">Minha Clínica</p>
                             <p className="text-[8px] uppercase tracking-wider">Business</p>
                          </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#141414] border border-transparent transition-colors text-left text-white/50 hover:text-white">
                          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                             <span className="text-xs font-bold">RI</span>
                          </div>
                          <div>
                             <p className="text-xs font-bold">Restaurante Imperial</p>
                             <p className="text-[8px] uppercase tracking-wider">Pro</p>
                          </div>
                      </button>
                   </div>
                   <div className="p-2 border-t border-[#1C1C1C]">
                      <button className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-xs font-bold uppercase tracking-widest">
                         <Plus className="w-3 h-3" />
                         Novo Workspace
                      </button>
                   </div>
               </div>
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
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs tracking-wide font-medium
                  ${isActive 
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'text-[#FAFAFA]/60 hover:text-[#FAFAFA] hover:bg-[#141414] border border-transparent'}
                `}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#FAFAFA]/40'}`} />
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
