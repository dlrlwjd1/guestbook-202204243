# 한 줄 사이 · 미니 방명록

**개발자: 이기정 · 학번: 202204243**

- 공개 저장소: https://github.com/dlrlwjd1/guestbook-202204243
- 배포: https://guestbook-202204243.vercel.app
- [제출 정보](SUBMISSION.md) · [검증 기록](docs/verification.md) · [코드 검토](docs/code-review.md)

로그인 없이 이름, 메시지, 글 비밀번호를 입력해 인사를 남기는 방명록입니다. 글을 수정·삭제할 때 작성 시 정한 비밀번호를 서버에서 검증합니다.

## 과제 요구사항

- 작성: 이름(1~30자), 메시지(1~1,000자), 비밀번호(4~128자).
- 조회: 전체 글을 최신 작성 순으로 표시. 이름·메시지·작성 시각(KST)을 함께 표시.
- 수정: 올바른 비밀번호로 메시지만 변경. 이름·작성 시각·정렬 순서는 유지.
- 삭제: 확인창에서 비밀번호를 검증한 뒤 삭제.
- 비밀번호 오류: 수정·삭제 모두 HTTP 403과 한국어 안내. 기존 글은 유지.
- UI: 개발자 이름과 학번, 반응형 화면, 키보드로 조작 가능한 대화상자.
- 프로젝트 이름: GitHub·Vercel·Neon 모두 `guestbook-202204243`.

## 기술

Next.js App Router · TypeScript · React · Neon Postgres · Vercel.
ORM 없이 parameterized SQL을 사용합니다. 비밀번호는 무작위 salt와 scrypt 해시로 저장하며 조회 API는 해시·salt·비밀번호를 반환하지 않습니다. 생성/수정/삭제는 서버에서 입력을 검증하고 동일 출처 및 요청 횟수 제한을 적용합니다.

## 실행

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local`의 `DATABASE_URL`에 Neon pooled 연결, `DATABASE_URL_UNPOOLED`에 direct 연결을 설정하세요. 실제 이름·학번은 기본값 이기정·202204243이며 환경변수로도 지정할 수 있습니다.

```bash
npm run db:migrate
```

DB 연결이 없으면 **로컬에서만** `.local-data/guestbook`에 PGlite(Postgres WASM)를 생성합니다. Vercel에서는 반드시 Neon 연결을 사용합니다. 로컬 파일 DB는 배포 대체 수단이 아닙니다.

## 검증

```bash
npm test           # 실제 Postgres 엔진을 이용한 서비스 동작 테스트
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e   # 별도 로컬 DB, PC·모바일 CRUD와 비밀번호 거부
```

실제 Neon 검증은 운영과 분리된 임시 브랜치에서 `scripts/verify-database.ts`로 실행합니다. 실행 후 검증 글을 삭제합니다. API는 `GET/POST /api/entries`, `PATCH/DELETE /api/entries/:id`이며 변경 요청은 JSON입니다.

## SDD와 스킬

사용자 요청에 따라 **Codex**로 진행했습니다. Claude Code 실행 이력으로 표현하지 않습니다.

- [명세](.scratch/guestbook/spec.md)
- [작업 티켓](.scratch/guestbook/issues/)
- [용어집](GLOSSARY.md) 및 [ADR](docs/adr/0001-password-and-storage.md)
- [Matt Pocock 스킬 출처](docs/skills-provenance.md)
- [Neon 설치·설정 변경 내역](docs/neon-setup.md)

Matt Pocock의 `grill-with-docs → to-spec → to-tickets → implement → code-review` 흐름을 적용했습니다. 인터뷰는 과제 요구사항과 사용자 답변을 바탕으로 진행하고, 로컬 Markdown 티켓을 사용했습니다. `.claude/skills`에 공식 원본을 보존했습니다.

## 배포

Vercel 프로젝트의 production 환경변수로 `DATABASE_URL`, `NEXT_PUBLIC_DEVELOPER_NAME`, `NEXT_PUBLIC_STUDENT_ID`를 등록합니다. 마이그레이션은 직접 연결로 실행한 후 배포합니다. `DATABASE_URL_UNPOOLED`는 마이그레이션용이며 브라우저로 전달하지 않습니다.

비밀번호·토큰이 있는 `.env.local`, 로컬 데이터, Neon 연결 파일, Vercel 로컬 설정은 Git에서 제외합니다. 별도 운영자 계정/비밀번호는 없으며 각 글의 비밀번호로 해당 글만 관리합니다.

Vercel 프로젝트에 GitHub 저장소가 연결되어 있습니다. `main` 브랜치에 push하면 프로덕션 자동 배포가 실행됩니다.
