import { DownloadButton } from "@/components/files/DownloadButton";
import { type FileKind } from "@/lib/files/format";

export type FileEntry = {
  id: string;
  type: FileKind;
  name: string;
  uploader: string;
  size: string;
  date: string;
};

type FileListProps = {
  files: FileEntry[];
};

// playground-design/files.html의 .file-icon.pdf/.doc/.sheet/.img stroke 색상 그대로.
const TYPE_COLOR: Record<FileKind, string> = {
  pdf: "stroke-[#e2543f]",
  doc: "stroke-[#4a9eff]",
  sheet: "stroke-teal",
  img: "stroke-amber",
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
 */
export function FileList({ files }: FileListProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h3 className="m-0 text-[14.5px] font-semibold">전체 파일</h3>
        <span className="font-mono text-[11.5px] text-silk-faint">{files.length}개</span>
      </div>

      {files.map((file) => (
        <div
          key={file.id}
          className="grid grid-cols-[36px_1fr_90px_130px_80px] items-center gap-[14px] border-b border-border px-[22px] py-[13px] last:border-b-0 hover:bg-[rgba(231,239,236,0.02)] max-[640px]:grid-cols-[30px_1fr_60px]"
        >
          <FileIcon type={file.type} />
          <div>
            <div className="text-[13px] font-medium text-silk">{file.name}</div>
            <div className="mt-px text-[11.5px] text-silk-faint">{file.uploader}</div>
          </div>
          <div className="font-mono text-[11.5px] text-silk-dim max-[640px]:hidden">{file.size}</div>
          <div className="font-mono text-[11.5px] text-silk-faint max-[640px]:hidden">{file.date}</div>
          <DownloadButton fileId={file.id} />
        </div>
      ))}
    </div>
  );
}
