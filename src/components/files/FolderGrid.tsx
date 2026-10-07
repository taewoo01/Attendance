"use client";

import { useState } from "react";
import Link from "next/link";
import { DeleteFolderButton } from "@/components/files/DeleteFolderButton";
import { NewFolderCard } from "@/components/files/NewFolderCard";

/** id가 없으면(파일의 folder 태그에만 존재하고 실제 folders 행이 없는 경우) 삭제 버튼을 보여줄 수 없다. */
export type Folder = { id: string | null; name: string; meta: string; isOwner: boolean };

type FolderGridProps = {
  folders: Folder[];
};

// 폴더를 계속 만들면 3열 그리드가 끝없이 길어지는 문제를 막기 위한 기본 노출 개수(2줄 분량).
const VISIBLE_COUNT = 6;

/**
 * playground-design/files.html의 .folder-grid.
 * TASK-029: 하드코딩 5개 폴더 대신 page.tsx가 실제 folders 테이블 + files의
 * folder 컬럼 집계 결과를 props로 받는다. "새 폴더" 카드는 원본에서 클릭
 * 리스너가 없는 장식이었으나 NewFolderCard(Client Component)로 교체해 실제
 * 폴더 생성 기능을 연결했다 — 그 외 폴더 카드는 클릭 동작이 없는 원본 상태를 유지한다.
 * 본인이 만든 폴더에는 DeleteFolderButton을 우상단에 얹는다.
 * "새 폴더" 카드는 맨 앞(첫 칸)에 고정한다 — 목록 끝에 두면 폴더가 늘어날수록
 * 카드 위치가 뒤로 밀려서 매번 자리를 찾아야 했다.
 * 폴더 카드는 `/files?folder=<이름>`으로 이동하는 Link다 — page.tsx가 이 쿼리로
 * 해당 폴더의 파일만 필터링해서 보여준다.
 * 폴더가 계속 쌓이면 그리드가 끝없이 길어지는 문제(사용자 피드백)를 막기 위해
 * 기본 6개(2줄)만 보여주고 "더보기"로 펼친다 — page.tsx가 파일 많은 폴더를
 * 앞쪽에 정렬해서 넘겨주므로, 접혀 있어도 자주 쓰는 폴더는 항상 보인다.
 */
export function FolderGrid({ folders }: FolderGridProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleFolders = expanded ? folders : folders.slice(0, VISIBLE_COUNT);
  const hiddenCount = folders.length - visibleFolders.length;

  return (
    <div className="mb-7">
      <div className="grid grid-cols-3 gap-[14px] max-[700px]:grid-cols-2">
        <NewFolderCard />
        {visibleFolders.map((folder) => (
          <Link
            key={folder.name}
            href={`/files?folder=${encodeURIComponent(folder.name)}`}
            className="relative block rounded-panel border border-border bg-bg-panel px-4 pt-4 pb-[14px] transition-colors duration-150 hover:border-teal-dim"
          >
            {folder.id && folder.isOwner && <DeleteFolderButton folderId={folder.id} />}
            <div className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-teal-dim">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[17px] w-[17px] stroke-teal">
                <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="mb-[3px] pr-6 text-[13.5px] font-semibold text-silk">{folder.name}</div>
            <div className="font-mono text-[10.5px] text-silk-faint">{folder.meta}</div>
          </Link>
        ))}
      </div>
      {folders.length > VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full cursor-pointer rounded-panel border border-border bg-transparent py-2.5 font-mono text-[11.5px] text-silk-dim hover:border-teal-dim hover:text-silk"
        >
          {expanded ? "접기" : `더보기 (${hiddenCount}개 더 있음)`}
        </button>
      )}
    </div>
  );
}
