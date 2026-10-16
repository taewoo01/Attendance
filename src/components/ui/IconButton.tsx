import type { ReactNode } from "react";

/**
 * playground-design/ 공통 `.icon-btn` 구조를 그대로 옮긴 wrapper.
 * 아이콘 SVG는 children으로 그대로 전달받아 마크업/속성을 변경하지 않는다.
 * 크기(16px)·색상(stroke)은 원본처럼 부모 선택자 방식으로 적용한다.
 */
type IconButtonProps = {
  children: ReactNode;
  badge?: ReactNode;
  /** 있으면 사이드바 폭(1200px 이상)에서 아이콘 옆에 라벨을 붙인 넓은 버튼으로 보인다. 그 미만은 아이콘만. */
  label?: string;
  "aria-label"?: string;
  onClick?: () => void;
};

export function IconButton({ children, badge, label, onClick, ...rest }: IconButtonProps) {
  return (
    <div
      className={`group relative flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-button border border-border [&_svg]:h-4 [&_svg]:w-4 [&_svg]:stroke-silk-dim hover:border-teal-dim hover:[&_svg]:stroke-silk ${
        label ? "min-[1200px]:w-full min-[1200px]:justify-start min-[1200px]:gap-2.5 min-[1200px]:px-3" : ""
      }`}
      onClick={onClick}
      {...rest}
    >
      {children}
      {label && (
        <span className="hidden text-[13px] font-medium text-silk-dim group-hover:text-silk min-[1200px]:inline">
          {label}
        </span>
      )}
      {badge != null && (
        <span className="absolute -top-[5px] -right-[5px] flex h-[15px] w-[15px] items-center justify-center rounded-full border-[1.5px] border-bg bg-[#e2543f] text-[9.5px] font-bold text-white">
          {badge}
        </span>
      )}
    </div>
  );
}
