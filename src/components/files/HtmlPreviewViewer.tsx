"use client";

import { useSearchParams } from "next/navigation";

/**
 * html/htm 첨부파일 뷰어(/preview). signed URL을 그대로 새 탭에 열면 Storage
 * 도메인에서 첨부된 스크립트가 실행될 수 있어(stored XSS), 여기서는 sandbox
 * 속성에 아무 권한도 주지 않은(스크립트/폼 제출/팝업 전부 차단) iframe에 넣어
 * 화면만 그대로 보여준다. u는 NEXT_PUBLIC_SUPABASE_URL(Storage) origin의
 * 서명 URL일 때만 허용한다 — 다른 origin을 열어보는 용도로 쓰이지 않게.
 */
export function HtmlPreviewViewer() {
  const params = useSearchParams();
  const url = params.get("u") ?? "";
  const name = params.get("n") || "미리보기";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let isAllowed = false;
  try {
    isAllowed = Boolean(url) && Boolean(supabaseUrl) && new URL(url).origin === new URL(supabaseUrl).origin;
  } catch {
    isAllowed = false;
  }

  if (!isAllowed) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg text-[13px] text-silk-faint">
        미리보기 링크가 유효하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <div className="truncate border-b border-border px-4 py-2.5 text-[12.5px] text-silk-dim">{name}</div>
      <iframe src={url} title={name} sandbox="" className="flex-1 border-0 bg-white" />
    </div>
  );
}
