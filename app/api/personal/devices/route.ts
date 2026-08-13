import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';

function hashDeviceKey(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'PERSONAL_DEVICE_REQUEST_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'PERSONAL_SUBSCRIPTION_REQUIRED' ? 403 : message === 'PERSONAL_DEVICE_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const service = getServiceSupabase();
    const { data, error } = await service.from('personal_devices').select('id,platform,app_version,status,last_seen_at,created_at,revoked_at').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw new Error(`PERSONAL_DEVICE_LOOKUP_FAILED:${error.message}`);
    return NextResponse.json({ success: true, devices: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const deviceKey = typeof body.device_key === 'string' ? body.device_key.trim() : '';
    const platform = typeof body.platform === 'string' ? body.platform.toUpperCase() : '';
    const appVersion = typeof body.app_version === 'string' ? body.app_version.trim().slice(0, 64) : null;
    if (!deviceKey || deviceKey.length < 32 || deviceKey.length > 512) throw new Error('PERSONAL_DEVICE_KEY_INVALID');
    if (!['ANDROID', 'IOS', 'WEB', 'OTHER'].includes(platform)) throw new Error('PERSONAL_DEVICE_PLATFORM_INVALID');

    const service = getServiceSupabase();
    const { data: subscription, error: subscriptionError } = await service.from('personal_subscriptions').select('id').eq('user_id', user.id).eq('status', 'ACTIVE').maybeSingle();
    if (subscriptionError) throw new Error(`PERSONAL_SUBSCRIPTION_LOOKUP_FAILED:${subscriptionError.message}`);
    if (!subscription) throw new Error('PERSONAL_SUBSCRIPTION_REQUIRED');

    const { data: device, error } = await service.from('personal_devices').upsert({
      user_id: user.id,
      device_key_hash: hashDeviceKey(deviceKey),
      platform,
      app_version: appVersion,
      status: 'ACTIVE',
      last_seen_at: new Date().toISOString(),
      revoked_at: null,
    }, { onConflict: 'user_id,device_key_hash' }).select('id,platform,app_version,status,last_seen_at,created_at,revoked_at').single();
    if (error || !device) throw new Error(`PERSONAL_DEVICE_ACTIVATION_FAILED:${error?.message ?? 'UNKNOWN'}`);
    return NextResponse.json({ success: true, device });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const deviceId = typeof body.device_id === 'string' ? body.device_id : '';
    if (!deviceId) throw new Error('PERSONAL_DEVICE_ID_REQUIRED');

    const service = getServiceSupabase();
    const { data: device, error: lookupError } = await service.from('personal_devices').select('id,status').eq('id', deviceId).eq('user_id', user.id).maybeSingle();
    if (lookupError) throw new Error(`PERSONAL_DEVICE_LOOKUP_FAILED:${lookupError.message}`);
    if (!device) throw new Error('PERSONAL_DEVICE_NOT_FOUND');

    const { data: revoked, error } = await service.from('personal_devices').update({ status: 'REVOKED', revoked_at: new Date().toISOString() }).eq('id', deviceId).eq('user_id', user.id).select('id,platform,app_version,status,last_seen_at,created_at,revoked_at').single();
    if (error || !revoked) throw new Error(`PERSONAL_DEVICE_REVOKE_FAILED:${error?.message ?? 'UNKNOWN'}`);
    return NextResponse.json({ success: true, device: revoked });
  } catch (error) {
    return errorResponse(error);
  }
}
