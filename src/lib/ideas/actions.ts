"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { db } from "@/lib/db/client";
import { getProfileByUserId } from "@/lib/db/profiles";
import { ideaReactions, ideas, type IdeaCommentRow } from "@/db/schema";

function parseCommaList(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * meeting_notes와 달리 ideas는 TASK-034에서 user_id를 갖게 됐다 — 작성자
 * 본인만 수정/삭제할 수 있다(personal_events와 동일 원칙). `who`/`avatar`는
 * 폼 입력이 아니라 항상 현재 로그인 사용자의 프로필에서 채운다(스푸핑 방지 —
 * 다른 사람 이름으로 글을 올릴 수 없게).
 */
async function requireAuthorProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getProfileByUserId(user.id);
  const name = profile?.name?.trim() || "";
  return { userId: user.id, avatar: name.charAt(0), who: name };
}

export type CreateIdeaState = { error?: string; success?: boolean };

export async function createIdea(formData: FormData): Promise<CreateIdeaState> {
  const author = await requireAuthorProfile();
  if (!author) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) {
    return { error: "제목을 입력해 주세요." };
  }
  if (!body) {
    return { error: "내용을 입력해 주세요." };
  }

  await db.insert(ideas).values({
    userId: author.userId,
    avatar: author.avatar,
    who: author.who,
    postedAt: new Date().toISOString(),
    title,
    body,
    tags: parseCommaList(formData.get("tags")),
  });

  revalidatePath("/ideas");
  return { success: true };
}

export type UpdateIdeaState = { error?: string; success?: boolean };

export async function updateIdea(id: string, formData: FormData): Promise<UpdateIdeaState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) {
    return { error: "제목을 입력해 주세요." };
  }
  if (!body) {
    return { error: "내용을 입력해 주세요." };
  }

  const updated = await db
    .update(ideas)
    .set({ title, body, tags: parseCommaList(formData.get("tags")) })
    .where(and(eq(ideas.id, id), eq(ideas.userId, user.id)))
    .returning({ id: ideas.id });

  if (updated.length === 0) {
    return { error: "수정할 아이디어를 찾을 수 없습니다(본인 글만 수정할 수 있어요)." };
  }

  revalidatePath("/ideas");
  return { success: true };
}

export type DeleteIdeaState = { error?: string; success?: boolean };

export async function deleteIdea(id: string): Promise<DeleteIdeaState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const deleted = await db
    .delete(ideas)
    .where(and(eq(ideas.id, id), eq(ideas.userId, user.id)))
    .returning({ id: ideas.id });

  if (deleted.length === 0) {
    return { error: "삭제할 아이디어를 찾을 수 없습니다(본인 글만 삭제할 수 있어요)." };
  }

  revalidatePath("/ideas");
  return { success: true };
}

export type AddIdeaCommentState = { error?: string; success?: boolean };

/**
 * 댓글은 personal_events식 소유권 검사가 필요 없다 — 로그인한 팀원 누구나
 * 어떤 아이디어에든 댓글을 달 수 있다(원본이 사회적 피드 성격). comments는
 * jsonb 배열이라 전체를 읽어 새 댓글을 append한 뒤 다시 쓴다(meeting_notes의
 * actions 토글과 동일한 패턴).
 */
export async function addIdeaComment(ideaId: string, formData: FormData): Promise<AddIdeaCommentState> {
  const author = await requireAuthorProfile();
  if (!author) {
    return { error: "로그인이 필요합니다." };
  }

  const text = String(formData.get("text") ?? "").trim();
  if (!text) {
    return { error: "댓글 내용을 입력해 주세요." };
  }

  const [idea] = await db.select({ comments: ideas.comments }).from(ideas).where(eq(ideas.id, ideaId));
  if (!idea) {
    return { error: "아이디어를 찾을 수 없습니다." };
  }

  const newComment: IdeaCommentRow = {
    avatar: author.avatar,
    who: author.who,
    text,
    postedAt: new Date().toISOString(),
  };

  await db
    .update(ideas)
    .set({ comments: [...idea.comments, newComment] })
    .where(eq(ideas.id, ideaId));

  revalidatePath("/ideas");
  return { success: true };
}

export type ToggleIdeaReactionState = { error?: string; success?: boolean };

/**
 * 반응 토글: (idea_id, user_id, reaction_index) 행이 있으면 지우고(취소),
 * 없으면 추가한다(반응). count는 이 테이블을 group by해서 매번 계산한다
 * (schema.ts 주석 — ideas.reactions 컬럼은 더 이상 쓰지 않음).
 */
export async function toggleIdeaReaction(ideaId: string, reactionIndex: number): Promise<ToggleIdeaReactionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }
  if (![0, 1, 2].includes(reactionIndex)) {
    return { error: "잘못된 반응입니다." };
  }

  const existing = await db
    .select({ id: ideaReactions.id })
    .from(ideaReactions)
    .where(
      and(eq(ideaReactions.ideaId, ideaId), eq(ideaReactions.userId, user.id), eq(ideaReactions.reactionIndex, reactionIndex)),
    );

  if (existing.length > 0) {
    await db.delete(ideaReactions).where(eq(ideaReactions.id, existing[0].id));
  } else {
    await db.insert(ideaReactions).values({ ideaId, userId: user.id, reactionIndex });
  }

  revalidatePath("/ideas");
  return { success: true };
}
