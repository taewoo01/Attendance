type FileType = "pdf" | "doc" | "sheet" | "img";

type FileEntry = {
  type: FileType;
  name: string;
  uploader: string;
  size: string;
  date: string;
};

const FILES: FileEntry[] = [
  { type: "sheet", name: "SOH_실험결과_v3.xlsx", uploader: "김연구 업로드", size: "2.4MB", date: "8/29" },
  { type: "pdf", name: "KEPCO_중간보고서_초안.pdf", uploader: "강태윤 업로드", size: "5.1MB", date: "8/28" },
  { type: "img", name: "색상식별기_회로도_v2.png", uploader: "박준서 업로드", size: "890KB", date: "8/27" },
  { type: "doc", name: "SOC_논문_초안_v2.docx", uploader: "이하늘 업로드", size: "1.2MB", date: "8/27" },
  {
    type: "doc",
    name: "창업팀_협업플랫폼_요구사항정의서_v0.2.docx",
    uploader: "정민재 업로드",
    size: "340KB",
    date: "8/25",
  },
  { type: "pdf", name: "GoldenLink_예선발표자료.pdf", uploader: "오지훈 업로드", size: "8.7MB", date: "8/24" },
];

// playground-design/files.html의 .file-icon.pdf/.doc/.sheet/.img stroke 색상 그대로.
const TYPE_COLOR: Record<FileType, string> = {
  pdf: "stroke-[#e2543f]",
  doc: "stroke-[#4a9eff]",
  sheet: "stroke-teal",
  img: "stroke-amber",
};

function FileIcon({ type }: { type: FileType }) {
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
 * <script>가 없어 .file-dl 다운로드 버튼에 클릭 리스너가 없으므로 정적으로 유지한다.
 * 원본 .file-dl svg에는 stroke 속성이 CSS 어디에도 선언되어 있지 않아(기본값 stroke:none)
 * 다운로드 아이콘이 실제로는 보이지 않는 원본 상태를 그대로 재현한다(색상 클래스 추가 금지).
 */
export function FileList() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h3 className="m-0 text-[14.5px] font-semibold">전체 파일</h3>
        <span className="font-mono text-[11.5px] text-silk-faint">37개</span>
      </div>

      {FILES.map((file, i) => (
        <div
          key={i}
          className="grid grid-cols-[36px_1fr_90px_130px_80px] items-center gap-[14px] border-b border-border px-[22px] py-[13px] last:border-b-0 hover:bg-[rgba(231,239,236,0.02)] max-[640px]:grid-cols-[30px_1fr_60px]"
        >
          <FileIcon type={file.type} />
          <div>
            <div className="text-[13px] font-medium text-silk">{file.name}</div>
            <div className="mt-px text-[11.5px] text-silk-faint">{file.uploader}</div>
          </div>
          <div className="font-mono text-[11.5px] text-silk-dim max-[640px]:hidden">{file.size}</div>
          <div className="font-mono text-[11.5px] text-silk-faint max-[640px]:hidden">{file.date}</div>
          <button
            type="button"
            className="ml-auto flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-chip border border-border bg-transparent text-silk-dim hover:border-teal-dim hover:text-teal"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[14px] w-[14px]">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
