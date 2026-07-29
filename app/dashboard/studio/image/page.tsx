'use client';

import { Image as ImageIcon } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="Imagens"
       moduleIcon={ImageIcon} 
       isSubscriptionMode={true}
    />
  );
}
