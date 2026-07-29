#!/bin/bash

update_module() {
  local dir=$1
  local name=$2
  local icon=$3

  cat << INNER_EOF > app/dashboard/studio/$dir/page.tsx
'use client';

import { $icon } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function Page() {
  return (
    <NexusDiscoveryFlow 
       moduleName="$name"
       moduleIcon={${icon%% as*}} 
       isSubscriptionMode={true}
    />
  );
}
INNER_EOF
}

update_module "apps" "Aplicativos" "Smartphone"
update_module "audio" "Áudio" "Mic"
update_module "automations" "Automações" "Zap"
update_module "code" "Código" "Code"
update_module "dashboards" "Dashboards" "LayoutDashboard"
update_module "docs" "Documentos" "FileText"
update_module "image" "Imagens" "Image as ImageIcon"
update_module "presentations" "Apresentações" "MonitorPlay"
update_module "websites" "Websites" "Globe"
