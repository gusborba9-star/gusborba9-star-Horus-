export type ApiErrorContract = { status: number; code: string };

export function classifyApiError(error: unknown): ApiErrorContract {
  if (error instanceof Error) {
    if (error.message === 'AUTHENTICATION_REQUIRED') return { status: 401, code: 'AUTHENTICATION_REQUIRED' };
    if (error.message === 'FORBIDDEN') return { status: 403, code: 'FORBIDDEN' };
  }
  return { status: 500, code: 'INTERNAL_SERVER_ERROR' };
}

export function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}
