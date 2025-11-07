// app/lumi/auth/nickname/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function createAnonServerClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { nickname } = await req.json();
    const value = String(nickname ?? "").trim();

    if (value.length < 2) {
      return NextResponse.json(
        { ok: false, message: "닉네임은 2자 이상이어야 합니다." },
        { status: 400 }
      );
    }
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "환경변수 누락(NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)",
        },
        { status: 500 }
      );
    }

    const supabase = await createAnonServerClient();

    const { count, error } = await supabase
      .from("user_profile")
      .select("nickname", { count: "exact", head: true })
      .eq("nickname", value);

    if (error) {
      return NextResponse.json(
        { ok: false, message: `DB 오류: ${error.message}` },
        { status: 500 }
      );
    }

    const available = (count ?? 0) === 0;
    return NextResponse.json(
      available
        ? { ok: true, available: true, message: "사용 가능한 닉네임입니다." }
        : {
            ok: false,
            available: false,
            message: "이미 사용 중인 닉네임입니다.",
          }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: `서버 내부 오류: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
