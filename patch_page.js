const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Decrease size of Neural Core
code = code.replace(/<div className="relative w-full max-w-3xl mx-auto h-\[500px\] flex items-center justify-center mt-32">/, '<div className="relative w-full max-w-2xl mx-auto h-[400px] flex items-center justify-center mt-24 animate-[float_6s_ease-in-out_infinite]">');
code = code.replace(/<div className="w-64 h-64 border-\[0\.5px\]/g, '<div className="w-48 h-48 border-[0.5px]');
code = code.replace(/<div className="absolute w-\[400px\] h-\[400px\]/g, '<div className="absolute w-[300px] h-[300px]');
code = code.replace(/<div className="absolute w-\[550px\] h-\[550px\]/g, '<div className="absolute w-[400px] h-[400px]');
code = code.replace(/w-40 h-40/g, 'w-32 h-32');
code = code.replace(/w-12 h-12/g, 'w-10 h-10');

// 2. Adjust Carousel size
code = code.replace(/h-\[500px\]/, 'h-[350px]');
code = code.replace(/radius = 600/, 'radius = 450');
code = code.replace(/text-4xl md:text-6xl/, 'text-2xl md:text-4xl');
code = code.replace(/w-\[800px\]/, 'w-[600px]');

fs.writeFileSync('app/page.tsx', code);
