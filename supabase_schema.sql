-- Hórus OS - Supabase Database Blueprint

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Multi-Tenant Isolation)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_customer_id VARCHAR(255),
    plan_tier VARCHAR(50) DEFAULT 'essential', -- essential, scale, enterprise
    agents_limit INTEGER DEFAULT 1, -- 1 for Essential, 4 for Scale, -1 (Infinite) for Enterprise
    multimodal_credits INTEGER DEFAULT 0 -- Credits for Add-ons (Video, Audio, Advanced Code)
);

-- 2. Users (Linked to Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- admin, member
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agents (Polymorphic AI Agents Configuration)
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL, -- e.g., 'Atendente', 'SDR', 'Orquestrador', 'Creator'
    niche VARCHAR(255),
    system_prompt TEXT NOT NULL, -- The injected DNA/rules
    model VARCHAR(100) DEFAULT 'gemini-2.0-flash',
    is_multimodal BOOLEAN DEFAULT false, -- If true, uses multimodal_credits
    status VARCHAR(50) DEFAULT 'offline', -- online, offline, error
    setup_fee_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Leads / Contacts (CRM)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'new', -- new, qualified, won, lost, churn_risk
    score INTEGER DEFAULT 0, -- Qualification score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Conversations & Memory (Short/Long Term)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- whatsapp, web, instagram
    status VARCHAR(50) DEFAULT 'active', -- active, closed, handed_over
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- user, agent, human_agent
    content TEXT NOT NULL,
    sentiment VARCHAR(50), -- positive, neutral, negative
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Transactions / Billing (Efí Integration Logs)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    transaction_type VARCHAR(50) DEFAULT 'subscription', -- subscription, setup_fee, tokens_addon
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(50), -- pix, boleto, credit_card
    external_reference_id VARCHAR(255), -- Efí TXID or Charge ID
    payment_link TEXT, -- Pix Copia e Cola or Boleto URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only read/write data for their own organization)
CREATE POLICY "Users can view their own organization" ON organizations FOR SELECT USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can view users in their org" ON users FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can manage agents in their org" ON agents FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can manage leads in their org" ON leads FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can manage conversations in their org" ON conversations FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can manage messages in their org" ON messages FOR ALL USING (conversation_id IN (SELECT id FROM conversations WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Users can manage transactions in their org" ON transactions FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
