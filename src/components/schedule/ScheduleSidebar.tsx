import { AgendaCard } from "@/components/schedule/AgendaCard";
import { FixedScheduleCard } from "@/components/schedule/FixedScheduleCard";

export type AgendaItem = {
  time: string;
  /** personal 타입에만 존재 — 종료 시간을 입력하지 않았으면 undefined(시작 시간만 표시). */
  endTime?: string;
  title: string;
  sub: string;
  /** personal_events 항목 중 본인 소유일 때만 채워진다 — AgendaCard의 수정 모달용. */
  id?: string;
  eventDate?: string;
  rawTitle?: string;
};
export type FixedScheduleItem = {
  id: string;
  day: string;
  title: string;
  time: string;
  /** "전체 고정 시간표" 탭에서만 쓴다 — 소유자 이름/id. */
  name?: string;
  userId?: string;
};

type ScheduleSidebarProps = {
  todayLabel: string;
  agenda: AgendaItem[];
  fixedSchedule: FixedScheduleItem[];
  allFixedSchedule: FixedScheduleItem[];
  userId?: string;
};

/**
 * playground-design/schedule.html의 <aside>(오늘 아젠다 + 내 고정 시간표) 골격.
 * TASK-028: 하드코딩된 AGENDA(오늘 체크인 + 팀 전체의 오늘 일정)/FIXED_SCHEDULE
 * (로그인한 사용자 본인의 고정 시간표만) 대신 page.tsx가 계산한 실제 데이터를
 * props로 받는다.
 * "오늘" 아젠다 카드는 본인 소유 개인 일정 수정이 가능해야 해서 AgendaCard
 * Client Component로 분리했다(FixedScheduleCard와 동일한 패턴).
 * "내 고정 시간표"(본인 것만)와 "전체 고정 시간표"(팀 전체)는 서로 다른 데이터라
 * FixedScheduleCard 안에 탭으로 나눠 보여준다 — 본인 것만 수정/삭제 가능하다.
 */
export function ScheduleSidebar({ todayLabel, agenda, fixedSchedule, allFixedSchedule, userId }: ScheduleSidebarProps) {
  return (
    <aside>
      <AgendaCard todayLabel={todayLabel} agenda={agenda} />
      <FixedScheduleCard items={fixedSchedule} allItems={allFixedSchedule} userId={userId} />
    </aside>
  );
}
