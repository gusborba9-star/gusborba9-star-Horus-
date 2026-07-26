const fs = require('fs');

const pages = [
  { path: 'app/dashboard/crm/page.tsx', title: 'Pipeline CRM (Premium)', icon: 'Kanban', desc: 'Gestão de relacionamento ultra completa e enterprise.' },
  { path: 'app/dashboard/plans/page.tsx', title: 'Planos & Assinaturas', icon: 'CreditCard', desc: 'Gerencie seu plano, faturas e opções de pagamento.' },
  { path: 'app/dashboard/apis/page.tsx', title: 'APIs & Endpoints', icon: 'Database', desc: 'Documentação e chaves de acesso para integração via API.' },
  { path: 'app/dashboard/integrations/page.tsx', title: 'Integrações', icon: 'BrainCircuit', desc: 'Conecte o Hórus ao seu ecossistema existente.' },
  { path: 'app/dashboard/plugins/page.tsx', title: 'Plugins Oficiais', icon: 'Activity', desc: 'Extensões de inteligência desenvolvidas para o Hórus.' },
  { path: 'app/dashboard/about/page.tsx', title: 'Conheça o Hórus', icon: 'Compass', desc: 'A arquitetura e os pilares de inteligência do sistema.' },
  { path: 'app/dashboard/security/page.tsx', title: 'Segurança & Governança', icon: 'MonitorPlay', desc: 'Controle de acesso, auditoria e conformidade.' },
  { path: 'app/dashboard/rules/page.tsx', title: 'Regras & Diretrizes', icon: 'Settings', desc: 'Configurações globais e limites de atuação.' },
  { path: 'app/dashboard/terms/page.tsx', title: 'Termos de Uso', icon: 'LayoutDashboard', desc: 'Contrato e termos de serviço do Hórus OS.' },
  { path: 'app/dashboard/lgpd/page.tsx', title: 'LGPD & Privacidade', icon: 'Database', desc: 'Gestão de dados pessoais e privacidade de usuários.' }
];

const template = (title, icon, desc) => `import Link from 'next/link';
import { ArrowLeft, ${icon}, Lock } from 'lucide-react';

export default function Page() {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 relative bg-[#090A0F]">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto w-full relative z-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-amber-400 transition-colors text-sm font-bold mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <${icon} className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">${title}</h1>
            <p className="text-white/50 text-sm mt-1">${desc}</p>
          </div>
        </div>

        <div className="mt-12 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-16 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/60">
          <div className="w-16 h-16 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-white/30" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Módulo em Configuração</h2>
          <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed mb-8">
            Este ambiente corporativo está sendo provisionado para sua organização. Todas as funcionalidades de classe Enterprise estarão disponíveis em breve.
          </p>
          <button className="px-6 py-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold rounded-xl text-sm hover:bg-amber-500/20 transition-all">
            Solicitar Acesso Antecipado
          </button>
        </div>
      </div>
    </div>
  );
}
`;

pages.forEach(p => {
  fs.writeFileSync(p.path, template(p.title, p.icon, p.desc));
});

console.log("Pages fixed!");
