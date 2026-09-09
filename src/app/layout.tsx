import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// docs/DESIGN-SYSTEM.md 3.1절: IBM Plex Sans KR 400;500;600, IBM Plex Mono 400;500;600;700
const ibmPlexSansKR = IBM_Plex_Sans_KR({
  variable: "--font-ibm-plex-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
    <html
      lang="ko"
      className={`${ibmPlexSansKR.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
