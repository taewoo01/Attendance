"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";

/**
 * playground-design/ 공통 `.user-chip` 구조를 그대로 옮김.
 * 실제 인증 프로필 데이터는 연결하지 않고(TASK-018 범위), 표시할 이름/이니셜만
 * props로 받는다. 기본값은 원본 mockup(김연구/연)과 동일하게 두어 시각적으로
 * 동일하게 렌더링되게 한다.
 * 클릭 시 로그아웃: 원본부터 cursor-pointer + 드롭다운 화살표로 인터랙션을
 * 암시하고 있었으나 실제 핸들러가 없었다(TASK-019 이전). 새 UI를 추가하지
 * 않고 이 기존 인터랙션 지점에 Supabase 로그아웃을 연결한다.
 */
type UserChipProps = {
  name?: string;
  initial?: string;
};

export function UserChip({ name = "김연구", initial = "연" }: UserChipProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className="flex cursor-pointer items-center gap-2 font-medium text-silk"
      onClick={handleSignOut}
    >
      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] text-[11px] font-bold text-[#04231b]">
        {initial}
      </span>
      {name}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={2}
        className="-ml-0.5 stroke-silk-faint"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
