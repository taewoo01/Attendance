import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ideaFiles, ideaReactions, ideas, profiles } from "@/db/schema";

/**
 * ideas Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-024: Ideas 페이지(/ideas)에서만 사용한다.
 * TASK-034: `reactions` 컬럼은 더 이상 select하지 않는다(schema.ts 주석 참고 —
 * 실제 반응 여부/개수는 idea_reactions에서 계산한다).
 */
export async function listIdeas() {
  return db
    .select({
      id: ideas.id,
      userId: ideas.userId,
      avatar: ideas.avatar,
      who: ideas.who,
      postedAt: ideas.postedAt,
      title: ideas.title,
      body: ideas.body,
      tags: ideas.tags,
      links: ideas.links,
      comments: ideas.comments,
    })
    .from(ideas);
}

/** 아이디어 페이지 상세화: 아이디어 하나당 여러 첨부파일(achievements.listAchievementFiles와 동일 패턴). */
export async function listIdeaFiles() {
  return db.select().from(ideaFiles);
}

export async function getIdeaFileById(id: string) {
  const [row] = await db.select().from(ideaFiles).where(eq(ideaFiles.id, id)).limit(1);
  return row ?? null;
}

/** 아이디어 삭제/수정 시 Storage 정리 및 소유 확인용 — 특정 아이디어에 달린 첨부파일 목록. */
export async function listIdeaFilesFor(ideaId: string) {
  return db.select().from(ideaFiles).where(eq(ideaFiles.ideaId, ideaId));
}

/**
 * idea_reactions 전체 행. page.tsx가 idea별/reaction_index별로 집계해 count/active를
 * 계산하고, createdAt으로 "최근 활동"에도 사용한다. 활동 피드에 이름을 보여줘야
 * 해서 profiles를 함께 조회한다(personal_events의 name join과 동일한 패턴).
 */
export async function listIdeaReactions() {
  return db
    .select({
      ideaId: ideaReactions.ideaId,
      userId: ideaReactions.userId,
      reactionIndex: ideaReactions.reactionIndex,
      createdAt: ideaReactions.createdAt,
      name: profiles.name,
    })
    .from(ideaReactions)
    .leftJoin(profiles, eq(ideaReactions.userId, profiles.userId));
}
