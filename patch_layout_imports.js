const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf8');

code = code.replace(/import { ArrowLeft,  useState } from 'react';/, "import { useState } from 'react';");
code = code.replace(/import { ArrowLeft,  usePathname } from 'next\/navigation';/, "import { usePathname } from 'next/navigation';");

fs.writeFileSync('app/dashboard/layout.tsx', code);
