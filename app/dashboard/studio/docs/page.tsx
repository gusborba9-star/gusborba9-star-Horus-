'use client';

import { FileText } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="Documentos"
       moduleIcon={FileText} 
       isSubscriptionMode={true}
    />
  );
}
