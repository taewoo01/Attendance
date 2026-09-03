/**
 * playground-design/about.html의 .share-chip("외부 공유 링크").
 * about.html에는 <script>가 없어 클릭 리스너가 없으므로 정적 div로 유지한다.
 * StatusBar에서 pathname === "/about"일 때만 렌더링된다.
 */
export function ShareChip() {
  return (
    <div className="flex cursor-pointer items-center gap-[7px] rounded-pill border border-teal-dim bg-teal-dim px-[13px] py-[7px] font-mono text-[11.5px] text-teal">
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3 w-3 stroke-teal">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8" />
      </svg>
      외부 공유 링크
    </div>
  );
}
