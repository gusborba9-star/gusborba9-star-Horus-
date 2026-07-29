const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// The Carousel radius and sizing
code = code.replace(/const radius = 600;/g, 'const radius = 450;');
code = code.replace(/<div className="w-full h-\[500px\] overflow-hidden relative/g, '<div className="w-full h-[350px] overflow-hidden relative');
code = code.replace(/w-\[800px\]/g, 'w-[600px]');
code = code.replace(/text-4xl md:text-6xl/g, 'text-2xl md:text-4xl');

fs.writeFileSync('app/page.tsx', code);
