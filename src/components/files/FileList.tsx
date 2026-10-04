"use client";

import { useState, type ReactNode } from "react";
import { DeleteFileButton } from "@/components/files/DeleteFileButton";
import { DownloadButton } from "@/components/files/DownloadButton";
import { getFileDownloadUrl } from "@/lib/files/actions";
import { type FileKind } from "@/lib/files/format";
import { triggerFileDownload } from "@/lib/files/open-download";

export type FileEntry = {
  id: string;
  type: FileKind;
  name: string;
  uploader: string;
  size: string;
  date: string;
  /** 로그인한 본인이 올린 파일인지 — true일 때만 삭제 버튼을 보여준다. */
  isOwner: boolean;
};

type FileListProps = {
  files: FileEntry[];
  /** 폴더 필터링 중일 때 page.tsx가 폴더명을 넘긴다. 기본값은 "전체 파일". */
  title?: string;
  /** 페이지네이션으로 `files`가 현재 페이지 항목만 담을 때, 뱃지에 표시할 전체 개수. 기본값은 files.length. */
  totalCount?: number;
  /** 목록 카드 하단에 그릴 페이지네이션 등 부가 요소. */
  footer?: ReactNode;
};

// playground-design/files.html의 .file-icon.pdf/.doc/.sheet/.img stroke 색상 그대로.
// video는 mp4 지원 추가로 생긴 5번째 분류라 원본에 없던 색을 새로 골랐다.
const TYPE_COLOR: Record<FileKind, string> = {
  pdf: "stroke-[#e2543f]",
  doc: "stroke-[#4a9eff]",
  sheet: "stroke-teal",
  img: "stroke-amber",
  video: "stroke-[#b48cff]",
};

function FileIcon({ type }: { type: FileKind }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-button border border-border bg-bg-raised">
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className={`h-[15px] w-[15px] ${TYPE_COLOR[type]}`}>
        {type === "img" ? (
          <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </>
        ) : type === "video" ? (
          <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M10 9.5v5l4.5-2.5z" />
          </>
        ) : type === "pdf" ? (
          <>
            <path d="M4 4h11l5 5v11H4z" />
            <path d="M15 4v5h5" />
          </>
        ) : (
          <>
            <path d="M4 4h11l5 5v11H4z" />
            <path d="M15 4v5h5M8 13h8M8 17h5" />
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * playground-design/files.html의 .list-card("전체 파일").
 * TASK-029: 하드코딩 6건 대신 page.tsx가 실제 files 테이블을 조회한 결과를
 * props로 받는다. `.file-dl` 다운로드 버튼은 `DownloadButton`(Client
 * Component)으로 교체해 실제 presigned URL 발급 기능을 연결했다.
 * 여러 파일을 한 번에 다운로드할 수 있어야 해서("use client"로 전환) 행마다
 * 체크박스를 두고, 선택된 항목은 getFileDownloadUrl(forceDownload)을 순차로
 * 호출해 하나씩 저장 대화상자를 띄운다 — zip으로 묶지 않고 순차 다운로드인
 * 이유는 서버에 압축 라이브러리를 새로 추가하지 않기 위해서다(최소 dependency
 * 원칙). 브라우저가 여러 다운로드를 자동으로 막는 경우 사용자가 한 번 허용하면
 * 이후부터는 그대로 진행된다.
 */
export function FileList({ files, title = "전체 파일", totalCount, footer }: FileListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);

  const siblings = files.map((f) => ({ id: f.id, name: f.name }));
  const allSelected = files.length > 0 && selected.size === files.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(files.map((f) => f.id)));
  }

  async function handleBulkDownload() {
    setBulkPending(true);
    for (const id of selected) {
      const result = await getFileDownloadUrl(id, true);
      if (result.url) {
        triggerFileDownload(result.url);
        // 브라우저가 "여러 파일 동시 다운로드"로 한꺼번에 막아버리지 않도록
        // 다운로드 사이에 짧은 간격을 둔다.
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }
    setBulkPending(false);
    setSelected(new Set());
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-[22px] py-[18px]">
        <div className="flex items-center gap-3">
          <h3 className="m-0 text-[14.5px] font-semibold">{title}</h3>
          {files.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="cursor-pointer border-none bg-transparent p-0 font-mono text-[11px] text-silk-faint hover:text-teal"
            >
              {allSelected ? "전체 해제" : "전체 선택"}
            </button>
          )}
        </div>
        {selected.size > 0 ? (
          <button
            type="button"
            onClick={handleBulkDownload}
            disabled={bulkPending}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-button border border-teal bg-teal px-3 py-1.5 text-[11.5px] font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bulkPending ? "다운로드 중..." : `선택한 ${selected.size}개 다운로드`}
          </button>
        ) : (
          <span className="font-mono text-[11.5px] text-silk-faint">{totalCount ?? files.length}개</span>
        )}
      </div>

      {files.map((file, index) => (
        <div
          key={file.id}
          className="grid grid-cols-[18px_36px_1fr_90px_130px_116px] items-center gap-[14px] border-b border-border px-[22px] py-[13px] last:border-b-0 hover:bg-[rgba(231,239,236,0.02)] max-[640px]:grid-cols-[18px_30px_1fr_104px]"
        >
          <input
            type="checkbox"
            checked={selected.has(file.id)}
            onChange={() => toggle(file.id)}
            aria-label={`${file.name} 선택`}
            className="h-[15px] w-[15px] cursor-pointer accent-teal"
          />
          <FileIcon type={file.type} />
          <div>
            <div className="text-[13px] font-medium text-silk">{file.name}</div>
            <div className="mt-px text-[11.5px] text-silk-faint">{file.uploader}</div>
          </div>
          <div className="font-mono text-[11.5px] text-silk-dim max-[640px]:hidden">{file.size}</div>
          <div className="font-mono text-[11.5px] text-silk-faint max-[640px]:hidden">{file.date}</div>
          <div className="ml-auto flex items-center gap-1.5">
            <DownloadButton fileId={file.id} name={file.name} siblings={siblings} index={index} />
            {file.isOwner && <DeleteFileButton fileId={file.id} />}
          </div>
        </div>
      ))}
      {footer}
    </div>
  );
}
