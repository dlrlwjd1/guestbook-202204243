# Matt Pocock Skills

원본: https://github.com/mattpocock/skills

커밋: `d81f3a183412e71a5b1e84ca21bc1a35eea03a60`

MIT 라이선스 원문과 수업 Main Flow 및 의존 스킬을 `.claude/skills/`에 보존했다. Codex가 스킬 문서를 읽고 명세·티켓·구현·리뷰에 적용한다. 사용자 요청에 따라 Codex로 진행하며 Claude Code 실행으로 기록하지 않는다. 확인 가능한 수업 요구사항은 재질문 없이 채택했다. 최초 설정 때 선택한 로컬 Markdown 트래커를 유지한다. 공개 저장소는 현재 생성되어 있다.


## Codex 전환 및 절차 보완

사용자가 Claude Code 대신 Codex 사용 허락을 받았다고 명시했다.
동일한 공식 커밋에서 Codex skill-installer로 `.agents/skills/`에
`grill-with-docs`, `grilling`, `domain-modeling`, `to-spec`, `to-tickets`,
`implement`, `tdd`, `code-review` 8개를 설치했다. 원문은 변경하지 않았다.
기존 Neon 스킬·MCP 설정과 `.claude/skills/`는 보존했다.
Claude Skill tool 호출 지시는 Codex에서 해당 스킬 문서를 읽고 실행하는
방식으로 대응하며, 이 차이는 AGENTS.md에 명시했다.

기존 구현 전에는 정식 grilling 인터뷰를 생략했다. 따라서 과거 작업이 전체
절차를 충족했다고 주장하지 않는다. 지금 시작하는 보완 절차의 기록은
`.scratch/guestbook-codex/`에 별도로 관리한다. 인터뷰 추천안은 사용자 확인을 받았다.
이후 사용자가 “개발 제외 다음단계있으면 하고 없으면 푸쉬해”라고 범위를 제한했다.
따라서 앱 개발·신규 테스트 추가는 하지 않고 스킬 설치·기록의 검토와 push만 진행한다.
보완 명세와 티켓 제안은 개발 제외로 보류하며, 전체 개발 절차를 완료했다고 표시하지 않는다.
