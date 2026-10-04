"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getFileDownloadUrl } from "@/lib/files/actions";
import { readPreviewNav, type PreviewSibling } from "@/lib/files/open-download";
import { getPreviewKind } from "@/lib/files/upload-shared";

/**
 * DownloadButton 등이 "보기"를 누르면 항상 거치는 /preview 사이트 내 뷰어.
 * u는 NEXT_PUBLIC_SUPABASE_URL(Storage) origin의 서명 URL일 때만 허용한다 —
 * 다른 origin을 열어보는 용도로 쓰이지 않게.
 *
 * getPreviewKind(n)에 따라 렌더링 방식이 갈린다:
 * - sandboxed(html/htm/svg): iframe의 src에 signed URL을 바로 물리면 두 가지 문제가
 *   있다. 1) Supabase Storage가 보안상 Content-Type을 text/plain 등으로 내려버려서
 *   브라우저가 코드 그대로(파싱하지 않고) 보여준다. 2) 설령 원래 Content-Type으로
 *   내려오더라도 signed URL로 직접 이동하면 Storage 도메인에서 첨부된 스크립트가
 *   실행될 수 있다(stored XSS, svg도 <script>를 심을 수 있어 동일). 그래서 내용을
 *   fetch로 텍스트로 받아 iframe의 srcDoc에 넣는다 — srcDoc은 항상 HTML(SVG 루트
 *   태그 포함)로 파싱되고(1번 해결), sandbox 속성에 아무 권한도 주지 않아(스크립트/
 *   폼 제출/팝업 전부 차단) 스크립트는 실행되지 않는다(2번 해결).
 * - pdf/image/video: 브라우저가 직접 렌더링할 수 있어 signed URL을 iframe/img/video의
 *   src에 그대로 건다.
 * - text(txt/csv): fetch한 내용을 <pre>에 그대로 넣는다 — HTML로 파싱되지 않고
 *   React가 이스케이프하므로 스크립트 실행 위험이 없다.
 * - unsupported(office 문서/hwp/zip 등): 브라우저가 열 수 없는 포맷 — 여기서 바로
 *   열면 원본 파일명 없이 다운로드가 시작돼버리니, 목록의 다운로드 버튼을 쓰라는
 *   안내만 보여준다.
 *
 * FileList에서 열었다면(여러 파일이 있는 목록) readPreviewNav가 localStorage에서
 * 형제 파일 id/name 목록을 읽어와 이전/다음 버튼을 보여준다 — 클릭(또는 ←/→ 키)
 * 시 getFileDownloadUrl로 그 파일의 새 signed URL을 발급받아 같은 탭에서 바로
 * 바꿔 보여준다(새 탭을 또 열지 않는다).
 */
export function HtmlPreviewViewer() {
  const params = useSearchParams();
  const initialUrl = params.get("u") ?? "";
  const initialName = params.get("n") || "미리보기";

  const [url, setUrl] = useState(initialUrl);
  const [name, setName] = useState(initialName);
  // lazy initializer로 마운트 시 한 번만 localStorage를 읽는다(SSR에서는
  // readPreviewNav 내부 try/catch가 ReferenceError를 삼켜 null을 돌려준다).
  const [nav, setNav] = useState<{ list: PreviewSibling[]; index: number } | null>(() =>
    readPreviewNav(initialName),
  );
  const [navPending, setNavPending] = useState(false);

  const kind = getPreviewKind(name);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let isAllowed = false;
  try {
    isAllowed = Boolean(url) && Boolean(supabaseUrl) && new URL(url).origin === new URL(supabaseUrl).origin;
  } catch {
    isAllowed = false;
  }

  const needsFetch = kind === "sandboxed" || kind === "text";
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isAllowed || !needsFetch) return;
    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.text();
      })
      .then((t) => {
        if (!cancelled) setText(t);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isAllowed, needsFetch, url]);

  const goTo = useCallback(
    async (step: 1 | -1) => {
      if (!nav || navPending) return;
      const nextIndex = nav.index + step;
      const target = nav.list[nextIndex];
      if (!target) return;

      setNavPending(true);
      const result = await getFileDownloadUrl(target.id);
      setNavPending(false);
      if (!result.url) return;

      setNav({ list: nav.list, index: nextIndex });
      setText(null);
      setError(false);
      setUrl(result.url);
      setName(target.name);
    },
    [nav, navPending],
  );

  useEffect(() => {
    if (!nav) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav, goTo]);

  if (!isAllowed) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg text-[13px] text-silk-faint">
        미리보기 링크가 유효하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        {nav && (
          <button
            type="button"
            onClick={() => goTo(-1)}
            disabled={navPending || nav.index === 0}
            aria-label="이전 파일"
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-chip border border-border bg-transparent text-silk-dim hover:border-teal-dim hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3 w-3 stroke-current">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="min-w-0 flex-1 truncate text-[12.5px] text-silk-dim">{name}</div>
        {nav && (
          <>
            <span className="shrink-0 font-mono text-[11px] text-silk-faint">
              {nav.index + 1} / {nav.list.length}
            </span>
            <button
              type="button"
              onClick={() => goTo(1)}
              disabled={navPending || nav.index === nav.list.length - 1}
              aria-label="다음 파일"
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-chip border border-border bg-transparent text-silk-dim hover:border-teal-dim hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3 w-3 stroke-current">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {error ? (
        <div className="flex flex-1 items-center justify-center text-[13px] text-silk-faint">
          파일을 불러오지 못했습니다. 링크가 만료됐을 수 있어요 — 다시 시도해 주세요.
        </div>
      ) : (
        <>
          {kind === "sandboxed" &&
            (text === null ? (
              <div className="flex flex-1 items-center justify-center text-[13px] text-silk-faint">
                불러오는 중...
              </div>
            ) : (
              <iframe sandbox="" srcDoc={text} title={name} className="flex-1 border-0 bg-white" />
            ))}
          {kind === "pdf" && <iframe src={url} title={name} className="flex-1 border-0 bg-white" />}
          {kind === "image" && (
            <div className="flex flex-1 items-center justify-center overflow-auto bg-[#1a1a1a] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- presigned Storage URL, next/image 최적화 대상이 아니다 */}
              <img src={url} alt={name} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          {kind === "video" && (
            <div className="flex flex-1 items-center justify-center overflow-auto bg-[#1a1a1a] p-4">
              <video src={url} controls className="max-h-full max-w-full" />
            </div>
          )}
          {kind === "text" &&
            (text === null ? (
              <div className="flex flex-1 items-center justify-center text-[13px] text-silk-faint">
                불러오는 중...
              </div>
            ) : (
              <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 text-[12.5px] text-silk">
                {text}
              </pre>
            ))}
          {kind === "unsupported" && (
            <div className="flex flex-1 items-center justify-center text-center text-[13px] text-silk-faint">
              이 파일 형식은 사이트 내 미리보기를 지원하지 않습니다.
              <br />
              목록의 다운로드 버튼을 이용해 주세요.
            </div>
          )}
        </>
      )}
    </div>
  );
}
