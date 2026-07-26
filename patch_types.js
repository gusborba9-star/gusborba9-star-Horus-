const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/const containerRef = useRef\(null\);/, 'const containerRef = useRef<HTMLDivElement>(null);');
code = code.replace(/items\.forEach\(item => {/, 'items.forEach((item) => { const el = item as HTMLElement;');
code = code.replace(/item\.style/g, 'el.style');
code = code.replace(/item\.getBoundingClientRect/g, 'el.getBoundingClientRect');

fs.writeFileSync('app/page.tsx', code);
