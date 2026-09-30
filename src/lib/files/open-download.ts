import { isHtmlExtension } from "@/lib/files/upload-shared";

/**
 * DownloadButton/AchievementFileLink/IdeaFileLink가 공유하는 "signed URL 발급 후
 * 열기" 동작. html/htm 첨부는 그대로 새 탭에 열면 Storage 도메인에서 첨부된
 * 스크립트가 실행될 수 있어(stored XSS) /preview(sandbox iframe 뷰어)로 보내고,
 * 그 외 확장자는 기존처럼 signed URL을 새 탭에서 바로 연다.
 */
export function openDownloadUrl(url: string, name: string) {
  if (isHtmlExtension(name)) {
    const preview = `/preview?u=${encodeURIComponent(url)}&n=${encodeURIComponent(name)}`;
    window.open(preview, "_blank", "noopener,noreferrer");
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
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
