import { createServerSupabaseClientReadOnly } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClientReadOnly();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, reason: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from('users')
    .select('user_id, auth_user_id, email, nickname')
    .eq('auth_user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (!profile) {
    return NextResponse.json(
      { ok: false, reason: 'PROFILE_NOT_FOUND' },
      { status: 404 }
    );
  }

  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  const { count: starCount } = await supabase
    .from('star')
    .select('star_id', { count: 'exact', head: true })
    .gte('created_at', monday.toISOString())
    .eq('auth_user_id', user.id);

  const { count: diaryCount } = await supabase
    .from('diary')
    .select('diary_id', { count: 'exact', head: true })
    .eq('auth_user_id', user.id)
    .gte('created_at', monday.toISOString());

  const today = new Date().toISOString().slice(0, 10);

  const { count: todayCount } = await supabase
    .from('diary')
    .select('diary_id', { count: 'exact', head: true })
    .eq('auth_user_id', user.id)
    .eq('entry_date', today);

  return NextResponse.json({
    ok: true,
    data: {
      profile: {
        nickname: profile.nickname,
        email: profile.email,
      },
      starCount: starCount ?? 0,
      diaryCount: diaryCount ?? 0,
      isDiary: !!todayCount,
    },
  });
}
