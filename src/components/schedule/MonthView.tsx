type MonthEvent = { time: string; label: string; type: "personal" | "fixed" };

type MonthCell = {
  date: number;
  muted?: boolean;
  today?: boolean;
  count?: string;
  dots?: Array<"personal" | "fixed">;
  events?: MonthEvent[];
  moreCount?: number;
};

const DOW_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

/**
 * playground-design/schedule.html의 #monthView(.month-grid) 42칸 정적 데이터.
 * 원본 <script>는 이 데이터를 전혀 조작하지 않아(내 일정/팀 전체 필터가 .day-events만
 * 대상으로 함) 상태 없이 Server Component로 유지한다.
 */
const CELLS: MonthCell[] = [
  { date: 27, muted: true },
  { date: 28, muted: true },
  { date: 29, muted: true },
  { date: 30, muted: true },
  { date: 31, muted: true },
  { date: 1 },
  { date: 2 },

  { date: 3, count: "4명", dots: ["fixed"] },
  { date: 4 },
  { date: 5, count: "3명" },
  { date: 6 },
  { date: 7, count: "5명", dots: ["personal"] },
  { date: 8 },
  { date: 9 },

  { date: 10 },
  { date: 11 },
  { date: 12, count: "2명" },
  { date: 13 },
  { date: 14, count: "4명", dots: ["fixed"] },
  { date: 15 },
  { date: 16 },

  { date: 17 },
  { date: 18 },
  { date: 19, count: "3명" },
  { date: 20, dots: ["personal"] },
  { date: 21, count: "4명", dots: ["fixed"] },
  { date: 22 },
  { date: 23 },

  { date: 24 },
  { date: 25 },
  { date: 26, count: "3명" },
  { date: 27 },
  { date: 28, count: "5명", dots: ["personal", "fixed"] },
  { date: 29 },
  { date: 30 },

  {
    date: 31,
    today: true,
    events: [
      { time: "10:00", label: "박준서·전공수업", type: "fixed" },
      { time: "14:00", label: "정민재·병원예약", type: "personal" },
    ],
    moreCount: 2,
  },
  {
    date: 1,
    muted: true,
    events: [
      { time: "18:00", label: "한서준·알바", type: "fixed" },
      { time: "13:00", label: "오지훈·학회미팅", type: "personal" },
    ],
  },
  {
    date: 2,
    muted: true,
    events: [
      { time: "09:00", label: "김연구·전공수업", type: "fixed" },
      { time: "19:00", label: "정민재·알바", type: "fixed" },
    ],
  },
  {
    date: 3,
    muted: true,
    events: [{ time: "15:00", label: "강태윤·투자자미팅", type: "personal" }],
  },
  {
    date: 4,
    muted: true,
    events: [
      { time: "10:00", label: "오지훈·세미나", type: "fixed" },
      { time: "19:00", label: "김연구·팀회식", type: "personal" },
    ],
  },
  { date: 5, muted: true },
  {
    date: 6,
    muted: true,
    events: [{ time: "14:00", label: "정민재·개인공부", type: "personal" }],
  },
];

export function MonthView() {
  return (
    <div className="grid grid-cols-7 overflow-hidden rounded-panel border border-border bg-bg-panel max-[640px]:grid-cols-[repeat(7,minmax(46px,1fr))] max-[640px]:overflow-x-auto">
      {DOW_LABELS.map((label) => (
        <div
          key={label}
          className="border-b border-border py-2 text-center font-mono text-[10px] text-silk-faint"
        >
          {label}
        </div>
      ))}

      {CELLS.map((cell, i) => (
        <div
          key={i}
          className={`relative min-h-[96px] border-r border-b border-border px-[7px] py-1.5 [&:nth-child(7n)]:border-r-0 ${
            cell.today
              ? "bg-[rgba(72,217,176,0.06)] shadow-[inset_0_2px_0_var(--teal)]"
              : cell.muted
                ? "text-silk-faint"
                : ""
          }`}
        >
          <div className={`text-xs font-semibold ${cell.today ? "text-teal" : ""}`}>{cell.date}</div>

          {cell.count && <div className="mt-1 font-mono text-[9.5px] text-silk-dim">{cell.count}</div>}

          {cell.dots && (
            <div className="mt-1 flex gap-[3px]">
              {cell.dots.map((dot, j) => (
                <i key={j} className={`inline-block h-[5px] w-[5px] rounded-full ${dot === "personal" ? "bg-teal" : "bg-amber"}`} />
              ))}
            </div>
          )}

          {cell.events && (
            <div className="mt-[5px] flex flex-col gap-[3px]">
              {cell.events.map((ev, j) => (
                <div
                  key={j}
                  className={`overflow-hidden text-ellipsis whitespace-nowrap rounded-badge px-[5px] py-0.5 text-[9px] leading-[1.3] border-l-2 ${
                    cell.muted ? "bg-[rgba(231,239,236,0.03)]" : "bg-bg-raised"
                  } ${ev.type === "personal" ? "border-l-teal" : "border-l-amber"}`}
                >
                  {ev.time} {ev.label}
                </div>
              ))}
              {cell.moreCount != null && cell.moreCount > 0 && (
                <div className="px-[5px] py-px font-mono text-[8.5px] text-silk-dim">+{cell.moreCount}개 더보기</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
