export const PERSONAL_TIERS = {
  PERSONAL: {
    id: 'PERSONAL',
    name: 'Personal',
    priceBrl: 49.9,
    positioning: 'Seu Hórus para todos os dias.',
    economicProfile: 'PERSONAL_STANDARD',
    maxProviderCostBrl: 0.02,
    maxOutputTokens: 900,
  },
  PERSONAL_PRO: {
    id: 'PERSONAL_PRO',
    name: 'Personal Pro',
    priceBrl: 79.9,
    positioning: 'Mais capacidade para uma rotina mais intensa.',
    economicProfile: 'PERSONAL_PRO',
    maxProviderCostBrl: 0.04,
    maxOutputTokens: 1400,
  },
  PERSONAL_PRIME: {
    id: 'PERSONAL_PRIME',
    name: 'Personal Prime',
    priceBrl: 159.9,
    positioning: 'Seu Hórus sempre ao seu lado.',
    economicProfile: 'PERSONAL_PRIME',
    maxProviderCostBrl: 0.08,
    maxOutputTokens: 2200,
  },
} as const;

export type PersonalTier = keyof typeof PERSONAL_TIERS;
export type PersonalEconomicProfile = (typeof PERSONAL_TIERS)[PersonalTier]['economicProfile'];

export const PERSONAL_PERSONA_IDS = ['aline', 'luiza', 'iris', 'clara', 'bel', 'lucia'] as const;
export type PersonalPersonaId = (typeof PERSONAL_PERSONA_IDS)[number];

export function isPersonalTier(value: unknown): value is PersonalTier {
  return typeof value === 'string' && value in PERSONAL_TIERS;
}

export function isPersonalPersonaId(value: unknown): value is PersonalPersonaId {
  return typeof value === 'string' && (PERSONAL_PERSONA_IDS as readonly string[]).includes(value);
}
