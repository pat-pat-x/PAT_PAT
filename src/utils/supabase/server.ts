'use server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * 서버 전용
 * 서버에서 세션 검사할 때 필요
 */
// 쿠키 수정 가능한 “write”  로그인 / 로그아웃 / callback / OTP / 비번 변경
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore
            .getAll()
            .map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    }
  );
}

// 쿠키 수정 안 하는 “read-only” 조회(다이어리 가져오기, 프로필 읽기 ..)
export async function createServerSupabaseClientReadOnly() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore
            .getAll()
            .map((c) => ({ name: c.name, value: c.value }));
        },
        //  Server Component에서 쿠키 수정 금지 -> no-op
        setAll() {},
      },
    }
  );
}

/**
 * Admin 권한이 필요한 작업(예: OTP 생성)에 사용
 * Service Role Key 사용 - 환경변수에 SUPABASE_SERVICE_ROLE_KEY 필요
 */
export async function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_DB_URL_SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
