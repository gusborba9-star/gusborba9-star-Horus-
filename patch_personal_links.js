const fs = require('fs');
let code = fs.readFileSync('app/dashboard/personal/page.tsx', 'utf8');

code = code.replace(
  "{ name: 'Desktop Companion', status: 'Ativo', icon: Monitor, color: 'emerald' },",
  "{ name: 'Desktop Companion', status: 'Ativo', icon: Monitor, color: 'emerald', link: '/dashboard/personal/companion' },"
);
code = code.replace(
  "{ name: 'Hórus Voice (Carro)', status: 'Offline', icon: Headphones, color: 'white/30' },",
  "{ name: 'Hórus Voice Runtime', status: 'Pronto', icon: Headphones, color: 'blue', link: '/dashboard/personal/voice' },"
);

code = code.replace(
  "return (",
  "return (\n                           <Link href={dev.link || '#'} key={i} className=\"flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors\">\n                              <div className=\"flex items-center gap-3\">\n                                 <Icon className={`w-4 h-4 text-${dev.color}`} />\n                                 <span className=\"text-xs font-bold text-white/70\">{dev.name}</span>\n                              </div>\n                              <div className={`w-2 h-2 rounded-full bg-${dev.color}`}></div>\n                           </Link>\n                        )\n                     // old return below that will be replaced"
);

// We need to clean up the old return statement:
let parts = code.split('return (');
// parts[0] is everything before the first 'return ('
// parts[1] is the new return
// parts[2] is the old return... wait, it will match the top level component's return too!

// Let's rewrite safely with string replacement block.
