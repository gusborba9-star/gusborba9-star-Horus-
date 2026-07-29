'use client';

import { Globe } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="Websites"
       moduleIcon={Globe} 
       isSubscriptionMode={true}
    />
  );
}
