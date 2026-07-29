const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', 'utf8');

code = code.replace(
  /renderPreview\?: \(\) => React\.ReactNode;/,
  'renderPreview?: () => React.ReactNode;\n  isSubscriptionMode?: boolean;'
);

code = code.replace(
  /renderPreview \}: NexusDiscoveryFlowProps/,
  'renderPreview, isSubscriptionMode }: NexusDiscoveryFlowProps'
);

fs.writeFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', code);
