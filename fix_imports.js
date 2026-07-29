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
    
    // Explicitly replace the exact import lines
    code = code.replace(/import NexusDiscoveryFlow, \{ Question \} from '\.\.\/studio\/components\/NexusDiscoveryFlow';/g, "import NexusDiscoveryFlow from '../studio/components/NexusDiscoveryFlow';");
    
    code = code.replace(/import NexusDiscoveryFlow, \{ Question \} from '\.\/components\/NexusDiscoveryFlow';/g, "import NexusDiscoveryFlow from './components/NexusDiscoveryFlow';");
    
    // Since some files are in `app/dashboard/studio/*/page.tsx`, the relative path is `../components/NexusDiscoveryFlow`
    code = code.replace(/import NexusDiscoveryFlow,\s*\{ Question \}\s*from\s*'[^']+';/g, (match) => {
        return match.replace(/,\s*\{\s*Question\s*\}/, '');
    });

    fs.writeFileSync(file, code);
  } catch(e) {
    console.error("Error fixing " + file, e.message);
  }
}
