/**
 * playground-design/ 공통 `.user-chip` 구조를 그대로 옮김.
 * 실제 인증/세션 데이터는 연결하지 않고, 표시할 이름/이니셜만 props로 받는다.
 * 기본값은 원본 mockup(김연구/연)과 동일하게 두어 시각적으로 동일하게 렌더링되게 한다.
 */
type UserChipProps = {
  name?: string;
  initial?: string;
};

export function UserChip({ name = "김연구", initial = "연" }: UserChipProps) {
  return (
    <div className="flex cursor-pointer items-center gap-2 font-medium text-silk">
      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] text-[11px] font-bold text-[#04231b]">
        {initial}
      </span>
      {name}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={2}
        className="-ml-0.5 stroke-silk-faint"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
