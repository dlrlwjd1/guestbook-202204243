'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <h1>잠시 쉬어 가는 중이에요.</h1>
      <p>페이지를 불러오지 못했습니다. 다시 시도해 주세요.</p>
      <button className="primary-button" onClick={reset}>
        다시 시도
      </button>
    </main>
  );
}
