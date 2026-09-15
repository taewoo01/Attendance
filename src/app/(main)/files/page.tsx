import Link from "next/link";
import { FileList, type FileEntry } from "@/components/files/FileList";
import { FilesSidebar, type RecentFileItem } from "@/components/files/FilesSidebar";
import { FolderGrid, type Folder } from "@/components/files/FolderGrid";
import { UploadButton } from "@/components/files/UploadButton";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listFiles, listFolders } from "@/lib/db/files";
import { fileKindOf, formatBytes, formatRelative, formatShortDate } from "@/lib/files/format";

// TASK-029: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

// 저장 용량 상한이 어디에도 정의돼 있지 않아(FilesSidebar.tsx 주석 참고) 퍼센트
// 계산용으로 임시로 둔 기준값이다 — 실제 정책이 정해지면 바꿔야 한다.
const ASSUMED_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;

export default async function FilesPage({ searchParams }: PageProps<"/files">) {
  const [{ folder: folderParam }, user, rows, allFolders] = await Promise.all([
    searchParams,
    getCurrentUser(),
    listFiles(),
    listFolders(),
  ]);
  const selectedFolder = (Array.isArray(folderParam) ? folderParam[0] : folderParam)?.trim() || null;
  const now = new Date();

  const visibleRows = selectedFolder ? rows.filter((row) => row.folder === selectedFolder) : rows;
  const fileEntries: FileEntry[] = visibleRows.map((row) => ({
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
  const folders: Folder[] = Array.from(folderMap, ([name, agg]) => ({
    id: agg.id,
    name,
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
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">자료실</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">자료실</h1>
        </div>
        <UploadButton folders={folders.map((f) => f.name)} defaultFolder={selectedFolder ?? undefined} />
      </div>

      <div className="mx-auto flex max-w-[1220px] items-center gap-2 px-7 pt-[18px] font-mono text-[12.5px] text-silk-faint">
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

          <p className="m-0 mb-3 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">
            {selectedFolder ? `${selectedFolder} 폴더 파일` : "최근 업로드된 파일"}
          </p>
          <FileList files={fileEntries} title={selectedFolder ?? undefined} />
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
