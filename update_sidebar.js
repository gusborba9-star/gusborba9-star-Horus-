const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf-8');

const newSidebarContent = `        <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-3 mt-2">Plataforma Hórus</div>
          <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Painel Administrativo" />
          <NavLink href="/dashboard/studio" icon={<Wand2 className="w-4 h-4" />} label="Studio Hórus" />
          
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-3 mt-6">Inteligência & Negócios</div>
          <NavLink href="/dashboard/agents/new" icon={<Users className="w-4 h-4" />} label="Criar Agente" />
          <NavLink href="/dashboard/crm" icon={<Kanban className="w-4 h-4" />} label="Pipeline CRM (Premium)" />
          <NavLink href="/dashboard/plans" icon={<CreditCard className="w-4 h-4" />} label="Planos & Assinaturas" />
          
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-3 mt-6">Ecossistema & Conexões</div>
          <NavLink href="/dashboard/apis" icon={<Database className="w-4 h-4" />} label="APIs & Endpoints" />
          <NavLink href="/dashboard/integrations" icon={<BrainCircuit className="w-4 h-4" />} label="Integrações" />
          <NavLink href="/dashboard/plugins" icon={<Activity className="w-4 h-4" />} label="Plugins Oficiais" />

          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-3 mt-6">Institucional & Compliance</div>
          <NavLink href="/dashboard/about" icon={<Compass className="w-4 h-4" />} label="Conheça o Hórus" />
          <NavLink href="/dashboard/security" icon={<MonitorPlay className="w-4 h-4" />} label="Segurança & Governança" />
          <NavLink href="/dashboard/rules" icon={<Settings className="w-4 h-4" />} label="Regras & Diretrizes" />
          <NavLink href="/dashboard/terms" icon={<LayoutDashboard className="w-4 h-4" />} label="Termos de Uso" />
          <NavLink href="/dashboard/lgpd" icon={<Database className="w-4 h-4" />} label="LGPD & Privacidade" />
        </div>`;

code = code.replace(/<div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">[\s\S]*?<\/div>\s*<div className="p-4 border-t border-white\/10 bg-black\/20 shrink-0">/, newSidebarContent + '\n\n        <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">');

fs.writeFileSync('app/dashboard/layout.tsx', code);
