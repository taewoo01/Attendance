"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { completeOwnProfile } from "@/lib/auth/profile";
import styles from "@/components/login/LoginScreen.module.css";

/**
 * 초대 수락(최초 비밀번호 설정) / 비밀번호 재설정 공통 폼.
 * src/app/auth/confirm에서 verifyOtp()로 이미 세션이 만들어진 상태를 전제로,
 * 그 세션 기준으로 updateUser({ password })만 호출한다.
 * 로그인 관련 온보딩 gap: 초대 수락 흐름엔 이름/역할/이메일을 받는 곳이 전혀
 * 없어서 profiles가 항상 빈 문자열로 남았다 — `needsName`(page.tsx가
 * profiles.name 존재 여부로 판단)이 true일 때만(=최초 비밀번호 설정, 초대 수락)
 * 이 칸들을 같이 보여주고, 비밀번호 저장 성공 후 completeOwnProfile을 호출한다.
 * 기존 사용자의 단순 비밀번호 재설정(recovery)은 이미 이름이 있으니 needsName이
 * false라 이 칸들이 안 보인다. "이메일"은 초대받은 계정의 Supabase Auth 이메일
 * (`defaultEmail`)을 기본값으로 채워두되 수정 가능하게 둔다.
 */
export function SetPasswordForm({ needsName, defaultEmail }: { needsName: boolean; defaultEmail?: string }) {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = nameRef.current?.value ?? "";
    const password = passwordRef.current?.value ?? "";
    const confirm = confirmRef.current?.value ?? "";

    if (needsName && !name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError(null);
    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setPending(false);
      setError("비밀번호 설정에 실패했습니다. 링크가 만료되었을 수 있습니다.");
      return;
    }

    if (needsName) {
      const profileResult = await completeOwnProfile({
        name,
        role: roleRef.current?.value ?? "",
        contact: contactRef.current?.value ?? "",
      });
      setPending(false);
      if (profileResult.error) {
        setError(profileResult.error);
        return;
      }
    } else {
      setPending(false);
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.cardKicker}>EDCL AI솔루션 팀 전용</p>
      <h1 className={styles.cardTitle}>비밀번호 설정</h1>

      <form onSubmit={handleSubmit}>
        {needsName && (
          <>
            <div className={styles.field}>
              <label htmlFor="name">이름</label>
              <div className={styles.fieldInput}>
                <input ref={nameRef} type="text" id="name" placeholder="이름을 입력해 주세요" />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="role">역할 (선택)</label>
              <div className={styles.fieldInput}>
                <input ref={roleRef} type="text" id="role" placeholder="예: AI Solution 팀" />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="contact">이메일 (선택)</label>
              <div className={styles.fieldInput}>
                <input
                  ref={contactRef}
                  type="email"
                  id="contact"
                  defaultValue={defaultEmail}
                  placeholder="you@edcl.team"
                />
              </div>
            </div>
          </>
        )}
        <div className={styles.field}>
          <label htmlFor="new-password">새 비밀번호</label>
          <div className={styles.fieldInput}>
            <input ref={passwordRef} type="password" id="new-password" placeholder="••••••••" />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="confirm-password">비밀번호 확인</label>
          <div className={styles.fieldInput}>
            <input ref={confirmRef} type="password" id="confirm-password" placeholder="••••••••" />
          </div>
        </div>

        {error && <p className={styles.loginError}>{error}</p>}

        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={pending}>
          {pending ? "저장 중..." : "비밀번호 설정"}
        </button>
      </form>
    </div>
  );
}
