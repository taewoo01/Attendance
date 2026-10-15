"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * playground-design/ 9개 파일(공통 statusbar-nav)에서 반복되는 링크 구조.
 * attendance.html은 이 목록과 다르게 "출석·일정" 탭을 자체 active(href="#")로만
 * 표시하고 다른 페이지 nav에는 등장하지 않는다 — docs/ARCHITECTURE.md / DESIGN-SYSTEM.md에
 * 기록된 대로 원본 자체의 예외이며, 여기서는 9개 페이지 공통 구조만 재현한다.
 * 1200px 이상에서는 왼쪽 사이드바의 세로 메뉴로 보이고, 1200px 미만에서는 이
 * 컴포넌트가 통째로 숨고 MobileNavToggle의 드롭다운이 대신 같은 NAV_ITEMS를
 * 보여준다(링크 목록을 두 군데서 따로 관리하지 않도록 export).
 */
export const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/schedule", label: "일정" },
  { href: "/results", label: "실적" },
  { href: "/projects", label: "프로젝트" },
  { href: "/ideas", label: "아이디어" },
  { href: "/meetings", label: "회의록" },
  { href: "/files", label: "자료실" },
  { href: "/about", label: "회사소개" },
  { href: "/team", label: "팀소개" },
] as const;

/** 하위 메뉴 항목. id는 해당 페이지가 쿼리스트링으로 받는 값(폴더 이름, 프로젝트 id)이다. */
export type SubMenuItem = { id: string; label: string };

/**
 * 펼침 하위 메뉴를 가진 항목별 설정. param은 그 페이지가 선택 항목을 받는 쿼리 키,
 * defaultToFirst는 쿼리가 없을 때 페이지가 첫 항목을 보여주는지(프로젝트 페이지가
 * 그렇다) — 강조 표시를 페이지 동작과 맞추기 위한 값이다.
 */
const SUB_MENUS: Record<string, { param: string; emptyLabel: string; defaultToFirst: boolean }> = {
  "/files": { param: "folder", emptyLabel: "폴더가 없습니다.", defaultToFirst: false },
  "/projects": { param: "project", emptyLabel: "프로젝트가 없습니다.", defaultToFirst: true },
};

/** 현재 선택된 항목(?param=)을 강조하려고 useSearchParams를 쓴다. */
function SubMenuList({ href, items }: { href: string; items: SubMenuItem[] }) {
  const { param, emptyLabel, defaultToFirst } = SUB_MENUS[href];
  const requested = useSearchParams().get(param);
  const selected = items.some((item) => item.id === requested)
    ? requested
    : defaultToFirst
      ? (items[0]?.id ?? null)
      : null;

  if (items.length === 0) {
    return <p className="m-0 px-3 py-1.5 pl-6 text-[11.5px] text-silk-faint">{emptyLabel}</p>;
  }

  return (
    <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${href}?${param}=${encodeURIComponent(item.id)}`}
          title={item.label}
          className={`truncate rounded-button px-3 py-1.5 text-[12.5px] ${
            selected === item.id ? "bg-teal-dim text-teal" : "text-silk-dim hover:bg-bg-raised hover:text-silk"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function Navigation({ subMenus = {} }: { subMenus?: Record<string, SubMenuItem[]> }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav className="hidden flex-1 flex-col gap-1 overflow-y-auto min-[1200px]:flex">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const linkClass = `rounded-button px-3 py-2 text-[13px] font-medium ${
          isActive ? "bg-teal-dim text-teal" : "text-silk-dim hover:bg-bg-raised hover:text-silk"
        }`;

        const items = subMenus[item.href];
        if (!items || !SUB_MENUS[item.href]) {
          return (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          );
        }

        // 해당 페이지 안에 있을 때만 하위 메뉴를 펼친다 — 다른 페이지로 가면 자동으로 접힌다.
        const open = isActive && !collapsed[item.href];
        return (
          <div key={item.href} className="flex flex-col gap-0.5">
            <div className="flex items-stretch gap-1">
              <Link href={item.href} className={`flex-1 ${linkClass}`}>
                {item.label}
              </Link>
              <button
                type="button"
                onClick={() => setCollapsed((prev) => ({ ...prev, [item.href]: !prev[item.href] }))}
                aria-label={open ? `${item.label} 목록 접기` : `${item.label} 목록 펼치기`}
                aria-expanded={open}
                className="flex w-7 shrink-0 cursor-pointer items-center justify-center rounded-button border-none bg-transparent text-silk-faint hover:bg-bg-raised hover:text-silk"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={2}
                  className={`h-3.5 w-3.5 stroke-current transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
            {open && <SubMenuList href={item.href} items={items} />}
          </div>
        );
      })}
    </nav>
  );
}
