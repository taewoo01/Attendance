import { Suspense } from "react";
import { HtmlPreviewViewer } from "@/components/files/HtmlPreviewViewer";

/** DownloadButton 등이 "보기"를 누르면 항상 보내는 사이트 내 미리보기 페이지. */
export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <HtmlPreviewViewer />
    </Suspense>
  );
}
