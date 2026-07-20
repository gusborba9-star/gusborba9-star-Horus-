'use client';

import { useState } from 'react';
import { BrainCircuit, Settings2, ShieldCheck, Zap, Bot, Send, Database, Link as LinkIcon, FileText } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function NewAgentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    businessType: 'B2B',
    goal: '',
    tone: 'Profissional',
    rules: '',
    knowledgeSource: 'manual',
    erpUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to create agent via Core Engine
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/dashboard/agents');
    }, 1500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="mb-4">
        <BackButton label="Voltar para Funcionários" fallbackHref="/dashboard/agents" />
      </div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Bot className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Funcionário Digital</h1>
          <p className="text-white/50 mt-1">Configure um agente inteligente polimórfico para sua operação.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-cyan-400" /> Identidade Básica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Nome do Funcionário</label>
              <input
                type="text"
                placeholder="Ex: Carlos (Expansão)"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Setor / Indústria / Nicho</label>
              <input
                type="text"
                list="niche-options"
                placeholder="Ex: Imobiliário, Advocacia, Saúde"
                required
                value={formData.niche}
                onChange={e => setFormData({ ...formData, niche: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
              <datalist id="niche-options">
                <option value="Academia e Fitness" />
                <option value="Advocacia e Jurídico" />
                <option value="Agências de Marketing" />
                <option value="Arquitetura e Engenharia" />
                <option value="B2B Corporativo" />
                <option value="Clínicas de Estética" />
                <option value="Clínicas Médicas e Odontológicas" />
                <option value="Comércio Local" />
                <option value="Concessionárias e Veículos" />
                <option value="Contabilidade e Finanças" />
                <option value="Cursos e Infoprodutos" />
                <option value="E-commerce e Varejo" />
                <option value="Educação e Escolas" />
                <option value="Eventos e Produtoras" />
                <option value="Hotelaria e Turismo" />
                <option value="Imobiliárias e Corretores" />
                <option value="Logística e Entregas" />
                <option value="Oficinas Mecânicas" />
                <option value="PetShops e Veterinárias" />
                <option value="Restaurantes e Delivery" />
                <option value="SaaS e Tecnologia" />
                <option value="Salões de Beleza e Barbearias" />
                <option value="Serviços Residenciais (Limpeza, Reformas)" />
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Tipo de Negócio</label>
              <select
                value={formData.businessType}
                onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 appearance-none"
              >
                <option value="B2B">B2B (Empresas)</option>
                <option value="B2C">B2C (Consumidor Final)</option>
                <option value="Servicos">Prestação de Serviços</option>
                <option value="Produtos">Venda de Produtos</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Tom de Voz</label>
              <select
                value={formData.tone}
                onChange={e => setFormData({ ...formData, tone: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 appearance-none"
              >
                <option value="Profissional">Profissional & Direto</option>
                <option value="Empatico">Empático & Acolhedor</option>
                <option value="Persuasivo">Agressivo & Persuasivo (Vendas)</option>
                <option value="Descontraido">Descontraído & Informal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" /> Diretrizes Cognitivas
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Objetivo Principal do Agente</label>
              <input
                type="text"
                placeholder="Ex: Qualificar leads frios e gerar links de cobrança via Pix"
                required
                value={formData.goal}
                onChange={e => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Regras de Negócio & Contorno de Objeções (DNA)</label>
              <textarea
                placeholder="Escreva diretrizes claras. Ex: Nunca dê desconto maior que 10%. Se o cliente reclamar do preço, enfatize o ROI a longo prazo..."
                required
                rows={5}
                value={formData.rules}
                onChange={e => setFormData({ ...formData, rules: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" /> Base de Conhecimento e Integrações
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-white/70">Fonte de Dados do Agente</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`cursor-pointer border rounded-xl p-4 transition-all ${formData.knowledgeSource === 'manual' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-black/50 border-white/10 hover:border-white/30'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input 
                      type="radio" 
                      name="knowledgeSource" 
                      value="manual"
                      checked={formData.knowledgeSource === 'manual'}
                      onChange={e => setFormData({ ...formData, knowledgeSource: e.target.value })}
                      className="text-cyan-500 bg-black/50 border-white/20 focus:ring-cyan-500/50" 
                    />
                    <FileText className="w-5 h-5 text-white/70" />
                    <span className="font-semibold">Configuração Manual (Texto)</span>
                  </div>
                  <p className="text-xs text-white/50 pl-8">Ideal para autônomos e pequenos negócios. Ensine o agente digitando regras e informações diretamente.</p>
                </label>

                <label className={`cursor-pointer border rounded-xl p-4 transition-all ${formData.knowledgeSource === 'erp' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-black/50 border-white/10 hover:border-white/30'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input 
                      type="radio" 
                      name="knowledgeSource" 
                      value="erp"
                      checked={formData.knowledgeSource === 'erp'}
                      onChange={e => setFormData({ ...formData, knowledgeSource: e.target.value })}
                      className="text-cyan-500 bg-black/50 border-white/20 focus:ring-cyan-500/50" 
                    />
                    <LinkIcon className="w-5 h-5 text-white/70" />
                    <span className="font-semibold">Conexão 1-Click (CRM/ERP)</span>
                  </div>
                  <p className="text-xs text-white/50 pl-8">Para operações em escala. O Hórus OS se conecta ao seu sistema e puxa estoques, preços e leads automaticamente.</p>
                </label>
              </div>
            </div>

            {formData.knowledgeSource === 'erp' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 pt-2"
              >
                <label className="text-sm font-semibold text-white/70">URL do CRM / ERP / API</label>
                <input
                  type="url"
                  placeholder="https://api.seusistema.com.br/v1"
                  value={formData.erpUrl}
                  onChange={e => setFormData({ ...formData, erpUrl: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                />
                <p className="text-xs text-white/40 mt-1">O Hórus Nexus irá varrer os endpoints e sincronizar os dados automaticamente (Memory Graph).</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl py-3 px-8 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Implantar Agente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
