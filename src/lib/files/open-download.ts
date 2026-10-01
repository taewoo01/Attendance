export type PreviewSibling = { id: string; name: string };

const PREVIEW_LIST_KEY = "filePreview:list";
const PREVIEW_INDEX_KEY = "filePreview:index";

/**
 * DownloadButton/AchievementFileLink/IdeaFileLink가 공유하는 "signed URL 발급 후
 * 보기" 동작. signed URL을 새 탭에 바로 열면 1) html/svg는 Storage 도메인에서
 * 첨부된 스크립트가 실행될 수 있고(stored XSS) 2) 브라우저가 직접 렌더링하지
 * 못하는 포맷(워드/엑셀/한글 등)은 사이트 밖에서 바로 다운로드가 시작돼버려 "보기"가
 * 아니라 "다운로드"처럼 동작한다. 그래서 확장자와 무관하게 항상 /preview(사이트 내
 * 뷰어, getPreviewKind()로 포맷별 렌더링 방식을 분기)로 보낸다.
 *
 * `nav`가 있으면(FileList — 같은 목록의 형제 파일 id/name) /preview에서 이전/다음
 * 버튼으로 넘겨볼 수 있게 localStorage에 목록을 같이 넘긴다. 쿼리스트링에 넣으면
 * 파일이 많을 때 URL 길이 제한에 걸릴 수 있어 localStorage를 쓴다 — 단, `window.open`을
 * noopener로 띄우면 새 탭이 opener의 메모리를 공유하지 못해(sessionStorage는 탭별로
 * 분리) localStorage(출처 단위로 공유)를 쓴다. 클릭 직후 바로 새 탭이 열려 값을
 * 읽어가므로, 거의 동시에 다른 파일을 또 열지 않는 한 충돌하지 않는다.
 */
export function openDownloadUrl(url: string, name: string, nav?: { list: PreviewSibling[]; index: number }) {
  if (nav && nav.list.length > 1) {
    try {
      localStorage.setItem(PREVIEW_LIST_KEY, JSON.stringify(nav.list));
      localStorage.setItem(PREVIEW_INDEX_KEY, String(nav.index));
    } catch {
      // localStorage 사용 불가(프라이빗 모드 등) — 단일 파일 미리보기로 degrade.
    }
  }
  const preview = `/preview?u=${encodeURIComponent(url)}&n=${encodeURIComponent(name)}`;
  window.open(preview, "_blank", "noopener,noreferrer");
}

/**
 * HtmlPreviewViewer가 마운트 시 읽는 헬퍼. `currentName`이 localStorage에 저장된
 * 목록의 해당 인덱스 항목과 일치할 때만 유효한 목록으로 취급한다 — 불일치하면
 * (다른 파일을 연 사이에 덮어써졌거나 /preview를 직접 새로고침한 경우) 이전/다음
 * 버튼 없이 단일 파일 미리보기로 조용히 degrade한다.
 */
export function readPreviewNav(currentName: string): { list: PreviewSibling[]; index: number } | null {
  try {
    const rawList = localStorage.getItem(PREVIEW_LIST_KEY);
    const rawIndex = localStorage.getItem(PREVIEW_INDEX_KEY);
    if (!rawList || rawIndex === null) return null;

    const list = JSON.parse(rawList) as PreviewSibling[];
    const index = Number(rawIndex);
    if (!Array.isArray(list) || !Number.isInteger(index) || !list[index]) return null;
    if (list[index].name !== currentName) return null;

    return { list, index };
  } catch {
    return null;
  }
}

/**
 * "다운로드" 전용 버튼이 쓰는 헬퍼. url은 서버에서 이미 Content-Disposition:
 * attachment로 발급받은 signed URL(getFileDownloadUrl(id, true) 등)이어야 한다 —
 * 새 탭을 띄우는 대신 임시 <a download> 클릭으로 바로 저장 대화상자를 띄운다.
 */
export function triggerFileDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
