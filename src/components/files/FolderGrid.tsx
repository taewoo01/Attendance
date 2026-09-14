import { DeleteFolderButton } from "@/components/files/DeleteFolderButton";
import { NewFolderCard } from "@/components/files/NewFolderCard";

/** id가 없으면(파일의 folder 태그에만 존재하고 실제 folders 행이 없는 경우) 삭제 버튼을 보여줄 수 없다. */
export type Folder = { id: string | null; name: string; meta: string; isOwner: boolean };

type FolderGridProps = {
  folders: Folder[];
};

/**
 * playground-design/files.html의 .folder-grid.
 * TASK-029: 하드코딩 5개 폴더 대신 page.tsx가 실제 folders 테이블 + files의
 * folder 컬럼 집계 결과를 props로 받는다. "새 폴더" 카드는 원본에서 클릭
 * 리스너가 없는 장식이었으나 NewFolderCard(Client Component)로 교체해 실제
 * 폴더 생성 기능을 연결했다 — 그 외 폴더 카드는 클릭 동작이 없는 원본 상태를 유지한다.
 * 본인이 만든 폴더에는 DeleteFolderButton을 우상단에 얹는다.
 */
export function FolderGrid({ folders }: FolderGridProps) {
  return (
    <div className="mb-7 grid grid-cols-3 gap-[14px] max-[700px]:grid-cols-2">
      {folders.map((folder) => (
        <div
          key={folder.name}
          className="relative rounded-panel border border-border bg-bg-panel px-4 pt-4 pb-[14px] transition-colors duration-150 hover:border-teal-dim"
        >
          {folder.id && folder.isOwner && <DeleteFolderButton folderId={folder.id} />}
          <div className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-teal-dim">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[17px] w-[17px] stroke-teal">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="mb-[3px] pr-6 text-[13.5px] font-semibold text-silk">{folder.name}</div>
          <div className="font-mono text-[10.5px] text-silk-faint">{folder.meta}</div>
        </div>
      ))}
      <NewFolderCard />
    </div>
  );
}
