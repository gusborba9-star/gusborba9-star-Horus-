'use client';

import { Smartphone } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="Aplicativos"
       moduleIcon={Smartphone} 
       isSubscriptionMode={true}
    />
  );
}
