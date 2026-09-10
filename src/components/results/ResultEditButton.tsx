"use client";

import { useState } from "react";
import { EditResultModal, type EditableAchievement } from "@/components/results/EditResultModal";

/**
 * ResultList/실적 상세 페이지에서 ResultDeleteButton과 나란히, 본인 소유 실적일
 * 때만 렌더링되는 수정 버튼(r.userId === currentUserId로 걸러서 넣는다).
 * IdeaCard의 "수정" 버튼 + EditIdeaModal 패턴과 동일 — 이 컴포넌트가 열림 상태를
 * 들고 있다가 클릭 시 EditResultModal을 마운트한다.
 */
export function ResultEditButton({
  achievement,
  members,
}: {
  achievement: EditableAchievement;
  members: { userId: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="실적 수정"
        className="cursor-pointer border-none bg-transparent p-0 font-mono text-[11px] leading-none text-silk-faint hover:text-teal"
      >
        수정
      </button>
      {editing && <EditResultModal achievement={achievement} members={members} onClose={() => setEditing(false)} />}
    </>
  );
}
