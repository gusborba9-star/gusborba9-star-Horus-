export const PERSONAL_TIERS = {
  PERSONAL: { id: 'PERSONAL', name: 'Personal', priceBrl: 49.9, positioning: 'Seu Hórus para todos os dias.' },
  PERSONAL_PRO: { id: 'PERSONAL_PRO', name: 'Personal Pro', priceBrl: 79.9, positioning: 'Mais capacidade para uma rotina mais intensa.' },
  PERSONAL_PRIME: { id: 'PERSONAL_PRIME', name: 'Personal Prime', priceBrl: 159.9, positioning: 'Seu Hórus sempre ao seu lado.' },
} as const;

export type PersonalTier = keyof typeof PERSONAL_TIERS;

export const PERSONAL_PERSONA_IDS = ['aline', 'luiza', 'iris', 'clara', 'bel', 'lucia'] as const;
export type PersonalPersonaId = (typeof PERSONAL_PERSONA_IDS)[number];

export function isPersonalTier(value: unknown): value is PersonalTier {
  return typeof value === 'string' && value in PERSONAL_TIERS;
}

export function isPersonalPersonaId(value: unknown): value is PersonalPersonaId {
  return typeof value === 'string' && (PERSONAL_PERSONA_IDS as readonly string[]).includes(value);
}
