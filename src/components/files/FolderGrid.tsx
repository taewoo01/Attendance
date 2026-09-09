export type Folder = { name: string; meta: string; isNew?: boolean };

const NEW_FOLDER_CARD: Folder = { name: "새 폴더", meta: "폴더 만들기", isNew: true };

type FolderGridProps = {
  folders: Folder[];
};

/**
 * playground-design/files.html의 .folder-grid.
 * files.html에는 <script> 자체가 없어 .folder-card 클릭 리스너가 존재하지
 * 않으므로(hover border-color transition만 있음) 정적 Server Component로 유지한다.
 * TASK-029: 하드코딩 5개 폴더 대신 page.tsx가 실제 files의 folder 컬럼을 집계한
 * 결과를 props로 받는다. 업로드 시 폴더를 지정하는 UI가 아직 없어(폴더 생성
 * 기능 자체도 미구현) 실제로는 항상 빈 목록이다 — "새 폴더" 카드만 원본처럼
 * 장식용으로 고정 표시한다.
 */
export function FolderGrid({ folders }: FolderGridProps) {
  return (
    <div className="mb-7 grid grid-cols-3 gap-[14px] max-[700px]:grid-cols-2">
      {[...folders, NEW_FOLDER_CARD].map((folder) => (
        <div
          key={folder.name}
          className="cursor-pointer rounded-panel border border-border bg-bg-panel px-4 pt-4 pb-[14px] transition-colors duration-150 hover:border-teal-dim"
        >
          <div className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-teal-dim">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[17px] w-[17px] stroke-teal">
              {folder.isNew ? (
                <path d="M12 5v14M5 12h14" />
              ) : (
                <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              )}
            </svg>
          </div>
          <div className="mb-[3px] text-[13.5px] font-semibold text-silk">{folder.name}</div>
          <div className="font-mono text-[10.5px] text-silk-faint">{folder.meta}</div>
        </div>
      ))}
    </div>
  );
}
