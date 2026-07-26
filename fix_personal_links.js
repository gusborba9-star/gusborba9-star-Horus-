const fs = require('fs');
let code = fs.readFileSync('app/dashboard/personal/page.tsx', 'utf8');

// The block to replace:
const target = `
                     {[
                        { name: 'Desktop Companion', status: 'Ativo', icon: Monitor, color: 'emerald' },
                        { name: 'Aplicativo iOS', status: 'Sincronizado', icon: Smartphone, color: 'emerald' },
                        { name: 'Hórus Voice (Carro)', status: 'Offline', icon: Headphones, color: 'white/30' },
                        { name: 'WhatsApp Business', status: 'Ativo', icon: MessageSquare, color: 'emerald' },
                        { name: 'Integração Alexa', status: 'Ativo', icon: Wifi, color: 'emerald' }
                     ].map((dev, i) => {
                        const Icon = dev.icon;
                        return (
                           <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                              <div className="flex items-center gap-3">
                                 <Icon className={\`w-4 h-4 text-\${dev.color}\`} />
                                 <span className="text-xs font-bold text-white/70">{dev.name}</span>
                              </div>
                              <div className={\`w-2 h-2 rounded-full bg-\${dev.color}\`}></div>
                           </div>
                        )
                     })}
`;

const replacement = `
                     {[
                        { name: 'Desktop Companion', status: 'Ativo', icon: Monitor, color: 'emerald', link: '/dashboard/personal/companion' },
                        { name: 'Aplicativo iOS', status: 'Sincronizado', icon: Smartphone, color: 'emerald', link: '#' },
                        { name: 'Hórus Voice Runtime', status: 'Pronto', icon: Headphones, color: 'blue-400', link: '/dashboard/personal/voice' },
                        { name: 'WhatsApp Business', status: 'Ativo', icon: MessageSquare, color: 'emerald', link: '#' },
                        { name: 'Integração Alexa', status: 'Ativo', icon: Wifi, color: 'emerald', link: '#' }
                     ].map((dev, i) => {
                        const Icon = dev.icon;
                        return (
                           <Link href={dev.link} key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                              <div className="flex items-center gap-3">
                                 <Icon className={\`w-4 h-4 text-\${dev.color}\`} />
                                 <span className="text-xs font-bold text-white/70">{dev.name}</span>
                              </div>
                              <div className={\`w-2 h-2 rounded-full bg-\${dev.color}\`}></div>
                           </Link>
                        )
                     })}
`;

// It might have spaces mismatched, so let's use string.replace on just the map array.
code = code.replace(
  "{ name: 'Desktop Companion', status: 'Ativo', icon: Monitor, color: 'emerald' },",
  "{ name: 'Desktop Companion', status: 'Ativo', icon: Monitor, color: 'emerald', link: '/dashboard/personal/companion' },"
);
code = code.replace(
  "{ name: 'Aplicativo iOS', status: 'Sincronizado', icon: Smartphone, color: 'emerald' },",
  "{ name: 'Aplicativo iOS', status: 'Sincronizado', icon: Smartphone, color: 'emerald', link: '#' },"
);
code = code.replace(
  "{ name: 'Hórus Voice (Carro)', status: 'Offline', icon: Headphones, color: 'white/30' },",
  "{ name: 'Hórus Voice Runtime', status: 'Pronto', icon: Headphones, color: 'blue-400', link: '/dashboard/personal/voice' },"
);
code = code.replace(
  "{ name: 'WhatsApp Business', status: 'Ativo', icon: MessageSquare, color: 'emerald' },",
  "{ name: 'WhatsApp Business', status: 'Ativo', icon: MessageSquare, color: 'emerald', link: '#' },"
);
code = code.replace(
  "{ name: 'Integração Alexa', status: 'Ativo', icon: Wifi, color: 'emerald' }",
  "{ name: 'Integração Alexa', status: 'Ativo', icon: Wifi, color: 'emerald', link: '#' }"
);
code = code.replace(
  `<div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">`,
  `<Link href={dev.link || '#'} key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">`
);
code = code.replace(
  `</div>\n                        )`,
  `</Link>\n                        )`
);

fs.writeFileSync('app/dashboard/personal/page.tsx', code);
