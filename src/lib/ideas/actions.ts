"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db/client";
import { getProfileByUserId } from "@/lib/db/profiles";
import { getIdeaFileById, listIdeaFilesFor } from "@/lib/db/ideas";
import { ideaFiles, ideaReactions, ideas, type IdeaCommentRow } from "@/db/schema";
import {
  ALLOWED_EXTENSIONS,
  BUCKET,
  MAX_SIZE_BYTES,
  contentTypeFor,
  extensionOf,
  sanitizeFileName,
} from "@/lib/files/upload-shared";

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

/**
 * 아이디어 페이지 상세화: 작성 폼의 "이미지 첨부"/"링크 첨부" 버튼이 이전엔
 * 장식만 있고 실제 업로드/저장이 없었다(IdeaComposer.tsx 원래 주석) —
 * createAchievement(src/lib/results/actions.ts)와 동일한 순서(Authentication →
 * 입력 검증 → 파일 업로드 → insert)로 실제 저장 경로를 붙인다. id를 미리 만들어
 * 모든 파일을 먼저 업로드/검증한 뒤에야 ideas/idea_files를 insert한다(하나라도
 * 업로드 실패하면 아이디어 자체도 생성하지 않는다 — achievements와 동일 원칙).
 */
export async function createIdea(formData: FormData): Promise<CreateIdeaState> {
  const author = await requireAuthorProfile();
  if (!author) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const links = formData
    .getAll("links")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (!title) {
    return { error: "제목을 입력해 주세요." };
  }
  if (!body) {
    return { error: "내용을 입력해 주세요." };
  }
  // <a href>로 그대로 렌더링되므로(IdeaCard.tsx) javascript:/data: 같은 스킴을
  // 막아야 한다 — type="url" input은 문법만 검증하고 스킴은 안 가린다.
  if (links.some((l) => !/^https?:\/\//i.test(l))) {
    return { error: "링크는 http:// 또는 https:// 로 시작해야 합니다." };
  }
  for (const file of files) {
    if (!ALLOWED_EXTENSIONS.has(extensionOf(file.name))) {
      return { error: `허용되지 않는 파일 형식입니다: ${file.name}` };
    }
    if (file.size > MAX_SIZE_BYTES) {
      return { error: `파일 용량이 20MB를 초과합니다: ${file.name}` };
    }
  }

  const ideaId = crypto.randomUUID();
  const supabaseAdmin = createAdminClient();

  const uploadResults = await Promise.all(
    files.map(async (file) => {
      const safeName = sanitizeFileName(file.name);
      const storagePath = `ideas/${ideaId}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, await file.arrayBuffer(), { contentType: contentTypeFor(file.name, file.type) });
      return { error: uploadError, storagePath, name: safeName, sizeBytes: file.size };
    }),
  );

  const succeeded = uploadResults.filter((r) => !r.error);
  const failed = uploadResults.filter((r) => r.error);
  if (failed.length > 0) {
    for (const f of failed) {
      console.error("[createIdea] idea file upload failed", f.name, f.error);
    }
    if (succeeded.length > 0) {
      await supabaseAdmin.storage.from(BUCKET).remove(succeeded.map((r) => r.storagePath));
    }
    return { error: "첨부파일 업로드 중 오류가 발생했습니다." };
  }

  await db.insert(ideas).values({
    id: ideaId,
    userId: author.userId,
    avatar: author.avatar,
    who: author.who,
    postedAt: new Date().toISOString(),
    title,
    body,
    tags: parseCommaList(formData.get("tags")),
    links,
  });

  if (succeeded.length > 0) {
    await db.insert(ideaFiles).values(
      succeeded.map((f) => ({
        ideaId,
        userId: author.userId,
        storagePath: f.storagePath,
        name: f.name,
        sizeBytes: f.sizeBytes,
      })),
    );
  }

  revalidatePath("/ideas");
  return { success: true };
}

export type UpdateIdeaState = { error?: string; success?: boolean };

/**
 * 아이디어 수정. updateAchievement와 동일한 검증(링크 스킴/새 첨부파일 확장자·
 * 용량)을 거친 뒤 본인 소유 아이디어만 갱신한다. 첨부파일은 "추가"(files)와
 * "기존 제거"(removeFileIds)를 한 번에 받는다 — 새 파일 업로드가 실패하면 기존
 * 파일 삭제/DB update 자체를 진행하지 않는다(createIdea와 동일한 "반쯤 성공
 * 상태 방지" 원칙). removeFileIds는 listIdeaFilesFor(id)로 다시 조회해 이
 * 아이디어 소유가 맞는 파일인지 서버에서 한 번 더 확인한다.
 */
export async function updateIdea(id: string, formData: FormData): Promise<UpdateIdeaState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const [existing] = await db.select({ userId: ideas.userId }).from(ideas).where(eq(ideas.id, id));
  if (!existing || existing.userId !== user.id) {
    return { error: "수정할 아이디어를 찾을 수 없습니다(본인 글만 수정할 수 있어요)." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const links = formData
    .getAll("links")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const newFiles = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const removeFileIds = formData
    .getAll("removeFileIds")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (!title) {
    return { error: "제목을 입력해 주세요." };
  }
  if (!body) {
    return { error: "내용을 입력해 주세요." };
  }
  if (links.some((l) => !/^https?:\/\//i.test(l))) {
    return { error: "링크는 http:// 또는 https:// 로 시작해야 합니다." };
  }
  for (const file of newFiles) {
    if (!ALLOWED_EXTENSIONS.has(extensionOf(file.name))) {
      return { error: `허용되지 않는 파일 형식입니다: ${file.name}` };
    }
    if (file.size > MAX_SIZE_BYTES) {
      return { error: `파일 용량이 20MB를 초과합니다: ${file.name}` };
    }
  }

  const supabaseAdmin = createAdminClient();

  const uploadResults = await Promise.all(
    newFiles.map(async (file) => {
      const safeName = sanitizeFileName(file.name);
      const storagePath = `ideas/${id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, await file.arrayBuffer(), { contentType: contentTypeFor(file.name, file.type) });
      return { error: uploadError, storagePath, name: safeName, sizeBytes: file.size };
    }),
  );

  const succeeded = uploadResults.filter((r) => !r.error);
  const failed = uploadResults.filter((r) => r.error);
  if (failed.length > 0) {
    for (const f of failed) {
      console.error("[updateIdea] idea file upload failed", f.name, f.error);
    }
    if (succeeded.length > 0) {
      await supabaseAdmin.storage.from(BUCKET).remove(succeeded.map((r) => r.storagePath));
    }
    return { error: "첨부파일 업로드 중 오류가 발생했습니다." };
  }

  let removedFiles: { id: string; storagePath: string }[] = [];
  if (removeFileIds.length > 0) {
    const attached = await listIdeaFilesFor(id);
    removedFiles = attached.filter((f) => removeFileIds.includes(f.id));
  }

  const updated = await db
    .update(ideas)
    .set({ title, body, tags: parseCommaList(formData.get("tags")), links })
    .where(and(eq(ideas.id, id), eq(ideas.userId, user.id)))
    .returning({ id: ideas.id });

  if (updated.length === 0) {
    if (succeeded.length > 0) {
      await supabaseAdmin.storage.from(BUCKET).remove(succeeded.map((r) => r.storagePath));
    }
    return { error: "수정할 아이디어를 찾을 수 없습니다(본인 글만 수정할 수 있어요)." };
  }

  if (succeeded.length > 0) {
    await db.insert(ideaFiles).values(
      succeeded.map((f) => ({
        ideaId: id,
        userId: user.id,
        storagePath: f.storagePath,
        name: f.name,
        sizeBytes: f.sizeBytes,
      })),
    );
  }

  if (removedFiles.length > 0) {
    await db.delete(ideaFiles).where(and(eq(ideaFiles.ideaId, id), inArray(ideaFiles.id, removedFiles.map((f) => f.id))));
    await supabaseAdmin.storage.from(BUCKET).remove(removedFiles.map((f) => f.storagePath));
  }

  revalidatePath("/ideas");
  return { success: true };
}

export type DeleteIdeaState = { error?: string; success?: boolean };

/**
 * 아이디어 삭제. deleteAchievement와 동일하게 idea_files DB 행은 FK
 * (onDelete: cascade)로 같이 지워지지만, Storage 객체는 Postgres cascade로
 * 지워지지 않으므로 삭제 전에 첨부파일 경로를 미리 조회해뒀다가 삭제 성공 후
 * Storage에서도 지운다(best-effort — Storage 삭제가 실패해도 아이디어 삭제
 * 자체는 이미 끝난 상태라 에러로 되돌리지 않는다).
 */
export async function deleteIdea(id: string): Promise<DeleteIdeaState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const attachedFiles = await listIdeaFilesFor(id);

  const deleted = await db
    .delete(ideas)
    .where(and(eq(ideas.id, id), eq(ideas.userId, user.id)))
    .returning({ id: ideas.id });

  if (deleted.length === 0) {
    return { error: "삭제할 아이디어를 찾을 수 없습니다(본인 글만 삭제할 수 있어요)." };
  }

  if (attachedFiles.length > 0) {
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin.storage.from(BUCKET).remove(attachedFiles.map((f) => f.storagePath));
  }

  revalidatePath("/ideas");
  return { success: true };
}

export type DownloadUrlResult = { url?: string; error?: string };

/**
 * 아이디어 첨부파일 다운로드 signed URL 발급. getAchievementFileDownloadUrl과
 * 동일한 이유로 클라이언트가 Storage 경로를 직접 조합하지 않는다.
 */
export async function getIdeaFileDownloadUrl(fileId: string): Promise<DownloadUrlResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const file = await getIdeaFileById(fileId);
  if (!file) {
    return { error: "파일을 찾을 수 없습니다." };
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(file.storagePath, 60);

  if (error || !data) {
    return { error: "다운로드 링크 발급 중 오류가 발생했습니다." };
  }

  return { url: data.signedUrl };
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
    id: crypto.randomUUID(),
    userId: author.userId,
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

export type UpdateIdeaCommentState = { error?: string; success?: boolean };

/**
 * 댓글 수정. addIdeaComment와 동일하게 comments 배열 전체를 읽어 대상 댓글만
 * text를 바꾼 뒤 다시 쓴다. 배열 index가 아니라 `id`로 대상을 찾는다(동시에
 * 다른 사람이 댓글을 추가/삭제하면 index가 밀릴 수 있어서). `id`/`userId`가 없는
 * 레거시 댓글은 소유자를 특정할 수 없어 수정 대상이 될 수 없다(IdeaCard.tsx도
 * userId가 있는 본인 댓글에만 수정 버튼을 보여준다 — defense-in-depth).
 */
export async function updateIdeaComment(
  ideaId: string,
  commentId: string,
  formData: FormData,
): Promise<UpdateIdeaCommentState> {
  const user = await getCurrentUser();
  if (!user) {
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

  const target = idea.comments.find((c) => c.id === commentId);
  if (!target || target.userId !== user.id) {
    return { error: "수정할 댓글을 찾을 수 없습니다(본인 댓글만 수정할 수 있어요)." };
  }

  const nextComments = idea.comments.map((c) => (c.id === commentId ? { ...c, text } : c));

  await db.update(ideas).set({ comments: nextComments }).where(eq(ideas.id, ideaId));

  revalidatePath("/ideas");
  return { success: true };
}

export type DeleteIdeaCommentState = { error?: string; success?: boolean };

/** 댓글 삭제. updateIdeaComment와 동일한 소유권 확인 후 배열에서 제거한다. */
export async function deleteIdeaComment(ideaId: string, commentId: string): Promise<DeleteIdeaCommentState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const [idea] = await db.select({ comments: ideas.comments }).from(ideas).where(eq(ideas.id, ideaId));
  if (!idea) {
    return { error: "아이디어를 찾을 수 없습니다." };
  }

  const target = idea.comments.find((c) => c.id === commentId);
  if (!target || target.userId !== user.id) {
    return { error: "삭제할 댓글을 찾을 수 없습니다(본인 댓글만 삭제할 수 있어요)." };
  }

  const nextComments = idea.comments.filter((c) => c.id !== commentId);

  await db.update(ideas).set({ comments: nextComments }).where(eq(ideas.id, ideaId));

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
