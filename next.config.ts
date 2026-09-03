import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 프로젝트 루트의 AGENTS.md(작업 기준 문서)를 next dev/build가 덮어쓰지 않도록 비활성화.
  agentRules: false,
};

export default nextConfig;
