import Link from "next/link";
import { FileList, type FileEntry } from "@/components/files/FileList";
import { FilesPagination } from "@/components/files/FilesPagination";
import { FileSortSelect, type FileSortOrder } from "@/components/files/FileSortSelect";
import { FileTypeFilter } from "@/components/files/FileTypeFilter";
import { FilesSidebar, type RecentFileItem } from "@/components/files/FilesSidebar";
import { FolderGrid, type Folder } from "@/components/files/FolderGrid";
import { UploadButton } from "@/components/files/UploadButton";
import { TableRealtimeRefresh } from "@/components/realtime/TableRealtimeRefresh";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listFiles, listFolders } from "@/lib/db/files";
import { fileKindOf, formatBytes, formatRelative, formatShortDate } from "@/lib/files/format";
import { extensionOf } from "@/lib/files/upload-shared";

// TASK-029: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

// 저장 용량 상한이 어디에도 정의돼 있지 않아(FilesSidebar.tsx 주석 참고) 퍼센트
// 계산용으로 임시로 둔 기준값이다 — 실제 정책이 정해지면 바꿔야 한다.
const ASSUMED_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;

// 파일이 계속 쌓이면 목록이 끝없이 길어지는 문제(무한 스크롤)를 막기 위한 페이지당 개수.
const PAGE_SIZE = 20;

export default async function FilesPage({ searchParams }: PageProps<"/files">) {
  const [{ folder: folderParam, type: typeParam, page: pageParam, sort: sortParam }, user, rows, allFolders] = await Promise.all([
    searchParams,
    getCurrentUser(),
    listFiles(),
    listFolders(),
  ]);
  const selectedFolder = (Array.isArray(folderParam) ? folderParam[0] : folderParam)?.trim() || null;
  const now = new Date();

  const folderRows = selectedFolder ? rows.filter((row) => row.folder === selectedFolder) : rows;

  // 현재 폴더 범위 안에서 실제로 존재하는 확장자만 필터 옵션으로 보여준다.
  const availableTypes = Array.from(new Set(folderRows.map((row) => extensionOf(row.name)).filter(Boolean))).sort();

  const rawType = (Array.isArray(typeParam) ? typeParam[0] : typeParam)?.trim().toLowerCase() || null;
  const selectedType = rawType && availableTypes.includes(rawType) ? rawType : null;

  const typeFilteredRows = selectedType ? folderRows.filter((row) => extensionOf(row.name) === selectedType) : folderRows;

  // listFiles()가 이미 uploadedAt 내림차순(최신순)으로 조회해두므로, 오래된순은
  // 뒤집기만 하면 된다.
  const rawSort = (Array.isArray(sortParam) ? sortParam[0] : sortParam)?.trim().toLowerCase();
  const sortOrder: FileSortOrder = rawSort === "oldest" ? "oldest" : "newest";
  const visibleRows = sortOrder === "oldest" ? [...typeFilteredRows].reverse() : typeFilteredRows;

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / PAGE_SIZE));
  const rawPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;
  const page = Math.min(Math.max(1, rawPage), totalPages);
  const pagedRows = visibleRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fileEntries: FileEntry[] = pagedRows.map((row) => ({
    id: row.id,
    type: fileKindOf(row.name),
    name: row.name,
    uploader: `${row.uploaderName ?? ""} 업로드`,
    size: formatBytes(row.sizeBytes),
    date: formatShortDate(row.uploadedAt),
    isOwner: row.userId === user?.id,
  }));

  // 폴더 목록은 folders 테이블(빈 폴더 포함)을 기준으로 하고, 파일 개수/용량만
  // files.folder 태그를 집계해 덧붙인다.
  const folderMap = new Map<string, { id: string | null; userId: string | null; count: number; bytes: number }>();
  for (const folder of allFolders) {
    folderMap.set(folder.name, { id: folder.id, userId: folder.userId, count: 0, bytes: 0 });
  }
  for (const row of rows) {
    if (!row.folder) continue;
    const agg = folderMap.get(row.folder) ?? { id: null, userId: null, count: 0, bytes: 0 };
    agg.count += 1;
    agg.bytes += row.sizeBytes;
    folderMap.set(row.folder, agg);
  }
  // 파일 많은(자주 쓰는) 폴더가 앞쪽에 오도록 정렬한다 — FolderGrid가 폴더 수가
  // 많을 때 앞 6개만 기본으로 보여주므로, 접혀 있어도 자주 쓰는 폴더는 항상 보인다.
  const folders: Folder[] = Array.from(folderMap, ([name, agg]) => ({ name, ...agg }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .map((agg) => ({
      id: agg.id,
      name: agg.name,
      meta: `파일 ${agg.count}개 · ${formatBytes(agg.bytes)}`,
      isOwner: agg.userId === user?.id,
    }));

  const totalBytes = rows.reduce((sum, row) => sum + row.sizeBytes, 0);
  const usagePercent = Math.min(100, Math.round((totalBytes / ASSUMED_QUOTA_BYTES) * 100));

  const recentItems: RecentFileItem[] = rows.slice(0, 3).map((row) => ({
    kind: fileKindOf(row.name),
    name: row.name,
    meta: `${row.uploaderName ?? ""} · ${formatRelative(row.uploadedAt, now)}`,
  }));

  return (
    <>
      <TableRealtimeRefresh channel="files-changes" tables={["files"]} />
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">자료실</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">자료실</h1>
        </div>
        <UploadButton
          key={selectedFolder ?? "all"}
          folders={folders.map((f) => f.name)}
          defaultFolder={selectedFolder ?? undefined}
        />
      </div>

      <div className="mx-auto flex max-w-[1220px] items-center gap-3 px-7 pt-[18px] font-mono text-[12.5px] text-silk-faint">
        {selectedFolder && (
          <Link
            href="/files"
            className="flex items-center gap-1 rounded-button border border-border px-2.5 py-1 text-silk-dim hover:border-teal-dim hover:text-silk"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3 w-3 stroke-current">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </Link>
        )}
        {selectedFolder ? (
          <>
            <Link href="/files" className="hover:text-silk">
              전체 폴더
            </Link>
            <span>/</span>
            <span className="text-teal">{selectedFolder}</span>
          </>
        ) : (
          <a className="text-teal hover:text-silk">전체 폴더</a>
        )}
      </div>

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_280px] items-start gap-[22px] px-7 pt-[18px] pb-[90px] max-[960px]:grid-cols-1">
        <div>
          {!selectedFolder && (
            <>
              <p className="m-0 mb-3 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">프로젝트 폴더</p>
              <FolderGrid folders={folders} />
            </>
          )}

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">
              {selectedFolder ? `${selectedFolder} 폴더 파일` : "최근 업로드된 파일"}
            </p>
            <div className="flex items-center gap-2">
              <FileTypeFilter
                folder={selectedFolder}
                availableTypes={availableTypes}
                selectedType={selectedType}
                sort={sortOrder === "oldest" ? sortOrder : null}
              />
              <FileSortSelect folder={selectedFolder} type={selectedType} sort={sortOrder} />
            </div>
          </div>
          <FileList
            files={fileEntries}
            title={selectedFolder ?? undefined}
            totalCount={visibleRows.length}
            footer={
              <FilesPagination
                page={page}
                totalPages={totalPages}
                folder={selectedFolder}
                type={selectedType}
                sort={sortOrder === "oldest" ? sortOrder : null}
              />
            }
          />
        </div>
        <FilesSidebar
          usageLabel={formatBytes(totalBytes)}
          usagePercent={usagePercent}
          recentItems={recentItems}
        />
      </div>
    </>
  );
}
