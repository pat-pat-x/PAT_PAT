# PAT_PAT

일기와 별자리를 기반으로 한 감정 기록 앱입니다.

## 📁 프로젝트 구조

```
/app
  /api
    /_lib                ← API 공통 헬퍼 모음
      errors.ts          ← AppError 클래스 + Errors 팩토리
      map-supabase-error.ts ← Supabase/Postgres 에러 매핑
      http.ts            ← jsonOk/jsonError/makeRequestId
      validate.ts        ← zod 기반 입력 검증
      index.ts           ← 위 네 개를 모아서 export (진입점)
    /constellations
      route.ts           ← 실제 API 엔드포인트
    /diary
      route.ts
    ...
  /lib
    supabase
      client.ts          ← 클라이언트용 supabase
      server.ts          ← 서버용 supabase (anon or service role)
```

## 🚀 시작하기

### 1. 설치

```bash
npm install
# 또는
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 🤖 MCP (Model Context Protocol) 설정

Cursor AI에서 Supabase와 Notion을 직접 제어하려면:

1. `.cursor/mcp.json.example` 파일을 `.cursor/mcp.json`으로 복사
2. 실제 토큰으로 교체
3. Cursor 재시작

**상세 가이드**: [docs/MCP_SETUP.md](docs/MCP_SETUP.md)

## 📚 문서

- **API 명세**: [openapi.yaml](openapi.yaml)
- **MCP 설정**: [docs/MCP_SETUP.md](docs/MCP_SETUP.md)

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Validation**: Zod
- **Styling**: Tailwind CSS

## 📖 API 개발

모든 API는 표준화된 포맷을 따릅니다:

**성공 응답:**
```json
{
  "ok": true,
  "data": { ... },
  "meta": { ... },
  "requestId": "..."
}
```

**에러 응답:**
```json
{
  "ok": false,
  "code": "NOT_FOUND",
  "message": "리소스를 찾을 수 없습니다",
  "requestId": "..."
}
```
