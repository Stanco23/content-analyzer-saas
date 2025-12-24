import { NextResponse } from 'next/server';

interface SuccessResponse<T> {
  success: true;
  data: T;
  usage?: {
    daily_remaining: number;
    monthly_remaining: number;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    limit?: number;
    remaining?: number;
    reset_at?: string;
  };
}

export function successResponse<T>(
  data: T,
  options?: {
    usage?: { daily_remaining: number; monthly_remaining: number };
    headers?: Record<string, string>;
  }
) {
  const body: SuccessResponse<T> = { success: true, data };
  if (options?.usage) body.usage = options.usage;

  return NextResponse.json(body, { headers: options?.headers });
}

export function errorResponse(
  code: string,
  message: string,
  statusCode: number,
  extra?: Record<string, any>
) {
  const body: ErrorResponse = {
    success: false,
    error: { code, message, ...extra },
  };

  return NextResponse.json(body, { status: statusCode });
}
