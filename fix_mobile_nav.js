const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf-8');

// 1. Add state for mobile menu
if (!code.includes('useState')) {
  code = code.replace(/import { ReactNode } from 'react';/, "import { ReactNode, useState } from 'react';");
}
if (!code.includes('Menu, X')) {
  code = code.replace(/} from 'lucide-react';/, ", Menu, X } from 'lucide-react';");
}

const componentStartRegex = /export default function DashboardLayout\(\{[^}]+\}: \{[^}]+\}\) \{/;
code = code.replace(componentStartRegex, `export default function DashboardLayout({ children }: { children: ReactNode }) {\n  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);`);

// 2. Modify Sidebar to show on mobile when open
code = code.replace(/<aside className="w-64 border-r border-white\/10 flex flex-col hidden md:flex bg-white\/\[0\.03\] backdrop-blur-xl z-10 relative shrink-0">/, `<aside className={\`w-64 border-r border-white/10 flex flex-col bg-[#090A0F]/95 backdrop-blur-xl z-50 absolute md:relative inset-y-0 left-0 shrink-0 transition-transform duration-300 \${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}\`}>`);

// 3. Add overlay for mobile
code = code.replace(/{children}\n      <\/main>/, `{children}\n      </main>\n      {mobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}`);

// 4. Add hamburger menu button to header
const headerRegex = /<header className="h-16 border-b border-white\/10 flex items-center justify-between px-6 bg-white\/\[0\.03\] backdrop-blur-xl z-10 shrink-0">/;
code = code.replace(headerRegex, `<header className="h-16 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-white/[0.03] backdrop-blur-xl z-10 shrink-0">\n          <div className="flex items-center gap-3">\n            <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>\n              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}\n            </button>`);

// Fix the Search input to be responsive
code = code.replace(/w-96 border border-white\/10/, 'w-full max-w-md border border-white/10 hidden sm:flex');

fs.writeFileSync('app/dashboard/layout.tsx', code);
