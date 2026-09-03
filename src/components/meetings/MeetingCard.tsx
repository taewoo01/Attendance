export type MeetingAction = {
  text: string;
  avatar: string;
  who: string;
  due: string;
  dueVariant?: "soon" | "late";
  done?: boolean;
};

export type Meeting = {
  title: string;
  date: string;
  place: string;
  attendees: string[];
  agenda: string[];
  decisions: string[];
  actions: MeetingAction[];
  tag: string;
  recorder: string;
};

/**
 * playground-design/meetings.html의 .mtg-card.
 * 원본 <script>가 카드 내부를 전혀 건드리지 않는 순수 정적 영역이라
 * Server Component로 유지한다.
 */
export function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <div className="mb-4 rounded-card border border-border bg-bg-panel px-[22px] pt-5 pb-[18px]">
      <div className="mb-[14px] flex flex-wrap items-start justify-between gap-[14px] border-b border-border pb-[14px]">
        <div>
          <h4 className="m-0 mb-1.5 text-[15.5px] font-semibold text-silk">{meeting.title}</h4>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11.5px] text-silk-faint">
            <span className="text-teal">{meeting.date}</span>
            <span>·</span>
            <span>{meeting.place}</span>
          </div>
        </div>
        <div className="flex items-center">
          {meeting.attendees.map((av, i) => (
            <div
              key={i}
              className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-bg-panel bg-[rgba(72,217,176,0.18)] font-mono text-[9px] font-bold text-teal ${
                i === 0 ? "ml-0" : "-ml-1.5"
              }`}
            >
              {av}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-[14px]">
        <p className="m-0 mb-2 font-mono text-[10px] tracking-[0.1em] text-silk-faint">안건</p>
        <ul className="m-0 list-none p-0">
          {meeting.agenda.map((item, i) => (
            <li
              key={i}
              className="relative mb-[5px] pl-[14px] text-[12.8px] leading-[1.6] text-silk-dim last:mb-0 before:absolute before:left-0 before:content-['—'] before:text-silk-faint"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-[14px]">
        <p className="m-0 mb-2 font-mono text-[10px] tracking-[0.1em] text-silk-faint">결정 사항</p>
        {meeting.decisions.map((decision, i) => (
          <div
            key={i}
            className="mb-1.5 rounded-[6px] border-l-[3px] border-teal bg-teal-dim px-[13px] py-2.5 text-[12.8px] leading-[1.6] text-silk last:mb-0"
          >
            {decision}
          </div>
        ))}
      </div>

      <div>
        <p className="m-0 mb-2 font-mono text-[10px] tracking-[0.1em] text-silk-faint">액션 아이템</p>
        {meeting.actions.map((action, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-border py-[9px] last:border-b-0"
          >
            <div className={`text-[12.8px] ${action.done ? "text-silk-faint line-through" : "text-silk"}`}>
              {action.text}
            </div>
            <div className="flex items-center gap-[5px] whitespace-nowrap font-mono text-[11px] text-silk-dim">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(226,168,63,0.18)] text-[8px] font-bold text-amber">
                {action.avatar}
              </span>
              {action.who}
            </div>
            <div
              className={`whitespace-nowrap rounded-[5px] px-2 py-[3px] font-mono text-[10.5px] ${
                action.dueVariant === "soon"
                  ? "bg-amber-dim text-amber"
                  : action.dueVariant === "late"
                    ? "bg-[rgba(226,84,63,0.16)] text-[#e2543f]"
                    : "bg-bg-raised text-silk-faint"
              }`}
            >
              {action.due}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[14px] flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-silk-faint">
        <span className="rounded-[5px] bg-bg-raised px-2 py-[3px]">{meeting.tag}</span>
        <span>기록: {meeting.recorder}</span>
      </div>
    </div>
  );
}
