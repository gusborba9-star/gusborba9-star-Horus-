'use client';

import { MonitorPlay } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="Apresentações"
       moduleIcon={MonitorPlay} 
       isSubscriptionMode={true}
    />
  );
}
