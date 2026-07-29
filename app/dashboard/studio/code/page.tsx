'use client';

import { Code } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="Código"
       moduleIcon={Code} 
       isSubscriptionMode={true}
    />
  );
}
