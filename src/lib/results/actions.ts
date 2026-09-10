"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db/client";
import { achievementFiles, achievements } from "@/db/schema";
import { getAchievementById, getAchievementFileById, listAchievementFilesFor } from "@/lib/db/achievements";
import {
  ALLOWED_EXTENSIONS,
  BUCKET,
  MAX_SIZE_BYTES,
  contentTypeFor,
  extensionOf,
  sanitizeFileName,
} from "@/lib/files/upload-shared";

const CATEGORIES = ["", "논문", "공모전", "프로젝트", "창업"] as const;
// 저장 가능한 값("논문"이 아닐 때는 "")과 별개로, category === "논문"일 때 실제로
// 요구하는 값은 이 둘뿐이다 — REQUIRED_PAPER_TYPES에 ""를 넣으면 "선택 안 함" 상태로도
// 검증을 통과해버려 에러 메시지("논문 구분을 선택해 주세요")가 무의미해진다.
const REQUIRED_PAPER_TYPES = ["KCI", "SCI"] as const;

/**
 * createAchievement/updateAchievement가 공유하는 카테고리 필드 파싱+검증.
 * category가 폼 select 값 그대로 넘어오므로 whitelist 밖 값(임의 문자열)이면
 * 막는다. `paperType`은 category가 "논문"일 때만, `awarded`/`awardName`은
 * "공모전"일 때만 의미가 있어 그 외에는 서버에서 강제로 빈 값/false로 되돌린다
 * (클라이언트가 숨겨진 필드를 조작해 보내도 무시되게).
 */
function parseCategoryFields(
  formData: FormData,
): { category: string; paperType: string; awarded: boolean; awardName: string } | { error: string } {
  const category = String(formData.get("category") ?? "").trim();
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    return { error: "카테고리 값이 올바르지 않습니다." };
  }

  const paperType = category === "논문" ? String(formData.get("paperType") ?? "").trim() : "";
  if (category === "논문" && !(REQUIRED_PAPER_TYPES as readonly string[]).includes(paperType)) {
    return { error: "논문 구분(KCI/SCI)을 선택해 주세요." };
  }

  const awarded = category === "공모전" && formData.get("awarded") === "true";
  const awardName = awarded ? String(formData.get("awardName") ?? "").trim() : "";

  return { category, paperType, awarded, awardName };
}

export type CreateAchievementState = { error?: string; success?: boolean };

/**
 * "+ 실적 등록" Server Action. 순서: Authentication → 입력 검증 → insert.
 * TASK-026 당시엔 등록 기능 자체가 없어(RegisterResultModal.tsx가 저장 로직 없는
 * 정적 마크업이었다) 등록해도 목록에 안 보이는 문제가 있었다 — 이 액션이 그 실제
 * 저장 경로다. `avatar`는 TeamGrid의 이니셜 표기와 동일한 컨벤션(이름 첫 글자)으로
 * 서버에서 파생한다. `resultDate`는 컬럼 자체는 여전히 text지만(스키마를 바꾸지
 * 않는다) 날짜 피커가 준 ISO 값("YYYY-MM-DD") 그대로 저장한다 — personal_events.
 * eventDate와 동일한 컨벤션이다. 예전에는 "8월 31일 (월)" 같은 표기로 미리 변환해
 * 저장해서 실제 Date로 되돌릴 수 없었고, 그래서 실적 페이지의 주간/월간 기간
 * 이동이 항상 정적 문자열만 보여주고 실제로 필터링되지 않는 문제가 있었다.
 * 화면 표시용 "M월 D일 (요일)" 변환은 이제 렌더링 시점에 formatKoreanDateLabel
 * (src/lib/date.ts)로 한다(ResultsBoard/results/[id]/page.tsx 참고).
 * 첨부파일(#7/#8, 여러 개 가능)은 files 기능(src/lib/files/actions.ts)과 동일한
 * Storage 버킷/allowlist/용량 제한을 그대로 재사용하고, 경로만 `achievements/<id>/...`
 * 로 구분한다. 실적 행이 "첨부파일 깨짐" 상태로 반쯍 생성되는 걸 피하려고, id를
 * 미리 만들어 모든 파일을 먼저 업로드/검증한 뒤에야 achievements/achievement_files를
 * insert한다(하나라도 업로드 실패하면 실적 자체도 생성하지 않는다).
 */
export async function createAchievement(formData: FormData): Promise<CreateAchievementState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const team = formData.get("kind") === "team";
  const desc = String(formData.get("desc") ?? "").trim();
  const who = String(formData.get("who") ?? "").trim();
  const resultDateInput = String(formData.get("resultDate") ?? "").trim();
  const metricLabel = String(formData.get("metricLabel") ?? "").trim();
  const metricValue = String(formData.get("metricValue") ?? "").trim();
  const links = formData
    .getAll("links")
    .map((v) => String(v).trim())
    .filter(Boolean);
  // 구분이 "팀"일 때만 의미가 있다 — 폼도 team일 때만 이 필드를 보여주지만,
  // 서버에서도 개인 실적에 팀원 목록이 섞여 들어가지 않게 한 번 더 막는다.
  const teamMembers = team
    ? formData
        .getAll("teamMembers")
        .map((v) => String(v).trim())
        .filter(Boolean)
    : [];
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const categoryFields = parseCategoryFields(formData);

  if (!title) {
    return { error: "제목을 입력해 주세요." };
  }
  if (!who) {
    return { error: "담당자를 선택해 주세요." };
  }
  if (!resultDateInput) {
    return { error: "날짜를 선택해 주세요." };
  }
  // <a href>로 그대로 렌더링되므로(ResultList.tsx/results/[id]/page.tsx) javascript:/data:
  // 같은 스킴을 막아야 한다 — type="url" input은 문법만 검증하고 스킴은 안 가린다.
  if (links.some((l) => !/^https?:\/\//i.test(l))) {
    return { error: "참고 링크는 http:// 또는 https:// 로 시작해야 합니다." };
  }
  if ("error" in categoryFields) {
    return { error: categoryFields.error };
  }
  for (const file of files) {
    if (!ALLOWED_EXTENSIONS.has(extensionOf(file.name))) {
      return { error: `허용되지 않는 파일 형식입니다: ${file.name}` };
    }
    if (file.size > MAX_SIZE_BYTES) {
      return { error: `파일 용량이 20MB를 초과합니다: ${file.name}` };
    }
  }

  const achievementId = crypto.randomUUID();
  const supabaseAdmin = createAdminClient();

  // 병렬 업로드(각 파일 경로가 독립적이라 순서 의존 없음). 하나라도 실패하면 이미
  // 올라간 나머지 파일들을 Storage에서 정리한다 — achievements/achievement_files
  // 행은 아직 insert 전이라, 정리하지 않으면 아무도 참조하지 않는 고아 객체로 남는다.
  const uploadResults = await Promise.all(
    files.map(async (file) => {
      const safeName = sanitizeFileName(file.name);
      const storagePath = `achievements/${achievementId}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, await file.arrayBuffer(), { contentType: contentTypeFor(file.name, file.type) });
      return { error: uploadError, storagePath, name: safeName, sizeBytes: file.size };
    }),
  );

  const succeeded = uploadResults.filter((r) => !r.error);
  const failed = uploadResults.filter((r) => r.error);
  if (failed.length > 0) {
    // uploadError는 클라이언트에 그대로 노출하지 않지만(Supabase 내부 메시지), 서버
    // 로그에는 남겨야 재발 시 원인(용량/버킷 mime 정책/네트워크 등)을 알 수 있다 —
    // 이전에는 이 에러를 그냥 버려서 실패 원인을 전혀 알 수 없었다.
    for (const f of failed) {
      console.error("[createAchievement] achievement file upload failed", f.name, f.error);
    }
    if (succeeded.length > 0) {
      await supabaseAdmin.storage.from(BUCKET).remove(succeeded.map((r) => r.storagePath));
    }
    return { error: "첨부파일 업로드 중 오류가 발생했습니다." };
  }

  const uploaded = succeeded.map((r) => ({ storagePath: r.storagePath, name: r.name, sizeBytes: r.sizeBytes }));

  await db.insert(achievements).values({
    id: achievementId,
    userId: user.id,
    avatar: who.charAt(0) || "?",
    team,
    teamMembers,
    title,
    desc,
    who,
    links,
    resultDate: resultDateInput,
    metricLabel,
    metricValue,
    ...categoryFields,
  });

  if (uploaded.length > 0) {
    await db.insert(achievementFiles).values(
      uploaded.map((f) => ({
        achievementId,
        userId: user.id,
        storagePath: f.storagePath,
        name: f.name,
        sizeBytes: f.sizeBytes,
      })),
    );
  }

  revalidatePath("/results");
  revalidatePath("/");
  return { success: true };
}

export type UpdateAchievementState = { error?: string; success?: boolean };

/**
 * 실적 수정 Server Action. createAchievement와 동일한 검증(제목/담당자/날짜/링크
 * 스킴/새 첨부파일 확장자·용량)을 거친 뒤 본인 소유 실적만 갱신한다. 첨부파일은
 * "추가"(files)와 "기존 제거"(removeFileIds)를 한 번에 받는다 — 새 파일 업로드가
 * 실패하면 기존 파일 삭제/DB update 자체를 진행하지 않아(createAchievement와 동일한
 * "반쯤 성공 상태 방지" 원칙) 실패 시 아무것도 바뀌지 않는다. removeFileIds는
 * listAchievementFilesFor(id)로 다시 조회해 이 실적 소유가 맞는 파일인지 서버에서
 * 한 번 더 확인한다(다른 실적의 fileId를 넘겨 지우는 걸 막는다).
 */
export async function updateAchievement(id: string, formData: FormData): Promise<UpdateAchievementState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const existing = await getAchievementById(id);
  if (!existing || existing.userId !== user.id) {
    return { error: "수정할 실적을 찾을 수 없습니다(본인이 등록한 실적만 수정할 수 있어요)." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const team = formData.get("kind") === "team";
  const desc = String(formData.get("desc") ?? "").trim();
  const who = String(formData.get("who") ?? "").trim();
  const resultDateInput = String(formData.get("resultDate") ?? "").trim();
  const metricLabel = String(formData.get("metricLabel") ?? "").trim();
  const metricValue = String(formData.get("metricValue") ?? "").trim();
  const links = formData
    .getAll("links")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const teamMembers = team
    ? formData
        .getAll("teamMembers")
        .map((v) => String(v).trim())
        .filter(Boolean)
    : [];
  const newFiles = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const removeFileIds = formData
    .getAll("removeFileIds")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const categoryFields = parseCategoryFields(formData);

  if (!title) {
    return { error: "제목을 입력해 주세요." };
  }
  if (!who) {
    return { error: "담당자를 선택해 주세요." };
  }
  if (!resultDateInput) {
    return { error: "날짜를 선택해 주세요." };
  }
  if (links.some((l) => !/^https?:\/\//i.test(l))) {
    return { error: "참고 링크는 http:// 또는 https:// 로 시작해야 합니다." };
  }
  if ("error" in categoryFields) {
    return { error: categoryFields.error };
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
      const storagePath = `achievements/${id}/${crypto.randomUUID()}-${safeName}`;
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
      console.error("[updateAchievement] achievement file upload failed", f.name, f.error);
    }
    if (succeeded.length > 0) {
      await supabaseAdmin.storage.from(BUCKET).remove(succeeded.map((r) => r.storagePath));
    }
    return { error: "첨부파일 업로드 중 오류가 발생했습니다." };
  }

  let removedFiles: { id: string; storagePath: string }[] = [];
  if (removeFileIds.length > 0) {
    const attached = await listAchievementFilesFor(id);
    removedFiles = attached.filter((f) => removeFileIds.includes(f.id));
  }

  await db
    .update(achievements)
    .set({
      avatar: who.charAt(0) || "?",
      team,
      teamMembers,
      title,
      desc,
      who,
      links,
      resultDate: resultDateInput,
      metricLabel,
      metricValue,
      ...categoryFields,
    })
    .where(and(eq(achievements.id, id), eq(achievements.userId, user.id)));

  if (succeeded.length > 0) {
    await db.insert(achievementFiles).values(
      succeeded.map((f) => ({
        achievementId: id,
        userId: user.id,
        storagePath: f.storagePath,
        name: f.name,
        sizeBytes: f.sizeBytes,
      })),
    );
  }

  if (removedFiles.length > 0) {
    await db
      .delete(achievementFiles)
      .where(and(eq(achievementFiles.achievementId, id), inArray(achievementFiles.id, removedFiles.map((f) => f.id))));
    await supabaseAdmin.storage.from(BUCKET).remove(removedFiles.map((f) => f.storagePath));
  }

  revalidatePath("/results");
  revalidatePath(`/results/${id}`);
  revalidatePath("/");
  return { success: true };
}

export type DownloadUrlResult = { url?: string; error?: string };

/**
 * 실적 첨부파일 다운로드 signed URL 발급. files 기능의 getFileDownloadUrl과
 * 동일한 이유로 클라이언트가 Storage 경로를 직접 조합하지 않는다.
 */
export async function getAchievementFileDownloadUrl(fileId: string): Promise<DownloadUrlResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const file = await getAchievementFileById(fileId);
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

export type DeleteAchievementState = { error?: string; success?: boolean };

/**
 * 실적 삭제 Server Action. personal_events/fixed_schedules와 동일하게 WHERE 절에
 * userId를 포함해 본인 소유가 아니면 삭제되지 않는다. achievement_files DB 행은
 * FK(onDelete: cascade)로 같이 지워지지만, Storage 객체는 Postgres cascade로
 * 지워지지 않으므로 실적 삭제 전에 첨부파일 경로를 미리 조회해뒀다가 삭제
 * 성공 후 Storage에서도 지운다(best-effort — Storage 삭제가 실패해도 실적
 * 삭제 자체는 이미 끝난 상태라 에러로 되돌리지 않는다).
 */
export async function deleteAchievement(id: string): Promise<DeleteAchievementState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const attachedFiles = await listAchievementFilesFor(id);

  const deleted = await db
    .delete(achievements)
    .where(and(eq(achievements.id, id), eq(achievements.userId, user.id)))
    .returning({ id: achievements.id });

  if (deleted.length === 0) {
    return { error: "삭제할 실적을 찾을 수 없습니다." };
  }

  if (attachedFiles.length > 0) {
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin.storage.from(BUCKET).remove(attachedFiles.map((f) => f.storagePath));
  }

  revalidatePath("/results");
  revalidatePath("/");
  return { success: true };
}
