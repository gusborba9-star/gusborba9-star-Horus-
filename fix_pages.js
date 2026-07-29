const fs = require('fs');

const filesToFix = [
  'app/dashboard/studio/campaigns/page.tsx',
  'app/dashboard/studio/music/page.tsx',
  'app/dashboard/studio/dev/page.tsx',
  'app/dashboard/studio/video/page.tsx',
  'app/dashboard/agents/page.tsx'
];

for (const file of filesToFix) {
  try {
    let code = fs.readFileSync(file, 'utf8');
    
    // Remove import of Question
    code = code.replace(/,\s*Question/g, '');
    code = code.replace(/Question\s*,/g, '');
    code = code.replace(/import { Question } from '.*?';\n?/g, '');
    
    // Remove const questions = [ ... ]; entirely
    // This regex matches "const questions: Question[] = [" until the end of the array.
    code = code.replace(/const questions(?::\s*Question\[\])?\s*=\s*\[[\s\S]*?\];\s*(?:return|const renderPreview|const handleFinish)/g, (match) => {
        // Just extract what comes after the array
        const parts = match.split('];');
        return parts[parts.length - 1].trim();
    });
    
    fs.writeFileSync(file, code);
  } catch(e) {
    console.error("Error fixing " + file, e.message);
  }
}
