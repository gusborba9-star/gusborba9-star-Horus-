const fs = require('fs');
let code = fs.readFileSync('app/nexus/page.tsx', 'utf8');

const newActions = `  const quickActions = [
    { label: 'Hórus Operations™', icon: Briefcase, href: '/dashboard' },
    { label: 'Colaboradores Digitais™', icon: Bot, href: '/dashboard/agents' },
    { label: 'Studio Hórus™', icon: Sparkles, href: '/dashboard/studio' },
    { label: 'Memory Graph™', icon: Layers, href: '/dashboard/memory' },
    { label: 'Projetos Inteligentes', icon: LayoutTemplate, href: '/dashboard/studio/apps' },
    { label: 'Automações Invisíveis', icon: Workflow, href: '/dashboard/studio/automations' },
    { label: 'Infraestrutura Cognitiva', icon: Code, href: '/dashboard/studio/code' },
  ];`;

code = code.replace(/const quickActions = \[\s*([\s\S]*?)\s*\];/, newActions);
code = code.replace(/Nexus Engine/g, 'Nexus™');
// fix any other Nexus Engine™ instances if needed, but Nexus Engine is fine.
// Actually, let's keep Nexus Engine for the title.

fs.writeFileSync('app/nexus/page.tsx', code);
