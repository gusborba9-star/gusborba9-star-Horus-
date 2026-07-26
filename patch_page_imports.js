const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');
code = code.replace("import { ChevronRight, CheckCircle2, Zap, BrainCircuit, Activity, Users, Settings, Database, Code, Lock, Shield, CreditCard, ChevronDown, Check, ArrowDown, ArrowRight, X } from 'lucide-react';", "import { ChevronRight, CheckCircle2, Zap, BrainCircuit, Activity, Users, Settings, Database, Code, Lock, Shield, CreditCard, ChevronDown, Check, ArrowDown, ArrowRight, X, Search, LayoutTemplate } from 'lucide-react';");
fs.writeFileSync('app/page.tsx', code);
