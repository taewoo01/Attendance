"use client";

import { useState } from "react";
import { confirmAuthToken } from "@/lib/auth/confirm";

const TITLE: Record<string, string> = {
  invite: "계정 활성화",
  recovery: "비밀번호 재설정",
};

const DESCRIPTION: Record<string, string> = {
  invite: "아래 버튼을 눌러야 초대가 실제로 확인됩니다 (메일 보안 검사가 링크를 미리 열어보는 것을 막기 위함입니다).",
  recovery: "아래 버튼을 눌러 비밀번호 재설정을 계속하세요.",
};

/**
 * 메일에 있는 링크는 GET으로 여기(이 페이지)까지만 데려온다. 실제 verifyOtp()는
 * 사람이 이 버튼을 눌러야만(form POST/Server Action) 실행된다 — src/lib/auth/confirm.ts 참고.
 */
export function ConfirmAccountForm({ tokenHash, type }: { tokenHash: string; type: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    const result = await confirmAuthToken(tokenHash, type);
    // 성공하면 confirmAuthToken 내부의 redirect()가 던져서 여기 도달하지 않는다.
    setPending(false);
    if (result?.error) setError(result.error);
  }

  const title = TITLE[type] ?? "계정 확인";
  const description = DESCRIPTION[type] ?? "아래 버튼을 눌러 계속하세요.";

  return (
    <div className="w-full max-w-[380px] rounded-card border border-border bg-bg-panel px-[26px] py-[30px] text-center">
      <p className="m-0 mb-1.5 font-mono text-[11px] tracking-[0.14em] text-silk-faint">EDCL AI솔루션 팀 전용</p>
      <h1 className="m-0 mb-3 text-[20px] font-semibold text-silk">{title}</h1>
      <p className="m-0 mb-6 text-[13px] leading-[1.6] text-silk-dim">{description}</p>

      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-button border border-teal bg-teal px-5 py-[13px] text-[13.5px] font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "확인 중..." : title}
      </button>

      {error && <p className="m-0 mt-4 text-[12.5px] text-[#e2543f]">{error}</p>}
    </div>
  );
}
