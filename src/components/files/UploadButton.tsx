"use client";

import { useState, type ChangeEvent } from "react";
import { uploadFile } from "@/lib/files/actions";

/**
 * playground-design/files.html의 "⇧ 파일 업로드" 버튼(원본은 리스너 없는 정적 버튼).
 * TASK-029: 실제 업로드 기능을 추가하기 위해 숨김 `<input type="file">`을 트리거하는
 * label로 바꿨다(RegisterResultModal.tsx의 첨부파일 라벨과 동일한 기존 패턴 재사용).
 * 버튼의 시각적 스타일(border/bg/padding/폰트)은 원본 그대로 유지한다.
 */
export function UploadButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadFile(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <label
        htmlFor="fileUploadInput"
        className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b] aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
        aria-disabled={pending}
      >
        {pending ? "업로드 중..." : "⇧ 파일 업로드"}
      </label>
      <input id="fileUploadInput" type="file" className="hidden" disabled={pending} onChange={handleChange} />
      {error && <span className="font-mono text-[11px] text-[#e2543f]">{error}</span>}
    </div>
  );
}
