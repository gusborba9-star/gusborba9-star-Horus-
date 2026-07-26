const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf-8');

code = code.replace(
  /{mobileMenuOpen \? <X className="w-5 h-5" \/> : <Menu className="w-5 h-5" \/>}\n            <\/button>/,
  '{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}\n            </button>\n          </div>'
);

// Add the mobile menu overlay properly just before closing main
code = code.replace(
  /<\/main>/,
  '{mobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}\n      </main>'
);

fs.writeFileSync('app/dashboard/layout.tsx', code);
