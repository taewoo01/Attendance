"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import styles from "@/components/login/LoginScreen.module.css";

/**
 * 초대 수락(최초 비밀번호 설정) / 비밀번호 재설정 공통 폼.
 * src/app/auth/confirm에서 verifyOtp()로 이미 세션이 만들어진 상태를 전제로,
 * 그 세션 기준으로 updateUser({ password })만 호출한다.
 */
export function SetPasswordForm() {
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = passwordRef.current?.value ?? "";
    const confirm = confirmRef.current?.value ?? "";

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
    setPending(false);

    if (updateError) {
      setError("비밀번호 설정에 실패했습니다. 링크가 만료되었을 수 있습니다.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.cardKicker}>EDCL AI솔루션 팀 전용</p>
      <h1 className={styles.cardTitle}>비밀번호 설정</h1>

      <form onSubmit={handleSubmit}>
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
