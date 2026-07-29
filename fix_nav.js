const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf8');

const newNav = `  const navItems = [
    { name: 'Nexus', href: '/nexus', icon: BrainCircuit },
    { name: 'Hórus Operations™', href: '/dashboard', icon: Target },
    { name: 'Studio Hórus™', href: '/dashboard/studio', icon: Sparkles },
    { name: 'Colaboradores Digitais™', href: '/dashboard/agents', icon: Users },
    { name: 'Memory Graph™', href: '/dashboard/memory', icon: Database },
  ];`;

code = code.replace(/const navItems = \[\s*([\s\S]*?)\s*\];/, newNav);

fs.writeFileSync('app/dashboard/layout.tsx', code);
