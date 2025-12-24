export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const ErrorCodes = {
  INVALID_API_KEY: { status: 401, message: 'Invalid API key provided' },
  EXPIRED_API_KEY: { status: 401, message: 'API key has expired' },
  REVOKED_API_KEY: { status: 401, message: 'API key has been revoked' },
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Rate limit exceeded' },
  QUOTA_EXCEEDED: { status: 402, message: 'Monthly quota exceeded' },
  INVALID_REQUEST: { status: 400, message: 'Invalid request' },
  INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
  IP_NOT_WHITELISTED: { status: 403, message: 'IP address not whitelisted' },
} as const;
