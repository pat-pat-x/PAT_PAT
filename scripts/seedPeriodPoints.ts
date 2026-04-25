import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_DB_URL_SUPABASE_SECRET_KEY!
);

type Pt = { x: number; y: number };

function buildMeta(points: Pt[]) {
  const seg: number[] = [];
  const acc: number[] = [0];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const L = Math.hypot(dx, dy);
    seg.push(L);
    total += L;
    acc.push(total);
  }
  return { seg, acc, total };
}

function sampleAt(points: Pt[], seg: number[], acc: number[], s: number): Pt {
  let i = 0;
  while (i < seg.length && acc[i + 1] < s) i++;
  if (i >= seg.length) return points[points.length - 1];
  const t = seg[i] === 0 ? 0 : (s - acc[i]) / seg[i];
  return {
    x: points[i].x + (points[i + 1].x - points[i].x) * t,
    y: points[i].y + (points[i + 1].y - points[i].y) * t,
  };
}

function samplePolyline(points: Pt[], N: number): Pt[] {
  if (!points || points.length === 0)
    return Array.from({ length: Math.max(0, N) }, () => ({ x: 0, y: 0 }));
  if (points.length < 2 || N <= 1)
    return Array.from({ length: Math.max(0, N) }, () => points[0]);
  const { seg, acc, total } = buildMeta(points);
  return Array.from({ length: N }, (_, k) =>
    sampleAt(points, seg, acc, total * (k / Math.max(1, N - 1)))
  );
}

function expandToDays(
  points: Pt[],
  pathIndex: number[] | null,
  days: number
): Pt[] {
  if (!points?.length)
    return Array.from({ length: days }, () => ({ x: 0, y: 0 }));
  const path = (pathIndex?.length ? pathIndex : points.map((_, i) => i))
    .map((i) => points[i])
    .filter(Boolean);
  return samplePolyline(path, days);
}

function daysBetweenInclusive(a: string, b: string) {
  const start = new Date(a);
  const end = new Date(b);
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / ms) + 1;
}

async function main() {
  const { data: periods, error: pErr } = await supabase
    .from('constellation_period')
    .select('period_id, constellation_id, start_date, end_date');

  if (pErr) throw pErr;
  if (!periods?.length) throw new Error('no constellation_period rows');

  for (const p of periods) {
    const days = daysBetweenInclusive(p.start_date, p.end_date);

    const { data: master, error: mErr } = await supabase
      .from('constellation_master')
      .select('constellation_id, code, points, path_index')
      .eq('constellation_id', p.constellation_id)
      .single();

    if (mErr) throw mErr;

    const pts: Pt[] = (master.points ?? []) as Pt[];
    const pathIndex: number[] = (master.path_index ?? []) as number[];

    if (!master.code) {
      throw new Error(
        `master.code missing for constellation_id=${p.constellation_id}`
      );
    }
    if (!pts.length) {
      console.warn(
        `WARN: points empty for code=${master.code} (constellation_id=${p.constellation_id})`
      );
      // points 비어있으면 days만큼 0,0 찍혀서 의미 없음 -> 여기서 continue 할지 선택 가능
      // continue;
    }

    const expanded = expandToDays(pts, pathIndex, days);

    // period별 기존 데이터 삭제 → 완전 재생성
    const { error: delErr } = await supabase
      .from('constellation_period_day_point')
      .delete()
      .eq('period_id', p.period_id);

    if (delErr) throw delErr;

    // insert rows (bulk)
    const rows = expanded.map((pt, idx) => ({
      period_id: p.period_id,
      day_index: idx,
      x: pt.x,
      y: pt.y,
    }));

    // supabase insert는 너무 큰 배열이면 chunk 필요할 수 있음 (여긴 보통 31개 이하라 OK)
    const { error: insErr } = await supabase
      .from('constellation_period_day_point')
      .insert(rows);

    if (insErr) throw insErr;

    console.log(
      `seeded period_id=${p.period_id} constellation_id=${p.constellation_id} code=${master.code} days=${days}`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
