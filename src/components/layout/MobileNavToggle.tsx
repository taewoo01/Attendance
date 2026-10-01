"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NAV_ITEMS } from "@/components/layout/Navigation";

/**
 * Navigation이 숨는 960px 미만 구간 전용 햄버거 버튼 + 드롭다운.
 * 막대 3개를 각각 transition으로 움직여 X로 접는 방식(사용자가 준 CSS transition
 * 예시와 같은 아이디어) 그대로 쓰되, 원본 코드는 막대 1개가 120x20px인 데모용
 * 수치라 24px 아이콘엔 그대로 못 옮긴다 — 대신 위/아래 막대를 가운데(막대 2 자리)로
 * translateY 이동시키면서 ±45deg 회전시켜 만나게 하는 방식으로 같은 효과를
 * 아이콘 크기에 맞게 재구성했다. 가운데 막대는 원본처럼 scale로 사라진다.
 *
 * open/onOpenChange를 StatusBarControls가 소유한다(controlled) — 모바일 상단바의
 * 녹음 배지를 탭해도 이 드로워를 열어야 해서, 열림 상태를 이 컴포넌트 혼자
 * 갖고 있으면 배지 쪽에서 제어할 방법이 없다. children은 드로워 안 nav 링크
 * 아래에 추가로 넣을 내용(녹음/프로필/로그아웃 행)이다.
 */
export function MobileNavToggle({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-[960px]:hidden">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-none bg-transparent p-0"
      >
        <span className="relative h-[18px] w-5">
          <span
            className={`absolute left-0 top-0 h-[2px] w-5 rounded-full bg-silk transition-transform duration-300 ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-2 h-[2px] w-5 rounded-full bg-silk transition-[opacity,scale] duration-300 ${
              open ? "scale-x-0 opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-4 h-[2px] w-5 rounded-full bg-silk transition-transform duration-300 ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {/* 배경 오버레이 — 바깥을 탭하면 닫힌다. */}
      <div
        className={`fixed inset-0 z-[90] bg-[rgba(4,10,8,0.65)] transition-opacity duration-150 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* 링크 드롭다운 — Navigation과 동일한 NAV_ITEMS를 세로로 보여준다. */}
      <div
        className={`fixed inset-x-0 top-0 z-[95] max-h-dvh overflow-y-auto border-b border-border bg-bg-panel px-7 pt-[76px] pb-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] transition-[opacity,translate] duration-200 ease-out ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-button px-3 py-2.5 text-sm font-medium ${
                  isActive ? "bg-teal-dim text-teal" : "text-silk-dim hover:bg-bg-raised hover:text-silk"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {children && <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3">{children}</div>}
      </div>
    </div>
  );
}
