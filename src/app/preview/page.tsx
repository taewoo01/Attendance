import { Suspense } from "react";
import { HtmlPreviewViewer } from "@/components/files/HtmlPreviewViewer";

/** DownloadButton 등이 html/htm 첨부파일을 열 때 새 탭으로 보내는 sandbox iframe 뷰어 페이지. */
export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <HtmlPreviewViewer />
    </Suspense>
  );
}
