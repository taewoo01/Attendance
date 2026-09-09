import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 프로젝트 루트의 AGENTS.md(작업 기준 문서)를 next dev/build가 덮어쓰지 않도록 비활성화.
  agentRules: false,
  experimental: {
    serverActions: {
      // src/lib/files/actions.ts의 uploadFile()이 20MB까지 허용하는데, Server Action의
      // 기본 body 크기 제한(1MB)에 걸려 그보다 큰 파일은 프레임워크 단에서 먼저
      // 거부된다 — 앱 자체의 MAX_SIZE_BYTES 검증과 맞춰 20mb로 올린다.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
