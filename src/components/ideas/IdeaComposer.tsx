"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createIdea } from "@/lib/ideas/actions";

/**
 * playground-design/ideas.html의 .composer(아이디어 작성 박스)는 원래 피드
 * 맨 위에 항상 떠 있는 인라인 입력창이었다 — 아이디어 페이지 상세화: 피드
 * 공간을 차지하는 인라인 박스를 없애고, 헤더의 "+ 아이디어 작성" 버튼으로
 * 여는 모달로 바꿨다(RegisterResultModal/EditIdeaModal과 동일한 모달 셸
 * 패턴). 버튼 자체는 IdeasBoard.tsx가 갖고 있고 이 컴포넌트는 열려 있을
 * 때만 마운트된다(EditIdeaModal과 동일 — open을 prop으로 받지 않고 부모가
 * `composerOpen && <IdeaComposer .../>`로 마운트/언마운트 자체를 제어).
 * 필드(제목(선택)/내용/태그/링크/첨부파일)는 이전 인라인 버전과 동일하다.
 */
export function IdeaComposer({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function addLink() {
    setLinks((prev) => [...prev, ""]);
  }

  function updateLink(index: number, value: string) {
    setLinks((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function addFiles(picked: File[]) {
    if (picked.length === 0) return;
    setFiles((prev) => [...prev, ...picked]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);

    const formData = new FormData(form);
    for (const file of files) {
      formData.append("files", file);
    }

    const result = await createIdea(formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-card border border-border bg-bg-panel">
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
          <h3 className="m-0 text-[14.5px] font-semibold">아이디어 작성</h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-[22px] pt-5 pb-[22px]">
            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">제목 (선택)</p>
              <input
                name="title"
                type="text"
                placeholder="예: 신입생 온보딩 체크리스트 자동화"
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">내용</p>
              <textarea
                name="body"
                required
                rows={5}
                autoFocus
                placeholder="떠오른 아이디어를 자유롭게 적어보세요..."
                className="w-full resize-y rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">태그 (쉼표로 구분, 선택)</p>
              <input
                name="tags"
                type="text"
                placeholder="예: 자동화, 온보딩"
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <div className="mb-2 flex items-center justify-between">
                <p className="m-0 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">링크 (선택)</p>
                <button
                  type="button"
                  onClick={addLink}
                  className="cursor-pointer rounded-button border border-border bg-transparent px-2 py-0.5 text-[13px] leading-none text-silk-dim hover:border-teal-dim hover:text-silk"
                  aria-label="링크 칸 추가"
                >
                  +
                </button>
              </div>
              {links.length > 0 && (
                <div className="flex flex-col gap-2">
                  {links.map((value, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        name="links"
                        type="url"
                        value={value}
                        onChange={(e) => updateLink(i, e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        aria-label="링크 칸 제거"
                        className="shrink-0 cursor-pointer border-none bg-transparent px-1 text-lg leading-none text-silk-faint hover:text-[#e2543f]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">첨부파일 (선택)</p>
              <label
                htmlFor="ideaComposerFileInput"
                className="inline-flex cursor-pointer items-center gap-[7px] rounded-button border border-dashed border-border bg-bg-raised px-[13px] py-[9px] text-[12.5px] text-silk-dim hover:border-teal-dim hover:text-silk"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[13px] w-[13px] stroke-silk-faint">
                  <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                <span>파일 선택 (여러 개 가능)</span>
              </label>
              <input
                type="file"
                id="ideaComposerFileInput"
                multiple
                className="hidden"
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  addFiles(picked);
                }}
              />
              {files.length > 0 && (
                <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
                  {files.map((file, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-input border border-border bg-bg-raised px-[12px] py-[7px] text-[12px] text-silk"
                    >
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        aria-label="첨부파일 제거"
                        className="shrink-0 cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f]"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && <p className="m-0 mt-[14px] font-mono text-[11px] text-[#e2543f]">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-[22px] py-[14px]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "게시 중..." : "게시"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
