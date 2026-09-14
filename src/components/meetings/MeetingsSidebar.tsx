import { OpenActionsCard } from "@/components/meetings/OpenActionsCard";
import type { Meeting } from "@/components/meetings/MeetingCard";

type MeetingsSidebarProps = {
  meetings: Meeting[];
  /** 로그인한 본인의 프로필 이름. "내 할 일" 집계에 action.who와 문자열로 비교한다. */
  myName?: string;
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
 * 회의록 페이지 수정: "할 일"이 전체 개수(완료 포함)만 보여줘서 몇 건이 남았는지
 * 알 수 없었다 — "미완료/전체"("3/4") 형태로 바꿔 남은 일과 전체 규모를 한 번에
 * 보여준다. 같은 원칙으로 "내 할 일"(action.who가 본인 이름과 일치하는 것만
 * 집계)도 추가했다 — action.who는 자유 텍스트라(다른 회의록 필드와 동일한
 * 컨벤션) userId가 아닌 이름 문자열 비교로 매칭한다. myName이 없으면(로그인
 * 안 됨/프로필 미완성) 매칭 대상이 없어 이 타일은 표시하지 않는다.
 * 타일이 3~4개로 가변적이라 flex-1 한 줄 대신 2열 grid로 바꿔 좁은 사이드바
 * (300px)에서도 숫자가 눌리지 않게 했다.
 */
export function MeetingsSidebar({ meetings, myName }: MeetingsSidebarProps) {
  const allActions = meetings.flatMap((meeting) => meeting.actions);
  const totalCount = allActions.length;
  const doneCount = allActions.filter((action) => action.done).length;

  const normalizedMyName = myName?.trim();
  const myActions = normalizedMyName ? allActions.filter((action) => action.who.trim() === normalizedMyName) : [];
  const myTotalCount = myActions.length;
  const myDoneCount = myActions.filter((action) => action.done).length;

  const monthSummary = [
    { n: String(meetings.length), l: "회의록" },
    { n: `${totalCount - doneCount}/${totalCount}`, l: "할 일" },
    { n: String(allActions.filter((action) => action.dueVariant === "late").length), l: "지연" },
    ...(normalizedMyName ? [{ n: `${myTotalCount - myDoneCount}/${myTotalCount}`, l: "내 할 일" }] : []),
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
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          {monthSummary.map((item) => (
            <div key={item.l}>
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
