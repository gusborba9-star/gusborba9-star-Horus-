const fs = require('fs');
const path = require('path');

const modules = [
  {
    path: 'app/dashboard/studio/image/page.tsx',
    title: 'Studio Imagem',
    icon: 'ImageIcon',
    desc: 'Geração avançada de assets, fotografias e ilustrações sintéticas.',
    parent: { label: 'Studio', href: '/dashboard/studio' },
    modes: ['Texto para Imagem', 'Imagem para Imagem', 'Inpainting', 'Upscale (4K)', 'Variações', 'Remover Fundo'],
    settings: [
      { label: 'Modelo Base', options: ['Midjourney V6', 'DALL-E 3', 'Stable Diffusion 3', 'Flux Pro'] },
      { label: 'Proporção', options: ['1:1 (Quadrado)', '16:9 (Horizontal)', '9:16 (Vertical)', '21:9 (Cinematic)'] },
      { label: 'Estilo Artístico', options: ['Realismo Fotográfico', '3D Render', 'Ilustração Digital', 'Cyberpunk'] }
    ],
    templates: [
      { title: 'Produto E-commerce', desc: 'Fundo limpo, iluminação de estúdio' },
      { title: 'Hero Banner', desc: 'Asset wide para sites e landig pages' },
      { title: 'Avatar Corporativo', desc: 'Retrato profissional realista' }
    ]
  },
  {
    path: 'app/dashboard/studio/code/page.tsx',
    title: 'Studio Código',
    icon: 'Code',
    desc: 'Engenharia de software acelerada por IA. Refatoração e documentação.',
    parent: { label: 'Studio', href: '/dashboard/studio' },
    modes: ['Geração de Feature', 'Refatoração', 'Code Review', 'Documentação', 'Testes Unitários', 'Migração'],
    settings: [
      { label: 'Linguagem/Framework', options: ['TypeScript / React', 'Python / FastAPI', 'Go', 'Rust', 'Node.js'] },
      { label: 'Arquitetura', options: ['Microserviços', 'Monolito', 'Serverless'] },
      { label: 'Nível de Complexidade', options: ['Enterprise (Sólido)', 'Startup (Rápido)', 'Script (Simples)'] }
    ],
    templates: [
      { title: 'Autenticação JWT', desc: 'Boilerplate seguro de login' },
      { title: 'CRUD Prisma', desc: 'API completa com banco de dados' },
      { title: 'Integração Stripe', desc: 'Webhooks e checkout' }
    ]
  },
  {
    path: 'app/dashboard/studio/apps/page.tsx',
    title: 'Studio Apps',
    icon: 'Smartphone',
    desc: 'Geração de interfaces mobile, PWA e React Native apps.',
    parent: { label: 'Studio', href: '/dashboard/studio' },
    modes: ['App Completo', 'Tela Única', 'Componente UI', 'Fluxo de Navegação', 'Wireframe', 'Design System'],
    settings: [
      { label: 'Plataforma Alvo', options: ['iOS (SwiftUI/React Native)', 'Android (Kotlin)', 'Cross-platform', 'PWA'] },
      { label: 'Design System', options: ['Material Design 3', 'Human Interface (Apple)', 'Tailwind UI', 'Custom'] },
      { label: 'Tema', options: ['Dark Mode (Obsidian)', 'Light Mode', 'Auto'] }
    ],
    templates: [
      { title: 'App de Fintech', desc: 'Dashboard financeiro e cartões' },
      { title: 'E-commerce App', desc: 'Vitrine e carrinho nativo' },
      { title: 'App de Saúde', desc: 'Tracker de hábitos e métricas' }
    ]
  },
  {
    path: 'app/dashboard/studio/websites/page.tsx',
    title: 'Studio Websites',
    icon: 'LayoutTemplate',
    desc: 'Criação de landing pages, portfólios e sites corporativos.',
    parent: { label: 'Studio', href: '/dashboard/studio' },
    modes: ['Landing Page', 'E-commerce', 'Portfólio', 'Blog', 'Site Corporativo', 'Página de Vendas'],
    settings: [
      { label: 'Framework', options: ['Next.js 14', 'Astro', 'Nuxt 3', 'Webflow (Export)'] },
      { label: 'Estilo Visual', options: ['Minimalista Premium', 'Tech / Dark', 'Corporativo / Clean', 'Criativo'] },
      { label: 'Animações', options: ['Avançadas (Framer Motion)', 'Sutis (CSS)', 'Nenhuma'] }
    ],
    templates: [
      { title: 'SaaS Waitlist', desc: 'Página de conversão de alta performance' },
      { title: 'Agência Digital', desc: 'Portfolio imersivo com grid' },
      { title: 'Lançamento Info', desc: 'Copy agressiva e VSL' }
    ]
  },
  {
    path: 'app/dashboard/studio/dashboards/page.tsx',
    title: 'Studio Dashboards',
    icon: 'PieChart',
    desc: 'Data visualization, relatórios dinâmicos e painéis gerenciais.',
    parent: { label: 'Studio', href: '/dashboard/studio' },
    modes: ['Painel Financeiro', 'Métricas de Vendas', 'Logs e Infra', 'Analytics de Marketing', 'RH e Equipe', 'Customizado'],
    settings: [
      { label: 'Fonte de Dados', options: ['PostgreSQL / SQL', 'Firebase', 'Google Analytics', 'Stripe', 'CSV / Excel'] },
      { label: 'Atualização', options: ['Tempo Real (WebSockets)', 'A cada hora', 'Diária'] },
      { label: 'Biblioteca de Gráficos', options: ['Recharts', 'Chart.js', 'D3.js'] }
    ],
    templates: [
      { title: 'MRR & Churn', desc: 'Métricas de assinatura SaaS' },
      { title: 'Performance Ads', desc: 'ROAS e custo por aquisição' },
      { title: 'Saúde do Sistema', desc: 'Uptime, latência e erros' }
    ]
  },
  {
    path: 'app/dashboard/studio/docs/page.tsx',
    title: 'Studio Docs',
    icon: 'FileText',
    desc: 'Geração de contratos, propostas, artigos e documentação técnica.',
    parent: { label: 'Studio', href: '/dashboard/studio' },
    modes: ['Proposta Comercial', 'Contrato Jurídico', 'Artigo SEO', 'Documentação API', 'Manual Interno', 'Relatório Trimestral'],
    settings: [
      { label: 'Tom de Voz', options: ['Profissional e Direto', 'Jurídico', 'Persuasivo / Copy', 'Técnico'] },
      { label: 'Formato de Saída', options: ['PDF', 'Markdown', 'Google Docs', 'Word'] },
      { label: 'Tamanho', options: ['Curto (1 pág)', 'Médio (2-5 págs)', 'Longo (Completo)'] }
    ],
    templates: [
      { title: 'Proposta B2B', desc: 'Estrutura comercial de alto ticket' },
      { title: 'NDA Padrão', desc: 'Acordo de confidencialidade' },
      { title: 'Readme.md', desc: 'Doc impecável para Github' }
    ]
  },
  {
    path: 'app/dashboard/studio/presentations/page.tsx',
    title: 'Studio Apresentações',
    icon: 'Layers',
    desc: 'Pitch decks, slides de vendas e reportes com design visual.',
    parent: { label: 'Studio', href: '/dashboard/studio' },
    modes: ['Pitch Deck (Startup)', 'Apresentação de Vendas', 'Relatório Mensal', 'Treinamento', 'Webinar', 'Keynote'],
    settings: [
      { label: 'Estilo Visual', options: ['Apple Keynote (Minimalista)', 'Consultoria (McKinsey)', 'Startup (Moderno)'] },
      { label: 'Quantidade de Slides', options: ['Automático', 'Curto (5-7)', 'Padrão (10-15)', 'Longo (20+)'] },
      { label: 'Formato', options: ['Google Slides', 'PowerPoint', 'PDF'] }
    ],
    templates: [
      { title: 'Seed Pitch Deck', desc: 'Focado em investidores e problema/solução' },
      { title: 'Sales Deck', desc: 'Apresentação para fechamento de cliente' },
      { title: 'All-Hands', desc: 'Apresentação mensal para a equipe' }
    ]
  },
  {
    path: 'app/dashboard/studio/apis/page.tsx',
    title: 'Studio APIs',
    icon: 'Server',
    desc: 'Arquitetura de endpoints, GraphQL, webhooks e microserviços.',
    parent: { label: 'Studio', href: '/dashboard/studio' },
    modes: ['REST API Completa', 'GraphQL Schema', 'Webhook Handler', 'Integração de 3ros', 'Middleware', 'BaaS Setup'],
    settings: [
      { label: 'Runtime/Framework', options: ['Node.js (Express/Nest)', 'Python (FastAPI)', 'Go', 'Serverless Functions'] },
      { label: 'Banco de Dados', options: ['PostgreSQL', 'MongoDB', 'Redis', 'Nenhum'] },
      { label: 'Autenticação', options: ['JWT', 'OAuth2', 'API Keys', 'Nenhuma'] }
    ],
    templates: [
      { title: 'Stripe Webhook', desc: 'Handler seguro para pagamentos' },
      { title: 'User CRUD', desc: 'Endpoints completos para usuários' },
      { title: 'Proxy de IA', desc: 'Rotas para consumo de LLMs' }
    ]
  },
  {
    path: 'app/dashboard/studio/automations/page.tsx',
    title: 'Studio Automações',
    icon: 'Megaphone',
    desc: 'Fluxos de trabalho, orquestração de dados e conectores lógicos.',
    parent: { label: 'Studio', href: '/dashboard/studio' },
    modes: ['Fluxo de Vendas', 'Onboarding de Cliente', 'Triagem de Suporte', 'Sync de Dados', 'Web Scraping', 'Social Media'],
    settings: [
      { label: 'Gatilho (Trigger)', options: ['Novo Email', 'Webhook Recebido', 'Linha no Sheets', 'Cron (Agendado)'] },
      { label: 'Motor Lógico', options: ['N8N', 'Make (Integromat)', 'Zapier', 'Código Customizado'] },
      { label: 'Tratamento de Erros', options: ['Parar Fluxo', 'Ignorar e Continuar', 'Notificar no Slack'] }
    ],
    templates: [
      { title: 'Lead -> CRM', desc: 'Captura, enriquece e salva no CRM' },
      { title: 'Auto-Resposta', desc: 'Lê email, gera resposta com IA e envia' },
      { title: 'Sync Financeiro', desc: 'Stripe -> Planilha -> Slack' }
    ]
  },
  {
    path: 'app/dashboard/agents/page.tsx',
    title: 'Agentes Autônomos',
    icon: 'Zap',
    desc: 'Configuração e deploy de agentes cognitivos para seu ecossistema.',
    parent: { label: 'Dashboard', href: '/dashboard' },
    modes: ['Atendimento B2C', 'Assistente de Vendas', 'Engenheiro de Dados', 'Pesquisador Web', 'SDR Outbound', 'Especialista Legal'],
    settings: [
      { label: 'Modelo Base (Cérebro)', options: ['Gemini 1.5 Pro', 'GPT-4o', 'Claude 3.5 Sonnet', 'Llama 3'] },
      { label: 'Conhecimento (RAG)', options: ['Conectar Notion', 'Upload de PDFs', 'Conectar Google Drive', 'Sem contexto externo'] },
      { label: 'Ações Permitidas', options: ['Apenas Leitura', 'Pode enviar emails', 'Acesso total ao sistema'] }
    ],
    templates: [
      { title: 'Suporte L1', desc: 'Resolve dúvidas frequentes e abre tickets' },
      { title: 'Qualificador de Leads', desc: 'Conversa no WhatsApp e pontua o lead' },
      { title: 'Analista Financeiro', desc: 'Responde sobre métricas de caixa' }
    ]
  },
  {
    path: 'app/dashboard/campaigns/page.tsx',
    title: 'Studio Campanhas',
    icon: 'Megaphone',
    desc: 'Gestão de marketing, criativos, copies e funis de conversão.',
    parent: { label: 'Dashboard', href: '/dashboard' },
    modes: ['Campanha de E-mail', 'Anúncio FB/IG', 'Copy de Landing Page', 'Roteiro de Vídeo (VSL)', 'Sequência de Onboarding', 'Lançamento Meteórico'],
    settings: [
      { label: 'Público Alvo', options: ['B2B Enterprise', 'B2C Varejo', 'Startups', 'Público Frio'] },
      { label: 'Tom de Comunicação', options: ['Urgência/Escassez', 'Educacional', 'Autoridade', 'Descontraído'] },
      { label: 'Objetivo', options: ['Geração de Leads', 'Venda Direta', 'Branding', 'Retenção'] }
    ],
    templates: [
      { title: 'Email de Recuperação', desc: 'Carrinho abandonado de alta conversão' },
      { title: 'Ad Criativo (Carrossel)', desc: 'Estrutura para anúncio no Instagram' },
      { title: 'Cold Email B2B', desc: 'Prospecção fria e direta' }
    ]
  }
];

modules.forEach(mod => {
  const dir = path.dirname(mod.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const code = `'use client';
import { useState } from 'react';
import { 
  ArrowLeft, ChevronRight, Wand2, History,
  ${mod.icon}, Settings2, Layers
} from 'lucide-react';
import Link from 'next/link';

export default function ${mod.title.replace(/\s+/g, '')}Page() {
  const [activeTab, setActiveTab] = useState('create');
  
  return (
    <div className="h-full flex flex-col bg-[#0A0A0C] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      {/* Breadcrumb Header */}
      <div className="h-20 border-b border-white/5 shrink-0 flex items-center justify-between px-6 sm:px-10 relative z-20">
         <div className="flex items-center gap-2 text-xs font-bold text-white/50">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="${mod.parent.href}" className="hover:text-white transition-colors">${mod.parent.label}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-500">${mod.title}</span>
         </div>
         <Link href="${mod.parent.href}" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> Voltar
         </Link>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
         
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
               
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                     <h1 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
                        <${mod.icon} className="w-8 h-8 text-amber-500" /> ${mod.title}
                     </h1>
                     <p className="text-sm text-white/50 font-light">
                        ${mod.desc}
                     </p>
                  </div>
                  <div className="flex bg-[#141417] p-1 rounded-xl border border-white/5 shrink-0">
                     <button onClick={() => setActiveTab('create')} className={\`px-4 py-2 rounded-lg text-xs font-bold transition-all \${activeTab === 'create' ? 'bg-white/10 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}\`}>Criação</button>
                     <button onClick={() => setActiveTab('history')} className={\`px-4 py-2 rounded-lg text-xs font-bold transition-all \${activeTab === 'history' ? 'bg-white/10 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}\`}>Histórico</button>
                     <button onClick={() => setActiveTab('templates')} className={\`px-4 py-2 rounded-lg text-xs font-bold transition-all \${activeTab === 'templates' ? 'bg-white/10 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}\`}>Templates</button>
                  </div>
               </div>

               {activeTab === 'create' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     
                     <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Modo de Operação</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                           {${JSON.stringify(mod.modes)}.map((mode, i) => (
                              <button key={i} className={\`p-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 text-center \${i === 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(190,158,108,0.1)]' : 'bg-[#141417] border-white/5 text-white/60 hover:bg-white/5'}\`}>
                                 {mode}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Instruções / Prompt</label>
                              <textarea 
                                 className="w-full h-40 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500/50 resize-none font-light leading-relaxed"
                                 placeholder="Descreva detalhadamente o que você deseja gerar..."
                              ></textarea>
                           </div>
                           
                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Vincular a Projeto</label>
                              <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50">
                                 <option>Nenhum (Avulso)</option>
                                 <option>Projeto Alpha</option>
                                 <option>Operação Nexus</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="glass-panel p-6 rounded-3xl space-y-5">
                              {${JSON.stringify(mod.settings)}.map((setting, i) => (
                                <div key={i}>
                                   <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">{setting.label}</label>
                                   <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/50">
                                      {setting.options.map((opt, j) => (
                                         <option key={j}>{opt}</option>
                                      ))}
                                   </select>
                                </div>
                              ))}
                           </div>

                           <button className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl text-sm hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(190,158,108,0.3)] flex items-center justify-center gap-2 hover:-translate-y-0.5">
                              <Wand2 className="w-4 h-4" /> Iniciar Geração
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'history' && (
                  <div className="glass-panel rounded-3xl p-12 text-center animate-in fade-in duration-500 border border-white/5">
                     <History className="w-12 h-12 text-white/10 mx-auto mb-4" />
                     <h3 className="text-white/70 font-bold mb-2">Nenhum histórico encontrado</h3>
                     <p className="text-white/40 text-xs max-w-sm mx-auto font-light">Seus resultados anteriores aparecerão aqui para fácil acesso.</p>
                  </div>
               )}

               {activeTab === 'templates' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-500">
                     {${JSON.stringify(mod.templates)}.map((tpl, i) => (
                        <div key={i} className="glass-panel p-6 rounded-3xl hover:border-amber-500/30 transition-colors cursor-pointer group border border-white/5">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 rounded-xl bg-[#141417] flex items-center justify-center border border-white/5 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors">
                                 <Layers className="w-5 h-5 text-white/50 group-hover:text-amber-500" />
                              </div>
                           </div>
                           <h4 className="font-bold text-white text-sm mb-2">{tpl.title}</h4>
                           <p className="text-xs text-white/50 font-light">{tpl.desc}</p>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(mod.path, code);
});

console.log('Modules generated successfully.');
