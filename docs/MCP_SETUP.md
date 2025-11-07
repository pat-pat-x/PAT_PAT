# MCP 서버 설정 가이드

## 📋 개요

이 문서는 Cursor에서 Supabase와 Notion MCP 서버를 연동하는 방법을 설명합니다.

---

## 🔧 1. Supabase MCP 설정

### 1-1. Supabase 연결 정보 확인

1. **Supabase Dashboard 접속**

   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **Project Settings → Database 이동**

3. **Connection String 복사**
   - "Connection Pooling" 섹션에서
   - "Mode: Transaction" 선택
   - Connection string 복사
   - 형식: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`

### 1-2. mcp.json 수정

`.cursor/mcp.json` 파일에서 다음 부분 수정:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

**수정할 부분:**

- `[YOUR_PROJECT_REF]` → 실제 프로젝트 참조 ID
- `[YOUR_PASSWORD]` → 실제 데이터베이스 비밀번호
- `aws-0-ap-northeast-2` → 실제 리전 (한국: ap-northeast-2, 싱가포르: ap-southeast-1)

**예시:**

```
postgresql://postgres.abcdefghijklmnop:mySecretPassword123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 1-3. Supabase에서 할 수 있는 것

✅ **데이터베이스 조회**

```
"users 테이블의 모든 데이터 보여줘"
"diary 테이블에서 최근 10개 가져와줘"
```

✅ **데이터 추가/수정/삭제**

```
"emotion 테이블에 새로운 감정 추가해줘"
"user_id가 5인 사용자의 닉네임 변경해줘"
```

✅ **복잡한 쿼리**

```
"각 사용자별 일기 개수를 집계해줘"
"지난 주에 작성된 star 타입 일기 개수는?"
```

✅ **테이블 구조 분석**

```
"diary 테이블의 구조 보여줘"
"FK 관계 확인해줘"
```

---

## 📝 2. Notion MCP 설정

### 2-1. Notion Integration 생성

1. **Notion Integrations 페이지 접속**

   - https://www.notion.so/my-integrations 접속

2. **"+ New integration" 클릭**

   - Name: `PAT_PAT MCP` (원하는 이름)
   - Associated workspace: 사용할 워크스페이스 선택
   - Type: Internal
   - Capabilities:
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content

3. **"Submit" 클릭**

4. **Internal Integration Token 복사**
   - `secret_...` 으로 시작하는 토큰
   - 이것이 NOTION_API_KEY입니다!

### 2-2. Notion 페이지에 Integration 연결

사용하려는 Notion 페이지마다:

1. 페이지 우측 상단 `...` (점 3개) 클릭
2. "Connections" → "PAT_PAT MCP" 선택
3. "Confirm" 클릭

### 2-3. mcp.json 수정

`.cursor/mcp.json` 파일에서:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-notion"],
      "env": {
        "NOTION_API_KEY": "secret_abcdefghijklmnopqrstuvwxyz1234567890"
      }
    }
  }
}
```

**수정할 부분:**

- `YOUR_NOTION_INTEGRATION_TOKEN_HERE` → 복사한 토큰으로 교체

### 2-4. Notion에서 할 수 있는 것

✅ **페이지 읽기**

```
"Notion의 'API 문서' 페이지 내용 읽어줘"
"프로젝트 노트의 TODO 리스트 가져와줘"
```

✅ **페이지 생성**

```
"Notion에 '오늘의 회의록' 페이지 만들어줘"
"버그 리포트 페이지 생성해줘"
```

✅ **내용 업데이트**

```
"Notion 페이지에 이번 주 진행사항 추가해줘"
"TODO 리스트 완료로 체크해줘"
```

✅ **데이터베이스 조회/수정**

```
"Notion 데이터베이스에서 'In Progress' 상태인 항목 보여줘"
"새 태스크 추가해줘"
```

---

## 🚀 3. Cursor 재시작

설정을 완료했으면:

1. **Cursor 완전히 종료**
2. **Cursor 다시 시작**
3. **MCP 연결 확인**

Cursor AI에게 물어보세요:

```
"Supabase 연결 확인해줘"
"Notion 연결 확인해줘"
```

---

## 🧪 4. 테스트

### Supabase 테스트:

```
"users 테이블에 몇 개의 레코드가 있어?"
"emotion 테이블의 모든 감정 리스트 보여줘"
```

### Notion 테스트:

```
"Notion에 연결된 페이지 목록 보여줘"
"테스트 페이지 하나 만들어줘"
```

---

## ⚠️ 주의사항

### 보안:

- ✅ `.cursor/mcp.json` 파일을 `.gitignore`에 추가하세요!
- ✅ 토큰은 절대 Git에 커밋하지 마세요!
- ✅ 팀원과 공유할 때는 토큰을 제외하고 공유하세요

### 추가 정보:

```gitignore
# .gitignore에 추가
.cursor/mcp.json
.cursor/mcp-*.json
```

---

## 🔧 트러블슈팅

### 1. "MCP server not found" 에러

→ Cursor를 완전히 재시작하세요

### 2. Supabase 연결 실패

- Connection string 확인
- 비밀번호에 특수문자가 있으면 URL 인코딩 필요
- 리전 확인 (ap-northeast-2 등)

### 3. Notion 권한 오류

- Integration이 페이지에 연결되어 있는지 확인
- Integration 권한 설정 확인 (Read/Write)

---

## 💡 활용 예시

### 개발 워크플로우:

1. **DB 스키마 확인**

   ```
   "diary 테이블 구조 확인해줘"
   ```

2. **테스트 데이터 생성**

   ```
   "users 테이블에 테스트 사용자 5명 추가해줘"
   ```

3. **Notion에 문서화**

   ```
   "Notion에 API 엔드포인트 문서 생성하고 내용 채워줘"
   ```

4. **버그 리포트 자동화**
   ```
   "오늘 발생한 에러를 Notion 버그 트래커에 추가해줘"
   ```

---

## 📚 추가 자료

- Supabase Docs: https://supabase.com/docs
- Notion API: https://developers.notion.com
- MCP Protocol: https://github.com/modelcontextprotocol/servers

---

## 🎯 다음 단계

설정이 완료되면 다음을 시도해보세요:

1. 📊 **DB 분석**: "지난 달 사용자 가입 추이 분석해줘"
2. 📝 **자동 문서화**: "API 변경사항을 Notion에 기록해줘"
3. 🔍 **데이터 검증**: "user_profile과 users 테이블 일치 여부 확인"
4. 📈 **리포트 생성**: "주간 리포트를 Notion에 만들어줘"

즐거운 개발 되세요! 🚀
