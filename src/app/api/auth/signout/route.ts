import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * 공통 처리 함수
 */
async function signout(request: Request) {
  // 세션/리프레시 토큰 무효화
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get('next') ?? '/start';
  return NextResponse.redirect(new URL(next, origin), { status: 303 });
}

export async function POST(request: Request) {
  return signout(request);
}
export async function GET(request: Request) {
  // 브라우저에서 직접 테스트할 때 편의용
  return signout(request);
}
