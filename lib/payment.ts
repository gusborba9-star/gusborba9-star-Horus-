/**
 * Efí Cobranças adapter.
 * Provider boundary only: billing lifecycle remains owned by the Hórus domain.
 */

type EfiConfig = {
  clientId: string;
  clientSecret: string;
  production: boolean;
};

type EfiResponse<T> = {
  code?: number;
  data?: T;
  message?: unknown;
  error?: unknown;
  error_description?: unknown;
};

export type EfiProviderError = {
  status: number;
  provider: 'efi';
  code?: number | string;
  error?: string;
  error_description?: string;
  message?: string;
  request_id?: string;
  correlation_id: string;
};

export class EfiApiError extends Error {
  readonly details: EfiProviderError;

  constructor(details: EfiProviderError) {
    super(`EFI_API_FAILED:${details.status}:${details.error_description ?? details.message ?? details.error ?? details.code ?? 'UNKNOWN'}`);
    this.name = 'EfiApiError';
    this.details = details;
  }
}

export type EfiSubscriptionLink = {
  subscriptionId: string;
  chargeId: string;
  paymentUrl: string;
  status: string;
  total: number;
};

const PLAN_NAMES: Record<string, string> = {
  personal: 'Hórus Personal',
  personal_pro: 'Hórus Personal Pro',
  personal_prime: 'Hórus Personal Prime',
};

function scalar(value: unknown): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return undefined;
}

function diagnosticMessage(value: unknown): string | undefined {
  const direct = scalar(value);
  if (direct) return direct;
  if (!value || typeof value !== 'object') return undefined;
  const object = value as Record<string, unknown>;
  const property = scalar(object.property);
  const message = scalar(object.message);
  if (property && message) return `${message} (${property})`;
  return message ?? property;
}

function providerRequestId(headers: Headers): string | undefined {
  return headers.get('x-request-id') ?? headers.get('x-correlation-id') ?? headers.get('trace-id') ?? undefined;
}

export class PaymentService {
  private readonly config: EfiConfig;
  private token?: { value: string; expiresAt: number };

  constructor() {
    this.config = {
      clientId: process.env.EFI_CLIENT_ID ?? '',
      clientSecret: process.env.EFI_CLIENT_SECRET ?? '',
      production: process.env.EFI_ENVIRONMENT !== 'sandbox',
    };
  }

  private get baseUrl() {
    return this.config.production
      ? 'https://cobrancas.api.efipay.com.br'
      : 'https://cobrancas-h.api.efipay.com.br';
  }

  private assertConfigured() {
    if (!this.config.clientId || !this.config.clientSecret) throw new Error('EFI_NOT_CONFIGURED');
  }

  private async authorize(correlationId = crypto.randomUUID()): Promise<string> {
    this.assertConfigured();
    if (this.token && this.token.expiresAt > Date.now() + 30_000) return this.token.value;

    const basic = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/v1/authorize`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
        'X-Request-ID': correlationId,
      },
      body: JSON.stringify({ grant_type: 'client_credentials' }),
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => ({}))) as EfiResponse<{ access_token?: string; expires_in?: number }>;
    if (!response.ok || !payload.data?.access_token) {
      const details: EfiProviderError = {
        status: response.status,
        provider: 'efi',
        code: payload.code,
        error: scalar(payload.error),
        error_description: diagnosticMessage(payload.error_description),
        message: diagnosticMessage(payload.message),
        request_id: providerRequestId(response.headers),
        correlation_id: correlationId,
      };
      console.error('[EFI_AUTH_FAILED]', details);
      throw new EfiApiError(details);
    }

    const expiresIn = Math.max(60, Number(payload.data.expires_in ?? 300));
    this.token = { value: payload.data.access_token, expiresAt: Date.now() + expiresIn * 1000 };
    return payload.data.access_token;
  }

  private async request<T>(path: string, init: RequestInit = {}, correlationId = crypto.randomUUID()): Promise<T> {
    const token = await this.authorize(correlationId);
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-ID': correlationId,
        ...(init.headers ?? {}),
      },
      cache: 'no-store',
    });
    const payload = (await response.json().catch(() => ({}))) as EfiResponse<T>;
    if (!response.ok) {
      const details: EfiProviderError = {
        status: response.status,
        provider: 'efi',
        code: payload.code,
        error: scalar(payload.error),
        error_description: diagnosticMessage(payload.error_description),
        message: diagnosticMessage(payload.message),
        request_id: providerRequestId(response.headers),
        correlation_id: correlationId,
      };
      console.error('[EFI_API_FAILED]', {
        ...details,
        endpoint: path,
        environment: this.config.production ? 'production' : 'sandbox',
      });
      throw new EfiApiError(details);
    }
    return payload.data as T;
  }

  async listPlans(): Promise<Array<{ plan_id: number; name: string; interval: number; repeats: number | null }>> {
    const data = await this.request<Array<{ plan_id: number; name: string; interval: number; repeats: number | null }>>('/v1/plans');
    return Array.isArray(data) ? data : [];
  }

  async ensureMonthlyPlan(tier: string, correlationId = crypto.randomUUID()): Promise<number> {
    const name = PLAN_NAMES[tier] ?? `Hórus Personal ${tier}`;
    const plans = await this.request<Array<{ plan_id: number; name: string; interval: number; repeats: number | null }>>('/v1/plans', {}, correlationId);
    const existing = plans.find((plan) => plan.name === name && plan.interval === 1 && plan.repeats === null);
    if (existing) return existing.plan_id;

    const data = await this.request<{ plan_id: number }>('/v1/plan', {
      method: 'POST',
      body: JSON.stringify({ name, interval: 1, repeats: null }),
    }, correlationId);
    if (!data?.plan_id) throw new Error('EFI_PLAN_CREATE_FAILED');
    return data.plan_id;
  }

  async createSubscriptionLink(input: {
    tier: string;
    amountCents: number;
    customId: string;
    notificationUrl: string;
    email?: string;
    correlationId?: string;
  }): Promise<EfiSubscriptionLink> {
    const correlationId = input.correlationId ?? crypto.randomUUID();
    const planId = await this.ensureMonthlyPlan(input.tier, correlationId);
    const data = await this.request<{
      subscription_id: number;
      status: string;
      charge: { id: number; status: string; total: number };
      payment_url: string;
    }>(`/v1/plan/${planId}/subscription/one-step/link`, {
      method: 'POST',
      body: JSON.stringify({
        items: [{ amount: 1, name: PLAN_NAMES[input.tier] ?? `Hórus ${input.tier}`, value: input.amountCents }],
        metadata: { custom_id: input.customId, notification_url: input.notificationUrl },
        ...(input.email ? { customer: { email: input.email } } : {}),
        settings: { payment_method: 'all', request_delivery_address: false },
      }),
    }, correlationId);

    if (!data?.subscription_id || !data?.payment_url) throw new Error('EFI_SUBSCRIPTION_LINK_FAILED');
    return {
      subscriptionId: String(data.subscription_id),
      chargeId: String(data.charge?.id ?? ''),
      paymentUrl: data.payment_url,
      status: data.status,
      total: Number(data.charge?.total ?? input.amountCents),
    };
  }

  async getNotification(token: string): Promise<Array<{
    id: number;
    type: string;
    custom_id?: string | null;
    identifiers?: { subscription_id?: number; charge_id?: number };
    status?: { current?: string; previous?: string | null };
    created_at?: string;
  }>> {
    if (!token || token.length > 256) throw new Error('EFI_NOTIFICATION_TOKEN_INVALID');
    return this.request(`/v1/notification/${encodeURIComponent(token)}`);
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.request(`/v1/subscription/${encodeURIComponent(subscriptionId)}/cancel`, { method: 'PUT', body: JSON.stringify({}) });
  }

  async generatePix(amount: number, description: string, customerName?: string): Promise<{ brCode: string; txid: string }> {
    const data = await this.request<{ txid: string; loc?: { id: number }; pixCopiaECola?: string }>(
      '/v2/cob',
      { method: 'POST', body: JSON.stringify({ calendario: { expiracao: 3600 }, valor: { original: amount.toFixed(2) }, chave: process.env.PIX_CHAVE, solicitacaoPagador: `${description}${customerName ? ` - ${customerName}` : ''}` }) },
    );
    if (!data?.txid) throw new Error('EFI_PIX_CREATE_FAILED');
    return { txid: data.txid, brCode: data.pixCopiaECola ?? '' };
  }

  async generateBoleto(amount: number, description: string, customerData: Record<string, unknown>): Promise<{ barcode: string; link: string; chargeId: string }> {
    const data = await this.request<{ charge_id: number; barcode?: string; link?: string }>('/v1/charge', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ name: description, value: Math.round(amount * 100), amount: 1 }],
        metadata: { custom_id: `horus_charge_${Date.now()}` },
        customer: customerData,
      }),
    });
    if (!data?.charge_id) throw new Error('EFI_BOLETO_CREATE_FAILED');
    return { chargeId: String(data.charge_id), barcode: data.barcode ?? '', link: data.link ?? '' };
  }
}

export const paymentService = new PaymentService();
