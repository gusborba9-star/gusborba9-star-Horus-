const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/*.{tsx,ts}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  let modified = content;
  // Fix hovers
  modified = modified.replace(/hover:bg-white\/\[0\.03\] backdrop-blur-xl/g, 'hover:bg-white/[0.05]');
  // Fix double blurs
  modified = modified.replace(/backdrop-blur-xl backdrop-blur-md/g, 'backdrop-blur-xl');
  modified = modified.replace(/backdrop-blur-xl backdrop-blur-sm/g, 'backdrop-blur-xl');
  modified = modified.replace(/backdrop-blur-md backdrop-blur-xl/g, 'backdrop-blur-xl');
  
  if (content !== modified) {
    fs.writeFileSync(file, modified);
    console.log(`Fixed ${file}`);
  }
});
