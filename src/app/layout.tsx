import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans-kr/400.css";
import "@fontsource/ibm-plex-sans-kr/500.css";
import "@fontsource/ibm-plex-sans-kr/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-mono/700.css";
import "./globals.css";

// docs/DESIGN-SYSTEM.md 3.1절: IBM Plex Sans KR 400;500;600, IBM Plex Mono 400;500;600;700
// next/font/google는 빌드/개발 서버 시작마다 fonts.gstatic.com에서 수백 개의 유니코드
// 범위별 파일을 병렬로 내려받는데, 방화벽/백신이 그 대량 동시 연결을 끊어버려 로컬에서
// 사이트 접근 자체가 안 되는 문제가 있었다 — @fontsource로 파일을 node_modules에 미리
// 받아두고(런타임/빌드타임 네트워크 요청 없음) 정적 CSS @font-face로 로드하도록 교체했다.

// 배경화면 설치(PWA) 지원: app/manifest.ts가 manifest.webmanifest를 자동 생성/연결하고,
// 여기서는 favicon/apple-touch-icon과 설치 시 표시될 이름/설명만 설정한다.
export const metadata: Metadata = {
  title: "PLAY GROUND",
  description: "PLAY GROUND 팀 업무 관리 — 출석/일정/실적/데일리/아이디어/회의록/자료실",
  applicationName: "PLAY GROUND",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PLAY GROUND",
  },
};

export const viewport: Viewport = {
  themeColor: "#081512",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
