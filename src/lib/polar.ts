// Polar.sh integration for Content Analyzer SaaS
// Documentation: https://polar.sh/docs

// Organization ID is required for checkout sessions
const POLAR_ORG_ID = process.env.POLAR_ORGANIZATION_ID;

export const POLAR_PRODUCTS = {
  PRO_MONTHLY: process.env.POLAR_PRODUCT_PRO_MONTHLY!,
  PRO_ANNUAL: process.env.POLAR_PRODUCT_PRO_ANNUAL!,
  BUSINESS_MONTHLY: process.env.POLAR_PRODUCT_BUSINESS_MONTHLY!,
  BUSINESS_ANNUAL: process.env.POLAR_PRODUCT_BUSINESS_ANNUAL!,
  API_STARTER: process.env.POLAR_PRODUCT_API_STARTER!,
  API_GROWTH: process.env.POLAR_PRODUCT_API_GROWTH!,
  API_ENTERPRISE: process.env.POLAR_PRODUCT_API_ENTERPRISE!,
} as const;

export const TIER_TO_PRODUCT: Record<string, string> = {
  PRO_MONTHLY: process.env.POLAR_PRODUCT_PRO_MONTHLY!,
  PRO_ANNUAL: process.env.POLAR_PRODUCT_PRO_ANNUAL!,
  BUSINESS_MONTHLY: process.env.POLAR_PRODUCT_BUSINESS_MONTHLY!,
  BUSINESS_ANNUAL: process.env.POLAR_PRODUCT_BUSINESS_ANNUAL!,
  API_STARTER: process.env.POLAR_PRODUCT_API_STARTER!,
  API_GROWTH: process.env.POLAR_PRODUCT_API_GROWTH!,
  API_ENTERPRISE: process.env.POLAR_PRODUCT_API_ENTERPRISE!,
};

export function getPolarEnvironment(): 'sandbox' | 'production' {
  return process.env.POLAR_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
}

export function getPolarApiUrl(): string {
  const isProd = process.env.POLAR_ENVIRONMENT === 'production';
  // Polar sandbox uses a different URL
  return isProd ? 'https://api.polar.sh/v1' : 'https://sandbox-api.polar.sh/v1';
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
  id: string;
  url: string;
  status: string;
  client_secret?: string;
  expires_at: string;
  amount: number;
  currency: string;
}

export interface PolarPortalSession {
  url: string;
  id: string;
}

export class PolarAPI {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.POLAR_API_KEY || '';
    this.apiUrl = getPolarApiUrl();
    console.log('Polar API initialized:', {
      url: this.apiUrl,
      hasKey: !!this.apiKey,
      hasOrgId: !!POLAR_ORG_ID,
      env: process.env.POLAR_ENVIRONMENT,
    });
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log('Polar API request:', { method: options.method || 'GET', url });

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Polar API error:', { status: response.status, error, url });
      throw new Error(`Polar API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  async createCustomer(email: string): Promise<PolarCustomer> {
    return this.request<PolarCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getCustomer(customerId: string): Promise<PolarCustomer> {
    return this.request<PolarCustomer>(`/customers/${customerId}`);
  }

  async createCheckoutSession(params: {
    customer_id?: string;
    product_id: string;
    success_url: string;
    cancel_url?: string;
    customer_email?: string;
  }): Promise<PolarCheckout> {
    const body = POLAR_ORG_ID
      ? { ...params, organization_id: POLAR_ORG_ID }
      : params;
    return this.request<PolarCheckout>('/checkouts', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<PolarPortalSession> {
    return this.request<PolarPortalSession>('/customers/portal-sessions', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        return_url: returnUrl,
      }),
    });
  }

  async getSubscription(subscriptionId: string): Promise<PolarSubscription> {
    return this.request<PolarSubscription>(`/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(subscriptionId: string): Promise<PolarSubscription> {
    return this.request<PolarSubscription>(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  async reactivateSubscription(subscriptionId: string): Promise<PolarSubscription> {
    return this.request<PolarSubscription>(`/subscriptions/${subscriptionId}/reactivate`, {
      method: 'POST',
    });
  }
}

export const polar = new PolarAPI();
