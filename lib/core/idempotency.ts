export function assertValidIdempotencyKey(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('INVALID_IDEMPOTENCY_KEY');
  }
}
