const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/page.tsx', 'utf-8');

// Ensure tabs container is truly fluid and snap-x
const oldTabs = /<div className="flex flex-nowrap bg-white\/\[0\.03\] backdrop-blur-xl p-1\.5 rounded-2xl border border-white\/10 self-start xl:self-auto overflow-x-auto max-w-full custom-scrollbar">/g;
code = code.replace(oldTabs, '<div className="flex flex-nowrap bg-white/[0.03] backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 self-start xl:self-auto overflow-x-auto w-full max-w-full custom-scrollbar snap-x snap-mandatory">');

// Add snap-center to buttons in tabs
code = code.replace(/className={`flex items-center gap-2 px-5 py-2\.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap/g, 'className={`snap-center flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap');

// Make CRM Kanban columns full width on mobile, and 300px on desktop
code = code.replace(/w-64 shrink-0 flex flex-col gap-3/g, 'w-[85vw] sm:w-[300px] shrink-0 flex flex-col gap-3 snap-center');
code = code.replace(/overflow-x-auto custom-scrollbar relative z-10/g, 'overflow-x-auto custom-scrollbar relative z-10 snap-x snap-mandatory pb-4');

// Make sure panels use w-full and break-words
code = code.replace(/<div className="grid lg:grid-cols-12 gap-6 flex-1 z-10 min-h-0">/g, '<div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 flex-1 z-10 min-h-0 w-full break-words">');

// Fix video execution area to be strictly w-full
code = code.replace(/<div className="w-full max-w-lg aspect-video bg-\[#090A0F\]/g, '<div className="w-full sm:max-w-lg aspect-video bg-[#090A0F]');

// Buttons & Selects should all be w-full (they mostly are, just ensuring padding)
code = code.replace(/className="w-full bg-\[#090A0F\]/g, 'className="w-full bg-[#090A0F]'); 

// Pad the whole studio better on mobile
code = code.replace(/<div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden relative">/, '<div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden relative w-full max-w-[100vw]">');

// Remove hardcoded heights that could break on mobile
code = code.replace(/className="w-full h-24 bg-\[#090A0F\]/g, 'className="w-full min-h-[6rem] bg-[#090A0F]'); 

fs.writeFileSync('app/dashboard/studio/page.tsx', code);
