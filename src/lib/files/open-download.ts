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
