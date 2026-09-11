"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { updateIdea } from "@/lib/ideas/actions";
import type { Idea } from "@/components/ideas/IdeaCard";

/**
 * IdeaCard의 "수정" 버튼으로 여는 모달. IdeaComposer와 같은 필드(제목(선택)/
 * 내용/태그/링크/첨부파일)를 프리필해서 보여준다. 작성자 본인이 아니면 IdeaCard가
 * 이 버튼 자체를 렌더링하지 않는다 — Server Action(updateIdea)도 소유자 WHERE절로
 * 다시 막는다(defense-in-depth).
 * 첨부파일은 EditResultModal(src/components/results/EditResultModal.tsx)과 동일한
 * 패턴으로 "기존 파일 제거"와 "새 파일 추가"를 함께 다룬다.
 */
export function EditIdeaModal({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>(idea.links.length > 0 ? idea.links : [""]);
  const [existingFiles, setExistingFiles] = useState(idea.files);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  function addLink() {
    setLinks((prev) => [...prev, ""]);
  }

  function updateLink(index: number, value: string) {
    setLinks((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function removeLink(index: number) {
    setLinks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
  }

  function removeExistingFile(id: string) {
    setExistingFiles((prev) => prev.filter((f) => f.id !== id));
    setRemovedFileIds((prev) => [...prev, id]);
  }

  function addNewFiles(picked: File[]) {
    if (picked.length === 0) return;
    setNewFiles((prev) => [...prev, ...picked]);
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);

    const formData = new FormData(form);
    for (const file of newFiles) {
      formData.append("files", file);
    }

    const result = await updateIdea(idea.id, formData);

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
          <h3 className="m-0 text-[14.5px] font-semibold">아이디어 수정</h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {removedFileIds.map((id) => (
            <input key={id} type="hidden" name="removeFileIds" value={id} />
          ))}

          <div className="px-[22px] pt-5 pb-[22px]">
            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">제목 (선택)</p>
              <input
                name="title"
                type="text"
                defaultValue={idea.title}
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">내용</p>
              <textarea
                name="body"
                required
                defaultValue={idea.body}
                className="min-h-[96px] w-full resize-y rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">태그 (쉼표로 구분, 선택)</p>
              <input
                name="tags"
                type="text"
                defaultValue={idea.tags.join(", ")}
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
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        aria-label="링크 칸 제거"
                        className="shrink-0 cursor-pointer border-none bg-transparent px-1 text-lg leading-none text-silk-faint hover:text-[#e2543f]"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">첨부파일 (선택)</p>
              {existingFiles.length > 0 && (
                <ul className="m-0 mb-2 flex list-none flex-col gap-1.5 p-0">
                  {existingFiles.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between gap-2 rounded-input border border-border bg-bg-raised px-[12px] py-[7px] text-[12px] text-silk"
                    >
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(file.id)}
                        aria-label="첨부파일 제거"
                        className="shrink-0 cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f]"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label
                htmlFor="ideaEditFileInput"
                className="inline-flex cursor-pointer items-center gap-[7px] rounded-button border border-dashed border-border bg-bg-raised px-[13px] py-[9px] text-[12.5px] text-silk-dim hover:border-teal-dim hover:text-silk"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[13px] w-[13px] stroke-silk-faint">
                  <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                <span>파일 추가 (여러 개 가능)</span>
              </label>
              <input
                type="file"
                id="ideaEditFileInput"
                multiple
                className="hidden"
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  addNewFiles(picked);
                }}
              />
              {newFiles.length > 0 && (
                <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
                  {newFiles.map((file, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-input border border-border bg-bg-raised px-[12px] py-[7px] text-[12px] text-silk"
                    >
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
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
              {pending ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
