const fs = require('fs');
let code = fs.readFileSync('app/dashboard/apis/page.tsx', 'utf-8');
code = code.replace(
  /import { ArrowLeft, Database, Key, Copy, Eye, Zap, ShieldCheck } from 'lucide-react';/,
  "import { ArrowLeft, Database, Key, Copy, Eye, Zap, ShieldCheck, Edit3, Plus } from 'lucide-react';"
);
// Remove the potentially duplicated Plus or Edit3 if my previous script did something weird
code = code.replace(/Edit3, Plus, Plus/g, 'Edit3, Plus');
fs.writeFileSync('app/dashboard/apis/page.tsx', code);
