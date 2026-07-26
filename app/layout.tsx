import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import SupportChat from '@/components/SupportChat';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Hórus OS | O Sistema Operacional Cognitivo',
  description: 'A revolução da força de trabalho digital com Inteligência Artificial e Agentes Polimórficos.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable} dark scroll-smooth`}>
      <body className="bg-[#090A0F]/80 text-[#E5E7EB] font-sans antialiased overflow-x-hidden break-words" suppressHydrationWarning>
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
