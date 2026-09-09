import { AgendaCard } from "@/components/schedule/AgendaCard";
import { FixedScheduleCard } from "@/components/schedule/FixedScheduleCard";
import { PersonalEventCard } from "@/components/schedule/PersonalEventCard";

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
  /** 표시용 파생값("09:00–12:00"). 수정 모달은 startTime/endTime을 따로 쓴다. */
  time: string;
  startTime: string;
  endTime?: string;
  /** "전체 고정 시간표" 탭에서만 쓴다 — 소유자 이름/id. */
  name?: string;
  userId?: string;
};

export type PersonalEventItem = {
  id: string;
  /** 표시용 날짜("9/9"). 고정 시간표의 요일과 달리 개인 일정은 특정 날짜 하나뿐이다. */
  dateLabel: string;
  title: string;
  /** 표시용 파생값("09:00–12:00"). 수정 모달은 eventTime/eventEndTime을 따로 쓴다. */
  time: string;
  eventDate: string;
  eventTime: string;
  eventEndTime?: string;
};

type ScheduleSidebarProps = {
  todayLabel: string;
  agenda: AgendaItem[];
  fixedSchedule: FixedScheduleItem[];
  allFixedSchedule: FixedScheduleItem[];
  personalEvents: PersonalEventItem[];
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
 * "개인 일정" 카드(PersonalEventCard)는 본인 소유 personal_events 전체를 목록으로
 * 보여준다 — 캘린더 안에서는 더 이상 삭제할 수 없어서(칸이 좁아 오조작 잦음),
 * 고정 시간표 카드 바로 아래에 동일한 리스트+삭제 패턴으로 둔다.
 */
export function ScheduleSidebar({
  todayLabel,
  agenda,
  fixedSchedule,
  allFixedSchedule,
  personalEvents,
  userId,
}: ScheduleSidebarProps) {
  return (
    <aside>
      <AgendaCard todayLabel={todayLabel} agenda={agenda} />
      <FixedScheduleCard items={fixedSchedule} allItems={allFixedSchedule} userId={userId} />
      <PersonalEventCard items={personalEvents} />
    </aside>
  );
}
