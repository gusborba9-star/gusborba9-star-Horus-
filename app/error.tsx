'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">500 - Erro Interno</h1>
      <p className="text-white/60">Ocorreu um erro inesperado.</p>
      <button onClick={() => reset()} className="mt-4 px-4 py-2 bg-cyan-500 text-black rounded-lg font-bold">
        Tentar Novamente
      </button>
    </div>
  );
}
