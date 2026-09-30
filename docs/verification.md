# 검증 기록

검증일: 2026-09-30 (KST)

## 자동 검증

- ESLint, TypeScript: 통과.
- 서비스 통합 테스트 7개: 실제 PGlite PostgreSQL 엔진에서 통과.
- 로컬 브라우저 테스트 4개: 데스크톱·모바일에서 통과.
- Neon `verify-guestbook` 임시 브랜치: 스키마 적용, 작성·조회, 틀린 비밀번호 수정/삭제 거부, 올바른 비밀번호 수정/삭제 통과. 검증 글 정리.
- Vercel production 빌드: 통과, READY. 동적 파일 경로의 불필요한 전체 프로젝트 추적 경고를 수정한 빌드로 배포.
- GitHub CLI 조회: 저장소 `PUBLIC` 확인.

## 실제 공개 배포

https://guestbook-202204243.vercel.app 에 인증·보호 우회 없이 접속했습니다.

```bash
E2E_BASE_URL=https://guestbook-202204243.vercel.app npm run test:e2e
```

총 4개 테스트 통과(36.6초). PC 및 iPhone 13 크기 Chromium에서 각각:

1. 이름·학번 표시와 작성 폼 확인.
2. 글 작성 후 새로고침해 Neon 영속 저장 확인.
3. 잘못된 비밀번호로 수정 거부와 화면 오류 확인.
4. 올바른 비밀번호로 메시지 수정 후 새로고침 확인.
5. 잘못된 비밀번호로 삭제 거부와 화면 오류 확인.
6. 올바른 비밀번호로 삭제 후 새로고침해 제거 확인.
7. 가로 넘침 없이 모바일 표시 확인.
8. API 빈 입력 400, 틀린 비밀번호 403, 외부 Origin 403, 공개 응답에 비밀번호 필드 없음 확인.

생성한 검증 글은 모두 삭제했습니다. 스크린샷은 로컬 `test-results/`에 저장되며 Git에서 제외합니다.

## 운영 정보

Neon main에 운영 스키마를 적용하고 Vercel에는 pooled DB 연결을 비밀 환경변수로 등록했습니다. 마이그레이션용 direct 연결, OAuth 토큰, `.env.local`, `.neon`, `.vercel`은 공개 저장소에서 제외됩니다.

최초 배포는 CLI로 수행했습니다. 이후 사용자가 Vercel GitHub 앱 설치를 완료하여 `dlrlwjd1/guestbook-202204243` 연결과 production branch `main` 설정을 API로 확인했습니다.
