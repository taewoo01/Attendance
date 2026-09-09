import { OpenActionsCard } from "@/components/meetings/OpenActionsCard";
import type { Meeting } from "@/components/meetings/MeetingCard";

type MeetingsSidebarProps = {
  meetings: Meeting[];
};

/**
 * playground-design/meetings.html의 <aside> 격 2개 .side-card
 * (이번 달 요약 / 미완료 액션아이템). "이번 달 요약"은 원본 <script>가 전혀
 * 건드리지 않는 정적 영역이라 Server Component로 유지한다.
 * TASK-023: 두 블록 모두 원본에서는 하드코딩 수치였으나, 같은 페이지의
 * 실제 회의록 목록에서 파생된 값이므로(회의록 수/액션아이템 수/지연 수,
 * 미완료 액션 목록) meetings props에서 직접 계산한다.
 * TASK-033: "미완료 액션아이템"의 `.chk`를 실제 토글로 바꾸면서(더 이상
 * 정적이지 않음) OpenActionsCard Client Component로 분리했다 — 체크에는
 * 어떤 회의록의 몇 번째 액션인지가 필요해 meetingId/actionIndex를 함께 넘긴다.
 */
export function MeetingsSidebar({ meetings }: MeetingsSidebarProps) {
  const allActions = meetings.flatMap((meeting) => meeting.actions);
  const monthSummary = [
    { n: String(meetings.length), l: "회의록" },
    { n: String(allActions.length), l: "액션아이템" },
    { n: String(allActions.filter((action) => action.dueVariant === "late").length), l: "지연" },
  ];
  const openActions = meetings.flatMap((meeting) =>
    meeting.actions
      .map((action, actionIndex) => ({ action, actionIndex }))
      .filter(({ action }) => !action.done)
      .map(({ action, actionIndex }) => ({
        meetingId: meeting.id,
        actionIndex,
        title: action.text,
        meta: `${action.who} · ${action.due}`,
      })),
  );

  return (
    <div>
      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">이번 달 요약</h4>
        <div className="flex gap-5">
          {monthSummary.map((item) => (
            <div key={item.l} className="flex-1">
              <div className="font-mono text-[24px] font-bold text-teal">{item.n}</div>
              <div className="mt-1 text-[11px] text-silk-faint">{item.l}</div>
            </div>
          ))}
        </div>
      </div>

      <OpenActionsCard items={openActions} />
    </div>
  );
}
