'use client';

import { LayoutDashboard } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="Dashboards"
       moduleIcon={LayoutDashboard} 
       isSubscriptionMode={true}
    />
  );
}
