/**
 * DownloadButton/AchievementFileLink/IdeaFileLink가 공유하는 "signed URL 발급 후
 * 보기" 동작. signed URL을 새 탭에 바로 열면 1) html/svg는 Storage 도메인에서
 * 첨부된 스크립트가 실행될 수 있고(stored XSS) 2) 브라우저가 직접 렌더링하지
 * 못하는 포맷(워드/엑셀/한글 등)은 사이트 밖에서 바로 다운로드가 시작돼버려 "보기"가
 * 아니라 "다운로드"처럼 동작한다. 그래서 확장자와 무관하게 항상 /preview(사이트 내
 * 뷰어, getPreviewKind()로 포맷별 렌더링 방식을 분기)로 보낸다.
 */
export function openDownloadUrl(url: string, name: string) {
  const preview = `/preview?u=${encodeURIComponent(url)}&n=${encodeURIComponent(name)}`;
  window.open(preview, "_blank", "noopener,noreferrer");
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
