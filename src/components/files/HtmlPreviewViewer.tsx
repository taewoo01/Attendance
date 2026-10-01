"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * html/htm/svg 첨부파일 뷰어(/preview). u는 NEXT_PUBLIC_SUPABASE_URL(Storage) origin의
 * 서명 URL일 때만 허용한다 — 다른 origin을 열어보는 용도로 쓰이지 않게.
 * svg도 html과 똑같은 이유로 여기를 거친다 — svg 안에 <script>를 심을 수 있어서
 * signed URL을 그냥 새 탭에 열면 html과 동일한 stored XSS 벡터가 된다.
 *
 * iframe의 src에 signed URL을 바로 물리면 두 가지 문제가 있다:
 * 1) Supabase Storage가 html/svg 오브젝트는 보안상 Content-Type을 text/plain 등으로
 *    내려버려서 브라우저가 코드 그대로(파싱하지 않고) 보여준다.
 * 2) 설령 원래 Content-Type으로 내려오더라도 signed URL로 직접 이동하면 Storage
 *    도메인에서 첨부된 스크립트가 실행될 수 있다(stored XSS).
 * 그래서 내용을 fetch로 텍스트로 받아 iframe의 srcDoc에 넣는다 — srcDoc은 항상
 * HTML(SVG 루트 태그 포함)로 파싱되고(1번 해결), sandbox 속성에 아무 권한도 주지
 * 않아(스크립트/폼 제출/팝업 전부 차단) 스크립트는 실행되지 않는다(2번 해결).
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

  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isAllowed) return;
    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setHtml(text);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isAllowed, url]);

  if (!isAllowed) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg text-[13px] text-silk-faint">
        미리보기 링크가 유효하지 않습니다.
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg text-[13px] text-silk-faint">
        파일을 불러오지 못했습니다. 링크가 만료됐을 수 있어요 — 다시 시도해 주세요.
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <div className="truncate border-b border-border px-4 py-2.5 text-[12.5px] text-silk-dim">{name}</div>
      {html === null ? (
        <div className="flex flex-1 items-center justify-center text-[13px] text-silk-faint">불러오는 중...</div>
      ) : (
        <iframe sandbox="" srcDoc={html} title={name} className="flex-1 border-0 bg-white" />
      )}
    </div>
  );
}
