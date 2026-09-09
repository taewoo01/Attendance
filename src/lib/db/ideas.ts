import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ideaReactions, ideas, profiles } from "@/db/schema";

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
      comments: ideas.comments,
    })
    .from(ideas);
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
