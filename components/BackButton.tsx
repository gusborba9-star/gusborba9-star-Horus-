'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButton({ label = 'Voltar', fallbackHref = '/dashboard' }: { label?: string, fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors py-2"
    >
      <ArrowLeft className="w-4 h-4" /> {label}
    </button>
  );
}
