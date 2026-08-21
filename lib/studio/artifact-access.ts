import { createHmac, timingSafeEqual } from 'node:crypto';

const ARTIFACT_TOKEN_TTL_SECONDS = 60 * 60 * 24;

function artifactSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('ARTIFACT_SIGNING_SECRET_MISSING');
  return secret;
}

export function createArtifactToken(resultId: string, expiresAt = Math.floor(Date.now() / 1000) + ARTIFACT_TOKEN_TTL_SECONDS) {
  const signature = createHmac('sha256', artifactSecret()).update(`${resultId}.${expiresAt}`).digest('hex');
  return `${signature}.${expiresAt}`;
}

export function verifyArtifactToken(resultId: string, token: string | null) {
  if (!token) return false;
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;
  const expiresAt = Number(token.slice(separator + 1));
  const signature = token.slice(0, separator);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;
  const expected = createArtifactToken(resultId, expiresAt).slice(0, separator);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
