'use client';

import { Zap } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="Automações"
       moduleIcon={Zap} 
       isSubscriptionMode={true}
    />
  );
}
