"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { completeOwnProfile } from "@/lib/auth/profile";

const EMAIL_DISMISS_KEY = "completeProfileEmailDismissed";

/**
 * 로그인 관련 온보딩 gap: Supabase Auth에 아이디/비번을 직접 등록한 계정은
 * 초대 수락(/set-password) 흐름을 거치지 않아 이름/역할/이메일을 입력할 기회가
 * 전혀 없었다 — 로그인은 되지만 profiles.name이 항상 빈 문자열로 남는다.
 * (main)/layout.tsx가 profiles.name 또는 profiles.contact(이메일)가 비어있을
 * 때 이 모달을 띄운다.
 * 이름이 아직 없으면(직접 등록 계정 최초 진입) 배경 클릭/×로 닫을 수 없다 —
 * 이름을 채우기 전엔 서비스를 정상적으로 쓸 수 없다는 뜻이라 강제로 채우게 한다.
 * 반대로 이름은 이미 있는데 이메일만 없는 경우(`defaultName`이 있음)엔 이메일이
 * "선택"이라고 안내해놓고 실제로는 못 닫게 하면 이메일을 비운 채 저장 → 다음
 * 렌더에서 조건이 다시 true가 돼 모달이 무한 재등장하는 lockout이 된다 —
 * 이 경우엔 닫기를 허용하고, 한 번 닫으면 이 브라우저 세션 동안은 다시 안
 * 뜨게 sessionStorage에 남긴다(로그아웃 후 재로그인하면 다시 물어본다).
 */
export function CompleteProfileModal({
  defaultName,
  defaultRole,
  defaultEmail,
}: {
  defaultName?: string;
  defaultRole?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const dismissible = !!defaultName;
  const [dismissed, setDismissed] = useState(
    () => dismissible && typeof window !== "undefined" && sessionStorage.getItem(EMAIL_DISMISS_KEY) === "1",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (!dismissible) return;
    sessionStorage.setItem(EMAIL_DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPending(true);
    setError(null);

    const result = await completeOwnProfile({
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? ""),
      contact: String(formData.get("contact") ?? ""),
    });

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-[420px] rounded-card border border-border bg-bg-panel">
        <div className="flex items-start justify-between gap-3 border-b border-border px-[22px] py-[18px]">
          <div>
            <h3 className="m-0 text-[14.5px] font-semibold">프로필 완성</h3>
            <p className="m-0 mt-1.5 text-[12.5px] text-silk-dim">서비스를 이용하기 전에 기본 정보를 입력해 주세요.</p>
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={handleClose}
              aria-label="닫기"
              className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
            >
              ×
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-[22px] pt-5 pb-[22px]">
            <div className="mb-[14px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">이름</p>
              <input
                name="name"
                type="text"
                required
                autoFocus
                defaultValue={defaultName}
                placeholder="이름을 입력해 주세요"
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[14px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">역할 (선택)</p>
              <input
                name="role"
                type="text"
                defaultValue={defaultRole}
                placeholder="예: AI Solution 팀"
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div>
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">이메일 (선택)</p>
              <input
                name="contact"
                type="email"
                defaultValue={defaultEmail}
                placeholder="you@edcl.team"
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            {error && <p className="m-0 mt-[14px] font-mono text-[11px] text-[#e2543f]">{error}</p>}
          </div>

          <div className="flex items-center justify-end border-t border-border px-[22px] py-[14px]">
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
