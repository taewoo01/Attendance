"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * playground-design/ 9개 파일(공통 statusbar-nav)에서 반복되는 링크 구조.
 * attendance.html은 이 목록과 다르게 "출석·일정" 탭을 자체 active(href="#")로만
 * 표시하고 다른 페이지 nav에는 등장하지 않는다 — docs/ARCHITECTURE.md / DESIGN-SYSTEM.md에
 * 기록된 대로 원본 자체의 예외이며, 여기서는 9개 페이지 공통 구조만 재현한다.
 */
const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/schedule", label: "일정" },
  { href: "/results", label: "실적" },
  { href: "/daily", label: "데일리" },
  { href: "/ideas", label: "아이디어" },
  { href: "/meetings", label: "회의록" },
  { href: "/files", label: "자료실" },
  { href: "/about", label: "회사소개" },
  { href: "/team", label: "팀소개" },
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="hidden gap-4 min-[960px]:flex">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "text-teal" : "hover:text-silk"}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
