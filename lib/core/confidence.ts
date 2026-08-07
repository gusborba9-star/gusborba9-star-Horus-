export type ConfidenceInput = { eventType: string; payload: Record<string, unknown>; source: string; memoryMatches: number; humanApproval?: { reviewId: string; approved: boolean } };

export function validateCoreInput(input: ConfidenceInput): { valid: boolean; error?: string } {
  return input.eventType ? { valid: true } : { valid: false, error: 'event_type é obrigatório' };
}

function roundConfidence(value: number): number {
  return Math.round(value * 100) / 100;
}

export function assessCoreConfidence(input: ConfidenceInput): { confidence: number; requiresHuman: boolean; action: 'human_review' | 'route_to_service' | 'invalid_request' } {
  if (!validateCoreInput(input).valid) return { confidence: 0, requiresHuman: true, action: 'invalid_request' };
  let confidence = 0.55;
  if (input.payload.intent) confidence += 0.15;
  if (input.payload.operation) confidence += 0.10;
  if (input.memoryMatches > 0) confidence += 0.10;
  if (input.source) confidence += 0.05;
  if (input.payload.request_id) confidence += 0.05;
  confidence = roundConfidence(Math.min(1, confidence));
  const approved = input.humanApproval?.approved === true && Boolean(input.humanApproval.reviewId);
  if (approved) return { confidence: Math.max(confidence, 0.7), requiresHuman: false, action: 'route_to_service' };
  return confidence < 0.7 ? { confidence, requiresHuman: true, action: 'human_review' } : { confidence, requiresHuman: false, action: 'route_to_service' };
}
