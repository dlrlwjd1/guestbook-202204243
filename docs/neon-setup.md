# Neon 설정 변경 기록

## 확인한 기존 상태

- 프로젝트에 Neon agent skill, Neon MCP 설정, `.neon` 연결 정보가 없었음.
- 기존 `@neondatabase/serverless` 드라이버와 raw SQL 방식은 유지.
- `.env.local`의 DB 값은 비어 있었으며 개발자 이름·학번과 로컬 DB 설정은 이미 존재.
- 사용자 전역 Codex/Claude MCP 목록에 Neon이 없었음.
- 계정의 기존 Neon 프로젝트 `ex_ea`는 변경하지 않음.

## 추가·변경

1. 사용자 지정 https://neon.com/.well-known/agent-skills/neon/SKILL.md 를 내려받아 읽음.
2. 공식 Neon CLI를 통해 프로젝트 `.agents/skills/`에 `neon`, `neon-postgres`, `neon-postgres-branches`와 참조 문서를 설치. `skills-lock.json`에 버전 정보 기록.
3. `.codex/config.toml`에 `[mcp_servers.Neon]` 및 `https://mcp.neon.tech/mcp` OAuth 연결을 추가. 기존 사용자 전역 `config.toml`, Claude 설정 및 Matt Pocock 스킬은 변경하지 않음.
4. Codex CLI로 Neon MCP OAuth 인증 완료. 인증 정보는 CLI 자격증명 저장소에 보관하고 프로젝트에 넣지 않음. 현재 진행 중인 대화의 도구 목록은 자동 재로딩되지 않으므로 실제 DB 작업은 공식 지침대로 인증된 Neon CLI를 사용. 프로젝트 범위 MCP는 해당 폴더를 신뢰한 새 Codex 세션에서 로드됨.
5. 과제 전용 Neon 프로젝트 `guestbook-202204243` 생성(Postgres 17, Singapore, 0.25 CU). 기존 프로젝트 보존.
6. `.neon`에 새 프로젝트 main 연결 정보를 추가하고 `.gitignore`에 제외. 기존 env를 보호하기 위해 `link --no-env-pull` 사용.
7. 임시 `verify-guestbook` 브랜치를 만들어 스키마와 실제 CRUD/틀린 비밀번호 거부를 검증. 검증 글 삭제. 브랜치는 2026-10-01 06:00 UTC 만료.
8. `.env.local`의 비어 있던 `DATABASE_URL`에 main pooled 연결을 채우고, `DATABASE_URL_UNPOOLED` direct 연결을 추가. 기존 개발자 이름·학번·다른 값 보존. 연결 문자열은 공개하지 않음.
9. 검증 후 동일 스키마를 main에 적용. 코드로 관리하는 `db/schema.sql`과 `scripts/migrate.ts` 사용.
10. Vercel production 환경에 pooled `DATABASE_URL`을 Secret으로, 개발자 이름·학번을 설정.

## 보존

Neon Auth·Data API·Functions·Object Storage는 방명록 요구사항에 없으므로 활성화하지 않았습니다. 회원가입/로그인을 추가하지 않았습니다. 기존 Neon 프로젝트·기존 스킬·사용자 전역 MCP 설정을 덮어쓰지 않았습니다.

## 공식 출처

- https://neon.com/.well-known/agent-skills/neon/SKILL.md
- https://github.com/neondatabase/agent-skills
- https://developers.openai.com/codex/mcp
