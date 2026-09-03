import type { ReactNode } from "react";

/**
 * playground-design/ 공통 `.icon-btn` 구조를 그대로 옮긴 wrapper.
 * 아이콘 SVG는 children으로 그대로 전달받아 마크업/속성을 변경하지 않는다.
 * 크기(16px)·색상(stroke)은 원본처럼 부모 선택자 방식으로 적용한다.
 */
type IconButtonProps = {
  children: ReactNode;
  badge?: ReactNode;
  "aria-label"?: string;
};

export function IconButton({ children, badge, ...rest }: IconButtonProps) {
  return (
    <div
      className="relative flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-button border border-border [&_svg]:h-4 [&_svg]:w-4 [&_svg]:stroke-silk-dim hover:border-teal-dim hover:[&_svg]:stroke-silk"
      {...rest}
    >
      {children}
      {badge != null && (
        <span className="absolute -top-[5px] -right-[5px] flex h-[15px] w-[15px] items-center justify-center rounded-full border-[1.5px] border-bg bg-[#e2543f] text-[9.5px] font-bold text-white">
          {badge}
        </span>
      )}
    </div>
  );
}
