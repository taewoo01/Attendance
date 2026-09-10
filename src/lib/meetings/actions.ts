"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { db } from "@/lib/db/client";
import { meetingNotes, type MeetingActionRow } from "@/db/schema";
import { formatKoreanDateTimeLabel } from "@/lib/date";

/**
 * meeting_notes는 personal_events/fixed_schedules와 달리 user_id가 없는 팀
 * 공유 데이터다(0003_meeting_notes_rls.sql: SELECT만 팀 전체에게 열려 있고,
 * 쓰기는 "서버의 DATABASE_URL 연결(RLS 우회)에서만" 일어나는 것을 전제로 설계됨).
 * 그래서 Server Action은 personal_events처럼 WHERE절에 소유자를 넣는 대신,
 * "로그인했는가"만 확인한다 — 회의록은 로그인한 팀원 누구나 쓸 수 있는
 * 공유 문서에 가깝다(다른 팀원이 쓴 회의록도 수정/삭제할 수 있음, TASK-033).
 */

function parseCommaList(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** 행 편집기(안건 · 결정 사항)에서 보낸 짝 목록. decision은 비어있을 수 있다(아직 결정 안 된 안건). */
function parseAgendaRowsJson(raw: FormDataEntryValue | null): { agenda: string; decision: string }[] {
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
    .map((item) => ({ agenda: String(item.agenda ?? "").trim(), decision: String(item.decision ?? "").trim() }))
    .filter((row) => row.agenda.length > 0);
}

/**
 * agenda/decisions를 폼의 notesFormat에 따라 파싱한다.
 * - "text"(자유 텍스트): 줄바꿈을 보존한 원문 그대로 배열에 1개 원소로 담는다(있으면).
 * - 그 외("rows", 행 편집기): agendaRowsJson을 그대로 두 배열로 풀어 인덱스가
 *   1:1로 짝지어지게 한다 — decisions[i]가 비어있어도 자리(빈 문자열)를 유지한다.
 */
function parseAgendaAndDecisions(formData: FormData): { notesFormat: string; agenda: string[]; decisions: string[] } {
  const notesFormat = formData.get("notesFormat") === "text" ? "text" : "rows";

  if (notesFormat === "text") {
    const agendaText = String(formData.get("agenda") ?? "").trim();
    const decisionsText = String(formData.get("decisions") ?? "").trim();
    return {
      notesFormat,
      agenda: agendaText ? [agendaText] : [],
      decisions: decisionsText ? [decisionsText] : [],
    };
  }

  const rows = parseAgendaRowsJson(formData.get("agendaRowsJson"));
  return { notesFormat, agenda: rows.map((r) => r.agenda), decisions: rows.map((r) => r.decision) };
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

/**
 * 날짜(type="date")/시간(type="time") 피커 값을 받아 기존 표시용 텍스트 컬럼
 * (meetingDate)과 새 구조화 컬럼(meetingDateKey/meetingTime)을 함께 채운다.
 * 날짜를 아예 선택하지 않은 경우(회의록 날짜는 필수가 아니다) 셋 다 빈 문자열.
 */
function meetingValuesFromForm(formData: FormData) {
  const meetingDateKey = String(formData.get("meetingDateKey") ?? "").trim();
  const meetingTime = String(formData.get("meetingTime") ?? "").trim();
  const { notesFormat, agenda, decisions } = parseAgendaAndDecisions(formData);

  return {
    title: String(formData.get("title") ?? "").trim(),
    meetingDate: meetingDateKey ? formatKoreanDateTimeLabel(meetingDateKey, meetingTime) : "",
    meetingDateKey,
    meetingTime,
    place: String(formData.get("place") ?? "").trim(),
    attendees: parseCommaList(formData.get("attendees")),
    presenter: String(formData.get("presenter") ?? "").trim(),
    notesFormat,
    agenda,
    decisions,
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
    return { error: "할 일을 찾을 수 없습니다." };
  }

  const nextActions = meeting.actions.map((action, i) => (i === actionIndex ? { ...action, done: !action.done } : action));

  await db.update(meetingNotes).set({ actions: nextActions }).where(eq(meetingNotes.id, meetingId));

  revalidatePath("/meetings");
  return { success: true };
}
