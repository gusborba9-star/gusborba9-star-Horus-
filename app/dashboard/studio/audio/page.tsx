'use client';

import { Mic } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="Áudio"
       moduleIcon={Mic} 
       isSubscriptionMode={true}
    />
  );
}
