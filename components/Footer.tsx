import { Bot } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-black group-hover:scale-105 transition-transform">
                Σ
              </div>
              <span className="text-xl font-bold font-display tracking-tighter uppercase">Nexus AI</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              Transformando a forma como empresas se comunicam com seus clientes através de Inteligência Artificial avançada.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white">Produto</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Agentes de Vendas</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Atendimento ao Cliente</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Integrações</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Preços</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white">Empresa</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Sobre nós</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Carreiras</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Contato</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white">Legal</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Termos de Uso</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Política de Privacidade</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">LGPD</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/40">
          <p>© {new Date().getFullYear()} Nexus AI. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
