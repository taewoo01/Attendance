import type { MetadataRoute } from "next";

/**
 * PWA 설치(브라우저의 "앱 설치") 지원을 위한 Web App Manifest.
 * Next.js App Router가 이 파일을 자동으로 /manifest.webmanifest로 서빙하고
 * <head>에 <link rel="manifest">를 주입한다(별도 등록 불필요).
 * icons는 StatusBar.tsx의 pg-logo(그라디언트 육각형 3개)를 PNG로 렌더링한
 * public/icons/*.png를 그대로 쓴다 — 새 디자인을 만들지 않는다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PLAY GROUND",
    short_name: "PLAY GROUND",
    description: "PLAY GROUND 팀 업무 관리 — 출석/일정/실적/데일리/아이디어/회의록/자료실",
    start_url: "/",
    display: "standalone",
    background_color: "#081512",
    theme_color: "#081512",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
