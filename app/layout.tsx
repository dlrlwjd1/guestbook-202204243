import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '한 줄 사이 · 이기정의 미니 방명록',
  description:
    '짧은 안부부터 오늘의 이야기까지. 당신의 한 줄이 머무는 작은 방명록입니다. 개발자 이기정 · 202204243.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
