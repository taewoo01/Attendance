import { IdeasBoard } from "@/components/ideas/IdeasBoard";
import type { Idea, IdeaReaction } from "@/components/ideas/IdeaCard";
import type { RecentActivityItem } from "@/components/ideas/IdeasSidebar";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listIdeaFiles, listIdeaReactions, listIdeas } from "@/lib/db/ideas";
import { ideaTimestampMs } from "@/lib/ideas/format";

// TASK-024: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

const RECENT_ACTIVITY_LIMIT = 6;

export default async function IdeasPage() {
  const [rows, reactionRows, fileRows, user] = await Promise.all([
    listIdeas(),
    listIdeaReactions(),
    listIdeaFiles(),
    getCurrentUser(),
  ]);

  const filesByIdea = new Map<string, { id: string; name: string }[]>();
  for (const f of fileRows) {
    const list = filesByIdea.get(f.ideaId);
    if (list) {
      list.push({ id: f.id, name: f.name });
    } else {
      filesByIdea.set(f.ideaId, [{ id: f.id, name: f.name }]);
    }
  }

  const ideas: Idea[] = rows.map((row) => {
    const myReactions = reactionRows.filter((r) => r.ideaId === row.id);
    const reactions = [0, 1, 2].map((idx) => ({
      count: myReactions.filter((r) => r.reactionIndex === idx).length,
      active: user ? myReactions.some((r) => r.reactionIndex === idx && r.userId === user.id) : false,
    })) as [IdeaReaction, IdeaReaction, IdeaReaction];

    return {
      id: row.id,
      userId: row.userId,
      avatar: row.avatar,
      who: row.who,
      postedAt: row.postedAt,
      title: row.title,
      body: row.body,
      tags: row.tags,
      links: row.links,
      files: filesByIdea.get(row.id) ?? [],
      reactions,
      comments: row.comments,
    };
  });

  // "최근 활동": 댓글(postedAt 있는 것만)과 반응(idea_reactions.createdAt)을
  // 시간순으로 병합한다. TASK-024 당시엔 타임스탬프가 없어 정적 하드코딩이었다.
  const commentEvents = rows.flatMap((row) =>
    row.comments
      .filter((c) => c.postedAt)
      .map((c) => ({
        item: { avatar: c.avatar, who: c.who, action: "님이 댓글을 남겼어요" },
        ts: ideaTimestampMs(c.postedAt!),
      })),
  );
  const reactionEvents = reactionRows.map((r) => ({
    item: { avatar: r.name?.charAt(0) ?? "", who: r.name ?? "", action: "님이 좋아요를 눌렀어요" },
    ts: r.createdAt.getTime(),
  }));

  const recentActivity: RecentActivityItem[] = [...commentEvents, ...reactionEvents]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map(({ item }) => item);

  return <IdeasBoard ideas={ideas} currentUserId={user?.id ?? null} recentActivity={recentActivity} />;
}
