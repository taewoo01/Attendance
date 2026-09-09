"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";
import { IconButton } from "@/components/ui/IconButton";

/**
 * UserChip에서 분리된 로그아웃 인터랙션. 원래 UserChip 클릭 시 signOut()을
 * 호출하던 로직(TASK-019)을 그대로 이 아이콘 버튼으로 옮겼다.
 */
export function LogoutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <IconButton aria-label="로그아웃" onClick={handleSignOut}>
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
        <path d="M9 21H6a2 2 0 01-2-2V5a2 2 0 012-2h3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </IconButton>
  );
}
