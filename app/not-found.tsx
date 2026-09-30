import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="error-page">
      <h1>이 페이지는 비어 있어요.</h1>
      <p>방명록으로 돌아가 이야기를 남겨 주세요.</p>
      <Link className="primary-button" href="/">
        방명록으로
      </Link>
    </main>
  );
}
