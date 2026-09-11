type FilterRowProps = {
  categories: { label: string; count: number }[];
  active: string;
  onSelect: (label: string) => void;
};

/**
 * playground-design/team.html의 .filter-row.
 * TASK-022 당시엔 원본 <script>처럼 active 클래스만 토글하고 실제로 team-grid를
 * 필터링하지 않았다. 이제 TeamDirectory가 실제 필터링 상태를 들고 있고 이
 * 컴포넌트는 그 상태를 보여주기만 하는 presentational 컴포넌트다 — 칩 목록도
 * 하드코딩된 BMS/Firmware/Data/PM 대신 실제 profiles.role 데이터에서 파생한
 * 카테고리만 보여준다(가짜 카테고리 금지).
 */
export function FilterRow({ categories, active, onSelect }: FilterRowProps) {
  return (
    <div className="mx-auto flex max-w-[1220px] flex-wrap gap-2 px-7 pt-5">
      {categories.map(({ label, count }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className={`cursor-pointer rounded-pill border px-[14px] py-2 font-mono text-[11.5px] ${
            active === label
              ? "border-teal-dim bg-teal-dim text-teal"
              : "border-border bg-bg-panel text-silk-dim"
          }`}
        >
          {label} {count}
        </button>
      ))}
    </div>
  );
}
