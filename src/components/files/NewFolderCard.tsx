"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createFolder } from "@/lib/files/actions";

/**
 * FolderGrid의 "새 폴더" 카드. playground-design/files.html 원본에는 클릭 리스너가
 * 없는 장식 카드였다(FolderGrid.tsx 기존 주석 참고) — 클릭 시 이름을 입력받아
 * 실제 폴더(folders 테이블)를 만드는 기능으로 바꾼다.
 */
export function NewFolderCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setName("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.append("name", name);
    const result = await createFolder(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="rounded-panel border border-teal-dim bg-bg-panel px-4 pt-4 pb-[14px]">
        <div className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-teal-dim">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[17px] w-[17px] stroke-teal">
            <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="폴더 이름"
          maxLength={60}
          disabled={pending}
          className="mb-2 w-full rounded-input border border-border bg-bg-raised px-2.5 py-1.5 text-[13px] text-silk outline-none focus:border-teal-dim disabled:cursor-not-allowed"
        />
        {error && <p className="m-0 mb-2 font-mono text-[10.5px] text-[#e2543f]">{error}</p>}
        <div className="flex gap-1.5">
          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="flex-1 cursor-pointer rounded-button border border-teal bg-teal px-2 py-1.5 text-[11.5px] font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "만드는 중..." : "만들기"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="cursor-pointer rounded-button border border-border px-2 py-1.5 text-[11.5px] text-silk-dim disabled:cursor-not-allowed"
          >
            취소
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="cursor-pointer rounded-panel border border-border bg-bg-panel px-4 pt-4 pb-[14px] text-left transition-colors duration-150 hover:border-teal-dim"
    >
      <div className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-teal-dim">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[17px] w-[17px] stroke-teal">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div className="mb-[3px] text-[13.5px] font-semibold text-silk">새 폴더</div>
      <div className="font-mono text-[10.5px] text-silk-faint">폴더 만들기</div>
    </button>
  );
}
