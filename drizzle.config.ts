import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js 관례(.env.local)를 그대로 따른다 — dotenv 기본값(.env)이 아니다.
config({ path: ".env.local" });

/**
 * drizzle-kit CLI(generate/migrate) 전용 설정.
 * Next.js는 .env.local을 자체적으로 로드하지만 drizzle-kit CLI는 별도 프로세스이므로
 * dotenv로 같은 파일을 명시적으로 읽는다. DATABASE_URL은 서버 전용 secret이며
 * NEXT_PUBLIC_*로 만들지 않는다.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
