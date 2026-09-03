import Link from "next/link";

const WEEK_DAYS = [
  { dow: "월", dnum: 25, done: true, today: false },
  { dow: "화", dnum: 26, done: true, today: false },
  { dow: "수", dnum: 27, done: true, today: false },
  { dow: "목", dnum: 28, done: true, today: false },
  { dow: "금", dnum: 29, done: true, today: false },
  { dow: "토", dnum: 30, done: false, today: false },
  { dow: "일", dnum: 31, done: false, today: true },
];

const TEMPLATES = ["실험 진행 템플릿", "논문 작성 템플릿", "회의 준비 템플릿"];

/**
 * playground-design/daily.html의 <aside> 격 3개 카드(이번 주 기록 현황 /
 * 실적 연동 프로모 / 자주 쓰는 체크리스트). 원본 script가 전혀 건드리지
 * 않는 정적 영역이라 Server Component로 유지한다. 템플릿 "+ 추가" 버튼은
 * 원본에 이벤트 리스너가 없어 장식용으로만 유지한다.
 */
export function DailySidebar() {
  return (
    <div>
      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">이번 주 기록 현황</h4>
        <div className="flex justify-between">
          {WEEK_DAYS.map((d) => (
            <div key={d.dow} className="flex flex-col items-center gap-[7px]">
              <span className="font-mono text-[9.5px] text-silk-faint">{d.dow}</span>
              <div
                className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border ${
                  d.done ? "border-teal-dim bg-teal-dim" : d.today ? "border-teal" : "border-border"
                }`}
              >
                {d.done && (
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" className="h-[10px] w-[10px] stroke-teal">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </div>
              <span className="text-[10.5px] text-silk-faint">{d.dnum}</span>
            </div>
          ))}
        </div>
        <div className="mt-[14px] font-mono text-[30px] font-bold leading-none text-teal">5일</div>
        <div className="mt-1.5 text-[11.5px] text-silk-faint">연속 기록 중 · 이번 달 최고 기록 8일</div>
      </div>

      <div className="mb-4 rounded-panel border border-teal-dim bg-[linear-gradient(155deg,rgba(72,217,176,0.1),rgba(72,217,176,0.02))] px-4 pt-4 pb-[15px]">
        <p className="m-0 mb-3 text-xs leading-[1.6] text-silk-dim">
          <b className="text-silk">실적 관리와 연동돼요.</b>
          <br />
          체크리스트를 완료하면 주간·월간 실적 취합에 자동으로 반영할 수 있어요.
        </p>
        <Link
          href="/results"
          className="inline-flex w-full cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-4 py-2.5 text-[13px] font-semibold text-silk"
        >
          실적 관리에서 보기
        </Link>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">자주 쓰는 체크리스트</h4>
        {TEMPLATES.map((title) => (
          <div key={title} className="flex items-center justify-between border-b border-border py-[7px] text-xs last:border-b-0 last:pb-0">
            <span className="text-silk-dim">{title}</span>
            <button type="button" className="cursor-pointer border-none bg-transparent font-mono text-[11px] text-teal">
              + 추가
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
