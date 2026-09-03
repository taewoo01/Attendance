/**
 * playground-design/index.html의 .console-wrap/.console-window(team_status.log) 정적 위젯.
 * 상호작용이 전혀 없어 Server Component로 유지한다.
 */
export function ConsoleLog() {
  return (
    <section className="mx-auto mb-10 max-w-[1220px] px-7">
      <div className="border border-border bg-bg-panel">
        <div className="flex items-center gap-2 border-b border-border px-[14px] py-[10px]">
          <span className="h-[9px] w-[9px] rounded-full bg-silk-faint" />
          <span className="h-[9px] w-[9px] rounded-full bg-silk-faint" />
          <span className="h-[9px] w-[9px] rounded-full bg-teal" />
          <span className="ml-1.5 font-mono text-[11.5px] text-silk-dim">team_status.log</span>
        </div>
        <div className="px-[22px] pt-[18px] pb-5 font-mono text-[13.5px]">
          <p className="m-0 mb-2.5 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>attendance --today &nbsp;→{" "}
            <span className="text-teal">5 / 8명 체크인</span>
          </p>
          <p className="m-0 mb-2.5 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>results --this-week &nbsp;→{" "}
            <span className="text-teal">4건 등록</span>
          </p>
          <p className="m-0 mb-2.5 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>ideas --unread &nbsp;→{" "}
            <span className="text-amber">3개 신규</span>
          </p>
          <p className="m-0 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>meeting --next &nbsp;→{" "}
            <span className="text-teal">화요일 15:00, 302호</span>
          </p>
        </div>
      </div>
    </section>
  );
}
