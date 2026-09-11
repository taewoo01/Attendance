"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { updateTeamProfile } from "@/lib/team/actions";

type EditProfileButtonProps = {
  defaultName: string;
  defaultRole: string;
  defaultContact: string;
  defaultSpecialty: string;
  defaultAvatarUrl: string | null;
};

/**
 * 팀소개 페이지 수정: "+ 프로필 편집" 버튼이 장식만 있고 아무 동작도 하지
 * 않았다 — 본인 카드(이름/역할/연락처/전공분야/사진)를 직접 수정할 수 있게
 * 한다. CompleteProfileModal은 "이름을 아직 안 채운 최초 진입"을 강제로 막는
 * 용도(닫기 불가, 사진/전공분야 입력칸 없음)라 이 버튼용으로는 맞지 않아
 * 별도의, 언제나 닫을 수 있는 모달로 만든다.
 * 사진 미리보기: 선택 즉시(업로드 전) 화면에서 바로 보이도록 로컬
 * URL.createObjectURL을 쓴다 — 다른 페이지의 다중 첨부파일 폼들은 파일명만
 * 나열하고 미리보기가 없었는데, 프로필 사진은 "이게 맞게 보이는지" 확인이
 * 중요해 새로 추가한 패턴이다. 모달을 닫거나 교체할 때 revoke해서 누수를 막는다.
 */
export function EditProfileButton({
  defaultName,
  defaultRole,
  defaultContact,
  defaultSpecialty,
  defaultAvatarUrl,
}: EditProfileButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPending(true);
    setError(null);

    const result = await updateTeamProfile(formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  const shownAvatar = previewUrl ?? defaultAvatarUrl;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
      >
        + 프로필 편집
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-[420px] rounded-card border border-border bg-bg-panel">
            <div className="flex items-start justify-between gap-3 border-b border-border px-[22px] py-[18px]">
              <div>
                <h3 className="m-0 text-[14.5px] font-semibold">프로필 편집</h3>
                <p className="m-0 mt-1.5 text-[12.5px] text-silk-dim">팀소개 카드에 표시될 정보를 수정합니다.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="max-h-[70vh] overflow-y-auto px-[22px] pt-5 pb-[22px]">
                <div className="mb-[18px] flex flex-col items-center gap-2.5">
                  {shownAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- 로컬 blob URL/짧은 수명 signed URL이라 next/image 대상이 아니다.
                    <img
                      src={shownAvatar}
                      alt=""
                      className="h-20 w-20 rounded-full object-cover shadow-[0_8px_20px_rgba(72,217,176,0.25)]"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] font-mono text-2xl font-bold text-[#04231b]">
                      {(defaultName.trim().charAt(0) || "?").toUpperCase()}
                    </div>
                  )}
                  <label
                    htmlFor="profileAvatarInput"
                    className="cursor-pointer rounded-button border border-border bg-bg-raised px-3 py-1.5 text-[11.5px] text-silk-dim hover:border-teal-dim hover:text-silk"
                  >
                    사진 변경
                  </label>
                  <input
                    id="profileAvatarInput"
                    name="avatar"
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

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
                    placeholder="예: BMS · 연구"
                    className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                  />
                </div>

                <div className="mb-[14px]">
                  <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">이메일 (선택)</p>
                  <input
                    name="contact"
                    type="email"
                    defaultValue={defaultContact}
                    placeholder="you@edcl.team"
                    className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                  />
                </div>

                <div>
                  <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">
                    전공/세부 분야 (선택)
                  </p>
                  <input
                    name="specialty"
                    type="text"
                    defaultValue={defaultSpecialty}
                    placeholder="예: 배터리 상태추정, 강화학습"
                    className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                  />
                </div>

                {error && <p className="m-0 mt-[14px] font-mono text-[11px] text-[#e2543f]">{error}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border px-[22px] py-[14px]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk-dim"
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
      )}
    </>
  );
}
