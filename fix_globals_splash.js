const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf-8');

if (!css.includes('fillUp')) {
  css += `
@keyframes fillUp {
  0% { height: 0%; opacity: 0.5; }
  100% { height: 100%; opacity: 1; filter: drop-shadow(0 0 20px rgba(245,158,11,0.5)); }
}
.animate-fill-up {
  animation: fillUp 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(245,158,11,0.2)); }
  50% { filter: drop-shadow(0 0 25px rgba(245,158,11,0.6)); }
}
`;
  fs.writeFileSync('app/globals.css', css);
}
