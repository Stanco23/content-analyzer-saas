// Polar.sh integration for Content Analyzer SaaS
// Documentation: https://polar.sh/docs

export const POLAR_PRODUCTS = {
  PRO: process.env.POLAR_PRODUCT_PRO!,
  BUSINESS: process.env.POLAR_PRODUCT_BUSINESS!,
  API_STARTER: process.env.POLAR_PRODUCT_API_STARTER!,
  API_GROWTH: process.env.POLAR_PRODUCT_API_GROWTH!,
  API_ENTERPRISE: process.env.POLAR_PRODUCT_API_ENTERPRISE!,
} as const;

export const TIER_TO_PRODUCT = {
  PRO: process.env.POLAR_PRODUCT_PRO!,
  BUSINESS: process.env.POLAR_PRODUCT_BUSINESS!,
  API_STARTER: process.env.POLAR_PRODUCT_API_STARTER!,
  API_GROWTH: process.env.POLAR_PRODUCT_API_GROWTH!,
  API_ENTERPRISE: process.env.POLAR_PRODUCT_API_ENTERPRISE!,
} as const;

export function getPolarEnvironment(): 'sandbox' | 'production' {
  return process.env.POLAR_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
}

export function getPolarApiUrl(): string {
  const baseUrl = getPolarEnvironment() === 'production'
    ? 'https://api.polar.sh'
    : 'https://sandbox-api.polar.sh';
  return baseUrl;
}

export interface PolarCustomer {
  id: string;
  email: string;
  created_at: string;
}

export interface PolarSubscription {
  id: string;
  customer_id: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  product_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at: string | null;
  canceled_at: string | null;
  created_at: string;
}

export interface PolarCheckout {
  url: string;
  id: string;
}

export interface PolarPortalSession {
  url: string;
  id: string;
}

export class PolarAPI {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.POLAR_API_KEY!;
    this.apiUrl = getPolarApiUrl();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Polar API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  async createCustomer(email: string): Promise<PolarCustomer> {
    return this.request<PolarCustomer>('/v1/customers', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getCustomer(customerId: string): Promise<PolarCustomer> {
    return this.request<PolarCustomer>(`/v1/customers/${customerId}`);
  }

  async createCheckoutSession(params: {
    customer_id?: string;
    product_id: string;
    success_url: string;
    cancel_url?: string;
    customer_email?: string;
  }): Promise<PolarCheckout> {
    return this.request<PolarCheckout>('/v1/checkout/sessions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<PolarPortalSession> {
    return this.request<PolarPortalSession>('/v1/customers/portal-sessions', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        return_url: returnUrl,
      }),
    });
  }

  async getSubscription(subscriptionId: string): Promise<PolarSubscription> {
    return this.request<PolarSubscription>(`/v1/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(subscriptionId: string): Promise<PolarSubscription> {
    return this.request<PolarSubscription>(`/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  async reactivateSubscription(subscriptionId: string): Promise<PolarSubscription> {
    return this.request<PolarSubscription>(`/v1/subscriptions/${subscriptionId}/reactivate`, {
      method: 'POST',
    });
  }
}

export const polar = new PolarAPI();
