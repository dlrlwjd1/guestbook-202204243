# 미니 방명록
Next.js App Router + TypeScript + Neon Postgres + Vercel. 별도 회원가입·로그인 없음.
이름·메시지·글 비밀번호로 작성하고 비밀번호가 맞아야 메시지 수정·삭제 가능.
비밀번호는 무작위 salt와 scrypt로 해시하고 raw SQL은 항상 parameterized query를 쓴다.
목록 API에는 비밀번호 원문·해시·salt를 절대 보내지 않는다.
사용자 요청에 따라 Codex로 진행한다. Claude Code 사용 이력을 주장하지 않는다.

## Agent skills
### Issue tracker
로컬 Markdown `.scratch/guestbook/`: 명세 1개, 티켓별 파일. docs/agents/issue-tracker.md 참고.
### Domain docs
단일 컨텍스트 GLOSSARY.md와 docs/adr/. docs/agents/domain.md 참고.
### Checks
npm test, npm run lint, npm run typecheck, npm run build, npm run test:e2e.
서비스 공개 인터페이스와 실제 브라우저를 통해 CRUD 및 잘못된 비밀번호를 검증한다.
