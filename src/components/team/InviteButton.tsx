"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { inviteTeamMember } from "@/lib/auth/invite";

/**
 * 팀소개 페이지 헤더: can_invite=true인 사용자에게만 보이는 초대 버튼.
 * 기존에는 /invite를 직접 URL로 찾아 들어가야만 초대할 수 있었다 — 그 경로 대신
 * 여기서 바로 이메일을 입력해 inviteTeamMember Server Action을 호출한다.
 * 권한 재검사는 Server Action 쪽(src/lib/auth/invite.ts)에서 그대로 하므로,
 * 이 컴포넌트가 canInvite=false인 사용자에게 실수로 렌더링돼도 서버에서 막힌다.
 */
export function InviteButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setError(null);
    setSuccess(false);

    const result = await inviteTeamMember({}, formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    form.reset();
    router.refresh();
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setSuccess(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-bg-raised px-4 py-2.5 text-[13px] font-semibold text-silk hover:border-teal-dim"
      >
        + 팀원 초대
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="w-full max-w-[420px] rounded-card border border-border bg-bg-panel">
            <div className="flex items-start justify-between gap-3 border-b border-border px-[22px] py-[18px]">
              <div>
                <h3 className="m-0 text-[14.5px] font-semibold">팀원 초대</h3>
                <p className="m-0 mt-1.5 text-[12.5px] text-silk-dim">
                  초대할 팀원의 이메일로 가입 링크를 보냅니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="닫기"
                className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-[22px] pt-5 pb-[22px]">
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">이메일</p>
                <input
                  name="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="teammate@edcl.team"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />

                {error && <p className="m-0 mt-[14px] font-mono text-[11px] text-[#e2543f]">{error}</p>}
                {success && (
                  <p className="m-0 mt-[14px] font-mono text-[11px] text-teal">초대 메일을 보냈습니다.</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border px-[22px] py-[14px]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex cursor-pointer items-center justify-center rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk-dim"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "전송 중..." : "초대 보내기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
