"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { db } from "@/lib/db/client";
import { dailyLogTemplates, dailyLogs, type DailyLogChecklistItem } from "@/db/schema";

/** Asia/Seoul 기준 캘린더 날짜 키(YYYY-MM-DD). schedule/meetings/daily page.tsx와 동일한 헬퍼. */
function seoulDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date);
}

function parseChecklistJson(raw: FormDataEntryValue | null): DailyLogChecklistItem[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({ text: String(item.text ?? "").trim(), done: Boolean(item.done) }))
    .filter((item) => item.text.length > 0);
}

export type SaveDailyLogState = { error?: string; success?: boolean };

/**
 * 오늘 기록 작성 = 지난 기록 수정과 같은 흐름이다 — dateKey(대상 날짜)에 내
 * 기록이 이미 있으면 UPDATE, 없으면 INSERT한다(하루 1건, DailyBoard가 같은
 * WriteLogModal을 "작성"/"수정" 두 경우 모두에 재사용하는 것과 대응).
 * daily_logs는 RLS(TASK-025)에 INSERT/UPDATE/DELETE own 정책이 이미 있었지만
 * 이 Server Action 자체가 이번 TASK-035에서 처음 생겼다 — 지금까지 실제로
 * 그 정책을 쓰는 쓰기 경로가 없었다.
 */
export async function saveDailyLog(dateKey: string, formData: FormData): Promise<SaveDailyLogState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const body = String(formData.get("body") ?? "").trim();
  const checklist = parseChecklistJson(formData.get("checklistJson"));
  if (!body && checklist.length === 0) {
    return { error: "오늘 한 일이나 체크리스트를 입력해 주세요." };
  }

  const myLogs = await db.select({ id: dailyLogs.id, loggedAt: dailyLogs.loggedAt }).from(dailyLogs).where(eq(dailyLogs.userId, user.id));
  const existing = myLogs.find((row) => seoulDateKey(row.loggedAt) === dateKey);

  if (existing) {
    await db
      .update(dailyLogs)
      .set({ body, checklist })
      .where(and(eq(dailyLogs.id, existing.id), eq(dailyLogs.userId, user.id)));
  } else {
    await db.insert(dailyLogs).values({ userId: user.id, body, checklist });
  }

  revalidatePath("/daily");
  return { success: true };
}

/**
 * 팀 기록 카드에서 "수정" 모달을 거치지 않고 체크리스트 항목 하나만 바로
 * 토글하는 액션(TASK-036). body는 건드리지 않는다 — saveDailyLog처럼 폼
 * 전체를 다시 보내면 모달을 열지 않고는 body를 알 수 없어서 별도로 뺐다.
 */
export async function toggleDailyLogChecklistItem(dateKey: string, itemIndex: number): Promise<SaveDailyLogState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const myLogs = await db
    .select({ id: dailyLogs.id, loggedAt: dailyLogs.loggedAt, checklist: dailyLogs.checklist })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, user.id));
  const existing = myLogs.find((row) => seoulDateKey(row.loggedAt) === dateKey);
  if (!existing || !existing.checklist[itemIndex]) {
    return { error: "체크리스트 항목을 찾을 수 없습니다." };
  }

  const checklist = existing.checklist.map((item, i) => (i === itemIndex ? { ...item, done: !item.done } : item));

  await db
    .update(dailyLogs)
    .set({ checklist })
    .where(and(eq(dailyLogs.id, existing.id), eq(dailyLogs.userId, user.id)));

  revalidatePath("/daily");
  return { success: true };
}

export type CreateTemplateState = { error?: string; success?: boolean };

export async function createTemplate(formData: FormData): Promise<CreateTemplateState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "템플릿 이름을 입력해 주세요." };
  }

  let items: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("itemsJson") ?? "[]"));
    if (Array.isArray(parsed)) {
      items = parsed.map((v) => String(v).trim()).filter(Boolean);
    }
  } catch {
    // 무시 — items는 빈 배열로 저장
  }
  if (items.length === 0) {
    return { error: "체크리스트에 최소 1개 항목이 있어야 템플릿으로 저장할 수 있어요." };
  }

  await db.insert(dailyLogTemplates).values({ userId: user.id, title, items });

  revalidatePath("/daily");
  return { success: true };
}

export type DeleteTemplateState = { error?: string; success?: boolean };

export async function deleteTemplate(id: string): Promise<DeleteTemplateState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const deleted = await db
    .delete(dailyLogTemplates)
    .where(and(eq(dailyLogTemplates.id, id), eq(dailyLogTemplates.userId, user.id)))
    .returning({ id: dailyLogTemplates.id });

  if (deleted.length === 0) {
    return { error: "삭제할 템플릿을 찾을 수 없습니다." };
  }

  revalidatePath("/daily");
  return { success: true };
}
