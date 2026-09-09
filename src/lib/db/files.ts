import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { files, profiles } from "@/db/schema";

/**
 * files Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-029: Files 페이지(/files)에서만 사용한다. 업로더 이름 표시를 위해
 * profiles를 함께 조회한다.
 */
export async function listFiles() {
  return db
    .select({
      id: files.id,
      userId: files.userId,
      storagePath: files.storagePath,
      name: files.name,
      folder: files.folder,
      sizeBytes: files.sizeBytes,
      uploadedAt: files.uploadedAt,
      uploaderName: profiles.name,
    })
    .from(files)
    .leftJoin(profiles, eq(files.userId, profiles.userId))
    .orderBy(desc(files.uploadedAt));
}

export async function getFileById(id: string) {
  const [file] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return file ?? null;
}
