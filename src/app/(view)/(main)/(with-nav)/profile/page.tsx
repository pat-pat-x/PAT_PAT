'use client';

import SocialLogout from '@/features/auth/components/socialLogout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDiaryStats } from '@/features/home/hooks/useDiaryStats';
import { useUserProfile } from '@/features/profile/hooks/useUserProfile';
import Link from 'next/link';
import { useState } from 'react';

export default function AccountPage() {
  const { user } = useAuth({ required: true });
  const { profile, loading: profileLoading } = useUserProfile();
  const { stats, loading: statsLoading } = useDiaryStats();

  const [notifOn, setNotifOn] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);

  const loading = profileLoading || statsLoading;

  if (loading) {
    return (
      <main className="relative min-h-[100svh] overflow-hidden flex items-center justify-center">
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-[radial-gradient(100%_70%_at_50%_100%,#0b1d4a_0%,#091430_48%,#070f24_100%)]"
        />
        <div className="text-white/70">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden">
      {/* 배경 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(100%_70%_at_50%_100%,#0b1d4a_0%,#091430_48%,#070f24_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.28))]"
      />

      {/* 컨테이너 */}
      <section className="relative mx-auto w-full max-w-[480px] px-5">
        {/* 헤더 */}
        <header className="pt-6 pb-3 flex items-center justify-between">
          <h1 className="text-white text-[20px] font-semibold tracking-tight">
            내 정보
          </h1>
          <Link
            href="/home"
            className="text-white/80 text-[13px] underline underline-offset-4 hover:text-white transition"
          >
            홈으로
          </Link>
        </header>

        {/* 콘텐츠 */}
        <div className="space-y-5 pb-[88px]">
          {/* 프로필 + 간단 지표 */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-[64px] h-[64px] rounded-2xl bg-white/8 border border-white/12 overflow-hidden flex items-center justify-center">
                <img
                  src="/images/icon/lumi/lumi_main.svg"
                  alt="루미"
                  className="w-[56px] h-[56px] object-contain"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.12),transparent_60%)]"
                />
              </div>
              <div className="min-w-0">
                <p className="text-white/90 text-[15px] leading-snug truncate">
                  안녕하세요, {profile?.nickname || '별빛 기록가'}님 ✨
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {stats?.weeklyMood && (
                    <Badge>이번 주 감정: {stats.weeklyMood}</Badge>
                  )}
                  <Badge>
                    총 {(stats?.totalStars ?? 0) + (stats?.totalWorries ?? 0)}개
                    기록
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-[12px] overflow-hidden border border-white/10">
              <StatCell
                label="오늘의 별"
                value={String(stats?.totalStars ?? 0)}
              />
              <StatCell
                label="걱정 비움"
                value={String(stats?.totalWorries ?? 0)}
              />
              <StatCell
                label="전체 기록"
                value={String(
                  (stats?.totalStars ?? 0) + (stats?.totalWorries ?? 0)
                )}
              />
            </div>
          </GlassCard>

          {/* 계정 */}
          <GlassCard className="p-1.5">
            <SectionTitle>계정</SectionTitle>
            <SettingRow label="이메일" desc={user?.email || '이메일 없음'} />
            <SettingRow
              label="로그인 방식"
              right={
                <div className="flex items-center gap-2">
                  {user?.app_metadata?.provider === 'kakao' && (
                    <IdP pill="KAKAO" />
                  )}
                  {user?.app_metadata?.provider === 'google' && (
                    <IdP pill="Google" />
                  )}
                  {user?.app_metadata?.provider === 'email' && (
                    <IdP pill="Email" />
                  )}
                  {!user?.app_metadata?.provider && <IdP pill="Email" />}
                </div>
              }
            />
            <SettingLink
              href="/lumi/account/security"
              label="보안 설정"
              desc="비밀번호/2단계 인증"
            />
          </GlassCard>

          {/* 환경설정 */}
          <GlassCard className="p-1.5">
            <SectionTitle>환경설정</SectionTitle>
            <ToggleRow
              label="알림"
              desc="저녁 9시에 기록 리마인드"
              value={notifOn}
              onChange={setNotifOn}
            />
            <ToggleRow
              label="사운드"
              desc="보내기/별 만들기 사운드"
              value={soundOn}
              onChange={setSoundOn}
            />
            <ToggleRow
              label="비공개 모드"
              desc="공유 시 닉네임/프로필 숨김"
              value={privateMode}
              onChange={setPrivateMode}
            />
          </GlassCard>

          {/* 데이터 */}
          <GlassCard className="p-1.5">
            <SectionTitle>데이터</SectionTitle>
            <SettingLink
              href="/lumi/data/export"
              label="데이터 내보내기"
              desc="CSV · 텍스트 백업"
            />
            <SettingLink
              href="/lumi/data/backup"
              label="iCloud/Drive 백업"
              desc="자동 백업 설정"
            />
            <SettingLink
              href="/lumi/data/import"
              label="가져오기"
              desc="다른 앱에서 이동"
            />
          </GlassCard>

          {/* 지원 */}
          <GlassCard className="p-1.5">
            <SectionTitle>지원</SectionTitle>
            <SettingLink
              href="/lumi/help"
              label="도움말"
              desc="자주 묻는 질문"
            />
            <SettingLink
              href="/lumi/contact"
              label="문의하기"
              desc="피드백 보내기"
            />
            <SettingLink href="/lumi/terms" label="이용약관 · 개인정보" />
          </GlassCard>

          {/* 세션/위험영역 */}
          <div className="grid grid-cols-2 gap-3">
            <SocialLogout
              next="/start"
              className="h-11 rounded-[12px] text-[13px] font-medium text-white/85 bg-white/6 border border-white/12 hover:bg-white/10 transition"
            />
            <button
              type="button"
              className="h-11 rounded-[12px] text-[13px] font-medium text-white/80 bg-white/6 border border-white/12 hover:border-red-400/40 hover:text-red-300 hover:bg-red-500/10 transition"
            >
              계정 삭제
            </button>
          </div>

          {/* 하단 여백(Safe area) */}
          <div style={{ height: 'max(16px, env(safe-area-inset-bottom))' }} />
        </div>
      </section>
    </main>
  );
}

/* ----------------- 재사용 컴포넌트 ----------------- */

function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        'rounded-[16px] border border-white/12 bg-white/6 backdrop-blur',
        className || '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-3">
      <h2 className="text-white/85 text-[13px] font-semibold tracking-[-0.01em]">
        {children}
      </h2>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 h-6 inline-flex items-center rounded-full text-[11px] bg-white/6 text-white/85 border border-white/10">
      {children}
    </span>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/6">
      <div className="p-3 text-center">
        <div className="text-white text-[18px] font-semibold">{value}</div>
        <div className="text-white/65 text-[12px] mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  desc,
  right,
}: {
  label: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center justify-between border-t border-white/8 first:border-t-0">
      <div className="min-w-0">
        <div className="text-white/90 text-[14px]">{label}</div>
        {desc && <div className="text-white/60 text-[12px] mt-0.5">{desc}</div>}
      </div>
      {right}
    </div>
  );
}

function SettingLink({
  href,
  label,
  desc,
}: {
  href: string;
  label: string;
  desc?: string;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-3.5 flex items-center justify-between border-t border-white/8 first:border-t-0 group"
    >
      <div className="min-w-0">
        <div className="text-white/90 text-[14px] group-hover:text-white transition">
          {label}
        </div>
        {desc && <div className="text-white/60 text-[12px] mt-0.5">{desc}</div>}
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        className="text-white/70 group-hover:text-white transition"
      >
        <path
          d="M9 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </Link>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <SettingRow
      label={label}
      desc={desc}
      right={
        value ? (
          <button
            type="button"
            title="switch"
            role="switch"
            aria-checked="true"
            aria-label={label}
            onClick={() => onChange(!value)}
            className="h-7 w-[46px] rounded-full border transition relative bg-cyan-300/25 border-cyan-300/50"
          >
            <span
              aria-hidden
              className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow transition left-[26px]"
            />
          </button>
        ) : (
          <button
            type="button"
            title="switch"
            role="switch"
            aria-checked="false"
            aria-label={label}
            onClick={() => onChange(!value)}
            className="h-7 w-[46px] rounded-full border transition relative bg-white/6 border-white/12"
          >
            <span
              aria-hidden
              className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow transition left-[4px]"
            />
          </button>
        )
      }
    />
  );
}

function IdP({ pill }: { pill: 'KAKAO' | 'Google' | 'Email' }) {
  return (
    <span className="px-2.5 h-7 inline-flex items-center rounded-full text-[12px] bg-white/6 text-white/80 border border-white/12">
      {pill}
    </span>
  );
}
