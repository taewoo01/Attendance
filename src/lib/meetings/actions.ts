"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { db } from "@/lib/db/client";
import { meetingNotes, type MeetingActionRow } from "@/db/schema";

/**
 * meeting_notes는 personal_events/fixed_schedules와 달리 user_id가 없는 팀
 * 공유 데이터다(0003_meeting_notes_rls.sql: SELECT만 팀 전체에게 열려 있고,
 * 쓰기는 "서버의 DATABASE_URL 연결(RLS 우회)에서만" 일어나는 것을 전제로 설계됨).
 * 그래서 Server Action은 personal_events처럼 WHERE절에 소유자를 넣는 대신,
 * "로그인했는가"만 확인한다 — 회의록은 로그인한 팀원 누구나 쓸 수 있는
 * 공유 문서에 가깝다(다른 팀원이 쓴 회의록도 수정/삭제할 수 있음, TASK-033).
 */

function parseLines(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseCommaList(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDueVariant(value: unknown): "soon" | "late" | undefined {
  return value === "soon" || value === "late" ? value : undefined;
}

function parseActionsJson(raw: FormDataEntryValue | null): MeetingActionRow[] {
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
    .map((item) => {
      const who = String(item.who ?? "").trim();
      return {
        text: String(item.text ?? "").trim(),
        who,
        avatar: who.charAt(0),
        due: String(item.due ?? "").trim(),
        dueVariant: toDueVariant(item.dueVariant),
        done: Boolean(item.done),
      };
    })
    .filter((item) => item.text.length > 0);
}

function meetingValuesFromForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    meetingDate: String(formData.get("meetingDate") ?? "").trim(),
    place: String(formData.get("place") ?? "").trim(),
    attendees: parseCommaList(formData.get("attendees")),
    agenda: parseLines(formData.get("agenda")),
    decisions: parseLines(formData.get("decisions")),
    actions: parseActionsJson(formData.get("actionsJson")),
    tag: String(formData.get("tag") ?? "").trim(),
    recorder: String(formData.get("recorder") ?? "").trim(),
  };
}

export type CreateMeetingState = { error?: string; success?: boolean };

export async function createMeeting(formData: FormData): Promise<CreateMeetingState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const values = meetingValuesFromForm(formData);
  if (!values.title) {
    return { error: "제목을 입력해 주세요." };
  }

  await db.insert(meetingNotes).values(values);

  revalidatePath("/meetings");
  return { success: true };
}

export type UpdateMeetingState = { error?: string; success?: boolean };

/**
 * 회의록 수정. user_id가 없어 personal_events처럼 소유자 WHERE절을 걸 수
 * 없다 — 로그인한 팀원이면 누구나 다른 팀원이 쓴 회의록도 수정할 수 있다
 * (파일 상단 주석 참고, 공유 문서 모델을 그대로 따름).
 */
export async function updateMeeting(id: string, formData: FormData): Promise<UpdateMeetingState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const values = meetingValuesFromForm(formData);
  if (!values.title) {
    return { error: "제목을 입력해 주세요." };
  }

  const updated = await db.update(meetingNotes).set(values).where(eq(meetingNotes.id, id)).returning({ id: meetingNotes.id });
  if (updated.length === 0) {
    return { error: "수정할 회의록을 찾을 수 없습니다." };
  }

  revalidatePath("/meetings");
  return { success: true };
}

export type DeleteMeetingState = { error?: string; success?: boolean };

export async function deleteMeeting(id: string): Promise<DeleteMeetingState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const deleted = await db.delete(meetingNotes).where(eq(meetingNotes.id, id)).returning({ id: meetingNotes.id });
  if (deleted.length === 0) {
    return { error: "삭제할 회의록을 찾을 수 없습니다." };
  }

  revalidatePath("/meetings");
  return { success: true };
}

export type ToggleMeetingActionState = { error?: string; success?: boolean };

/**
 * 액션 아이템 1건의 완료 여부만 토글한다(원본 .chk/사이드바 미완료 목록 체크박스는
 * 클릭 리스너 없는 장식용이었다 — TASK-033에서 실제 동작으로 교체).
 * actions는 jsonb 배열 컬럼 전체이므로, 전체를 읽어 해당 인덱스만 바꾼 뒤 다시 쓴다.
 */
export async function toggleMeetingAction(meetingId: string, actionIndex: number): Promise<ToggleMeetingActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const [meeting] = await db.select({ actions: meetingNotes.actions }).from(meetingNotes).where(eq(meetingNotes.id, meetingId));
  if (!meeting || !meeting.actions[actionIndex]) {
    return { error: "액션 아이템을 찾을 수 없습니다." };
  }

  const nextActions = meeting.actions.map((action, i) => (i === actionIndex ? { ...action, done: !action.done } : action));

  await db.update(meetingNotes).set({ actions: nextActions }).where(eq(meetingNotes.id, meetingId));

  revalidatePath("/meetings");
  return { success: true };
}
