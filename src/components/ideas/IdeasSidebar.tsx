const TAGS = [
  { name: "GoldenLink", n: 6 },
  { name: "SOC 논문", n: 4 },
  { name: "투자유치", n: 3 },
  { name: "시각화", n: 3 },
  { name: "IDEC", n: 2 },
  { name: "KEPCO", n: 2 },
];

const ACTIVE_ITEMS = [
  { avatar: "민", who: "정민재", action: "님이 댓글을 남겼어요" },
  { avatar: "준", who: "박준서", action: "님이 댓글을 남겼어요" },
  { avatar: "도", who: "최도윤", action: "님이 좋아요를 눌렀어요" },
];

/**
 * playground-design/ideas.html의 <aside> 격 3개 .side-card
 * (이번 주 새 아이디어 / 태그 / 최근 활동). 원본 <script>가 전혀 건드리지
 * 않는 정적 영역이라 Server Component로 유지한다. `.tag-pill`은 hover
 * 스타일만 있고 클릭 리스너가 없어 정적으로 유지한다.
 */
export function IdeasSidebar() {
  return (
    <div>
      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">이번 주 새 아이디어</h4>
        <div className="font-mono text-[30px] font-bold leading-none text-teal">8건</div>
        <div className="mt-1.5 text-[11.5px] text-silk-faint">댓글 14 · 리액션 52</div>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">태그</h4>
        <div className="flex flex-wrap gap-[7px]">
          {TAGS.map((tag) => (
            <span
              key={tag.name}
              className="cursor-pointer rounded-pill border border-border bg-bg-raised px-[11px] py-1.5 font-mono text-[11px] text-silk-dim hover:border-teal-dim hover:text-teal"
            >
              {tag.name}
              <span className="ml-1 text-silk-faint">{tag.n}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">최근 활동</h4>
        {ACTIVE_ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-[9px] border-b border-border py-[7px] last:border-b-0 last:pb-0"
          >
            <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[rgba(72,217,176,0.14)] font-mono text-[9.5px] font-bold text-teal">
              {item.avatar}
            </div>
            <span className="text-[11.5px] text-silk-dim">
              <b className="font-semibold text-silk">{item.who}</b>
              {item.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
