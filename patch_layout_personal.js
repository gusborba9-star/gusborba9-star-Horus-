const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf8');

code = code.replace(
  "{ name: 'Agentes Autônomos', href: '/dashboard/agents', icon: Users },",
  "{ name: 'Colab. Empresariais', href: '/dashboard/agents', icon: Users },\n    { name: 'Colab. de Presença', href: '/dashboard/personal', icon: Smartphone },"
);
code = code.replace(
  "import { \n  BrainCircuit,",
  "import { \n  BrainCircuit, Smartphone,"
);
code = code.replace("import {   BrainCircuit, Users", "import {   BrainCircuit, Users, Smartphone")

fs.writeFileSync('app/dashboard/layout.tsx', code);
