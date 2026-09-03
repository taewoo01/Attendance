import { FileList } from "@/components/files/FileList";
import { FilesSidebar } from "@/components/files/FilesSidebar";
import { FolderGrid } from "@/components/files/FolderGrid";

/**
 * playground-design/files.html에는 <script> 태그가 없어 페이지 전체가
 * 순수 정적 마크업이다(폴더/파일 클릭, 업로드 버튼, breadcrumb 모두 리스너 없음).
 * 그대로 Server Component로 유지한다.
 */
export default function FilesPage() {
  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">자료실</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">자료실</h1>
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
        >
          ⇧ 파일 업로드
        </button>
      </div>

      <div className="mx-auto flex max-w-[1220px] items-center gap-2 px-7 pt-[18px] font-mono text-[12.5px] text-silk-faint">
        <a className="text-teal hover:text-silk">전체 폴더</a>
      </div>

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_280px] items-start gap-[22px] px-7 pt-[18px] pb-[90px] max-[960px]:grid-cols-1">
        <div>
          <p className="m-0 mb-3 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">프로젝트 폴더</p>
          <FolderGrid />

          <p className="m-0 mb-3 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">최근 업로드된 파일</p>
          <FileList />
        </div>
        <FilesSidebar />
      </div>
    </>
  );
}
