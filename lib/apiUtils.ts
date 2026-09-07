import { NextResponse } from 'next/server';

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function handleApiError(err: unknown) {
  if (err instanceof HttpError) {
    return jsonError(err.message, err.status, err.details);
  }
  console.error('Unhandled API error:', err);
  return jsonError('Something went wrong. Please try again.', 500);
}
