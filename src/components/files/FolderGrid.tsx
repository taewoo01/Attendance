type Folder = { name: string; meta: string; isNew?: boolean };

const FOLDERS: Folder[] = [
  { name: "GoldenLink", meta: "파일 14개 · 82MB" },
  { name: "KEPCO 과제", meta: "파일 9개 · 41MB" },
  { name: "SOC 논문", meta: "파일 6개 · 18MB" },
  { name: "IDEC 2026", meta: "파일 5개 · 27MB" },
  { name: "협업 플랫폼", meta: "파일 3개 · 6MB" },
  { name: "새 폴더", meta: "폴더 만들기", isNew: true },
];

/**
 * playground-design/files.html의 .folder-grid.
 * files.html에는 <script> 자체가 없어 .folder-card 클릭 리스너가 존재하지
 * 않으므로(hover border-color transition만 있음) 정적 Server Component로 유지한다.
 */
export function FolderGrid() {
  return (
    <div className="mb-7 grid grid-cols-3 gap-[14px] max-[700px]:grid-cols-2">
      {FOLDERS.map((folder) => (
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
