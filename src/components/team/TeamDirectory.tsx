"use client";

import { useMemo, useState } from "react";
import { FilterRow } from "@/components/team/FilterRow";
import { TeamGrid } from "@/components/team/TeamGrid";

type TeamMember = {
  userId: string;
  name: string;
  role: string;
  contact: string;
  specialty: string;
  avatarUrl: string | null;
};

const ALL = "전체";

/**
 * 팀소개 페이지 수정: FilterRow가 team-grid를 실제로 필터링하지 않던 것을
 * (TASK-022 당시 주석) 고쳤다. playground-design/team.html은 BMS/Firmware/Data/PM을
 * 하드코딩했지만 profiles.role은 자유 텍스트라 실제 존재하지 않는 카테고리를
 * 칩으로 보여주면 가짜 데이터가 된다 — 대신 각 멤버의 role에서 "BMS · 연구"처럼
 * " · "로 구분된 앞부분(구분자가 없으면 role 전체, role이 비어있으면 미분류로
 * "전체"에서만 집계)을 카테고리로 파생해 실제 존재하는 값만 칩으로 만든다.
 */
export function TeamDirectory({ members, currentUserId }: { members: TeamMember[]; currentUserId?: string }) {
  const [active, setActive] = useState(ALL);

  const categoryOf = (role: string) => role.split("·")[0]?.trim() ?? "";

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const member of members) {
      const category = categoryOf(member.role);
      if (!category) continue;
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return [
      { label: ALL, count: members.length },
      ...Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, count]) => ({ label, count })),
    ];
  }, [members]);

  const filtered = active === ALL ? members : members.filter((member) => categoryOf(member.role) === active);

  return (
    <>
      <FilterRow categories={categories} active={active} onSelect={setActive} />
      <TeamGrid members={filtered} currentUserId={currentUserId} />
    </>
  );
}
