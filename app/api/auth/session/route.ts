import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/server';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('Supabase authentication is not configured.');
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (typeof accessToken !== 'string' || accessToken.length < 20) {
      return NextResponse.json({ error: 'Invalid access token.' }, { status: 400 });
    }

    const { data, error } = await getClient().auth.getUser(accessToken);
    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }

    const response = NextResponse.json({
      authenticated: true,
      user: { id: data.user.id, email: data.user.email ?? null },
    });
    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
    return response;
  } catch (error) {
    console.error('[Auth] Session creation failed:', error);
    return NextResponse.json({ error: 'Unable to establish session.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const { data, error } = await getClient().auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({
    authenticated: true,
    user: { id: data.user.id, email: data.user.email ?? null },
  });
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
