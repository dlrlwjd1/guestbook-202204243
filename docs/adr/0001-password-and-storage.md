# 글별 비밀번호와 Neon Postgres
로그인 없이 글별 비밀번호로 수정·삭제를 확인한다는 과제 요구를 따른다. 비밀번호는 무작위 salt를 사용한 scrypt 해시만 저장하고 timingSafeEqual로 비교한다. 원문 복구 기능은 제공하지 않는다.
Neon Postgres에 ORM 없이 parameterized SQL을 실행한다. 네트워크 인증 전 로컬 검증은 PGlite의 동일 PostgreSQL 스키마·SQL로 수행한다. Vercel에서는 로컬 DB fallback을 금지하여 배포 간 데이터 유실을 방지한다.
