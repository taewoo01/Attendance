"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { db } from "@/lib/db/client";
import { fixedSchedules, personalEvents } from "@/db/schema";

const VALID_DAY_OF_WEEK = new Set(["월", "화", "수", "목", "금", "토", "일"]);

export type CreatePersonalEventState = { error?: string; success?: boolean };

/**
 * "+ 개인 일정 등록" Server Action. 순서: Authentication → 입력 검증 → insert.
 * 원본 schedule.html에는 이 버튼에 대응하는 등록 폼/모달이 없어(정적 버튼) 새로
 * 최소 폼(RegisterEventModal.tsx)을 만들었다 — 필드는 personal_events 스키마
 * (eventDate/eventTime/title)와 1:1로 대응한다.
 */
export async function createPersonalEvent(formData: FormData): Promise<CreatePersonalEventState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const eventTime = String(formData.get("eventTime") ?? "").trim();
  const eventEndTime = String(formData.get("eventEndTime") ?? "").trim();

  if (!title) {
    return { error: "일정 제목을 입력해 주세요." };
  }
  if (!eventDate) {
    return { error: "날짜를 선택해 주세요." };
  }

  await db.insert(personalEvents).values({
    userId: user.id,
    eventDate,
    eventTime,
    eventEndTime: eventEndTime || null,
    title,
  });

  revalidatePath("/schedule");
  revalidatePath("/");
  return { success: true };
}

export type UpdatePersonalEventState = { error?: string; success?: boolean };

/**
 * 개인 일정 수정 Server Action. createPersonalEvent와 동일한 검증을 거치고,
 * deletePersonalEvent와 동일하게 WHERE 절에 userId를 포함해 본인 소유가 아니면
 * 수정되지 않게 한다(personal_events_update_own RLS와 같은 원칙).
 */
export async function updatePersonalEvent(id: string, formData: FormData): Promise<UpdatePersonalEventState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const eventTime = String(formData.get("eventTime") ?? "").trim();
  const eventEndTime = String(formData.get("eventEndTime") ?? "").trim();

  if (!title) {
    return { error: "일정 제목을 입력해 주세요." };
  }
  if (!eventDate) {
    return { error: "날짜를 선택해 주세요." };
  }

  const updated = await db
    .update(personalEvents)
    .set({ title, eventDate, eventTime, eventEndTime: eventEndTime || null })
    .where(and(eq(personalEvents.id, id), eq(personalEvents.userId, user.id)))
    .returning({ id: personalEvents.id });

  if (updated.length === 0) {
    return { error: "수정할 일정을 찾을 수 없습니다." };
  }

  revalidatePath("/schedule");
  revalidatePath("/");
  return { success: true };
}

export type DeletePersonalEventState = { error?: string; success?: boolean };

/**
 * 개인 일정 삭제 Server Action. 본인 소유가 아니면 조용히 실패하지 않고
 * 명시적으로 거부한다 — WHERE 절에 userId를 포함해 DB 레벨에서도 다른
 * 사람의 일정을 삭제할 수 없게 한다(RLS의 personal_events_delete_own 정책과
 * 같은 원칙을 서버 DATABASE_URL 경로에도 동일하게 적용).
 */
export async function deletePersonalEvent(id: string): Promise<DeletePersonalEventState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const deleted = await db
    .delete(personalEvents)
    .where(and(eq(personalEvents.id, id), eq(personalEvents.userId, user.id)))
    .returning({ id: personalEvents.id });

  if (deleted.length === 0) {
    return { error: "삭제할 일정을 찾을 수 없습니다." };
  }

  revalidatePath("/schedule");
  revalidatePath("/");
  return { success: true };
}

export type CreateFixedScheduleState = { error?: string; success?: boolean };

/**
 * "내 고정 시간표" 등록 Server Action. createPersonalEvent와 동일한 순서
 * (Authentication → 입력 검증 → insert)를 따른다. TASK-032 이전에는
 * fixed_schedules에 쓰기 RLS 정책이 없어 등록 기능 자체가 없었다
 * (0016_fixed_schedules_rls.sql에서 INSERT/UPDATE/DELETE own 정책 추가).
 */
export async function createFixedSchedule(formData: FormData): Promise<CreateFixedScheduleState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const dayOfWeek = String(formData.get("dayOfWeek") ?? "").trim();
  const timeRange = String(formData.get("timeRange") ?? "").trim();

  if (!title) {
    return { error: "일정 제목을 입력해 주세요." };
  }
  if (!VALID_DAY_OF_WEEK.has(dayOfWeek)) {
    return { error: "요일을 선택해 주세요." };
  }

  await db.insert(fixedSchedules).values({
    userId: user.id,
    dayOfWeek,
    timeRange,
    title,
  });

  revalidatePath("/schedule");
  return { success: true };
}

export type UpdateFixedScheduleState = { error?: string; success?: boolean };

/**
 * 고정 시간표 수정 Server Action. createFixedSchedule과 동일한 검증을 거치고,
 * deleteFixedSchedule과 동일하게 본인 소유가 아니면 수정되지 않게 한다.
 */
export async function updateFixedSchedule(id: string, formData: FormData): Promise<UpdateFixedScheduleState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const dayOfWeek = String(formData.get("dayOfWeek") ?? "").trim();
  const timeRange = String(formData.get("timeRange") ?? "").trim();

  if (!title) {
    return { error: "일정 제목을 입력해 주세요." };
  }
  if (!VALID_DAY_OF_WEEK.has(dayOfWeek)) {
    return { error: "요일을 선택해 주세요." };
  }

  const updated = await db
    .update(fixedSchedules)
    .set({ title, dayOfWeek, timeRange })
    .where(and(eq(fixedSchedules.id, id), eq(fixedSchedules.userId, user.id)))
    .returning({ id: fixedSchedules.id });

  if (updated.length === 0) {
    return { error: "수정할 고정 일정을 찾을 수 없습니다." };
  }

  revalidatePath("/schedule");
  return { success: true };
}

export type DeleteFixedScheduleState = { error?: string; success?: boolean };

/**
 * 고정 시간표 삭제 Server Action. deletePersonalEvent와 동일하게 WHERE 절에
 * userId를 포함해 본인 소유가 아니면 DB 레벨에서도 삭제되지 않게 한다.
 */
export async function deleteFixedSchedule(id: string): Promise<DeleteFixedScheduleState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const deleted = await db
    .delete(fixedSchedules)
    .where(and(eq(fixedSchedules.id, id), eq(fixedSchedules.userId, user.id)))
    .returning({ id: fixedSchedules.id });

  if (deleted.length === 0) {
    return { error: "삭제할 고정 일정을 찾을 수 없습니다." };
  }

  revalidatePath("/schedule");
  return { success: true };
}
