"use client";

import { useActionState } from "react";
import { inviteTeamMember, type InviteActionState } from "@/lib/auth/invite";
import styles from "@/components/login/LoginScreen.module.css";

const initialState: InviteActionState = {};

/**
 * 팀원 초대 폼. 권한(can_invite) 판단은 서버(inviteTeamMember)에서만 하고
 * 여기서는 결과 메시지만 보여준다 — 지금은 profiles 테이블이 없어(TASK-018)
 * 모든 요청이 "권한이 없습니다" 오류로 돌아온다.
 */
export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteTeamMember, initialState);

  return (
    <div className={styles.wrap}>
      <p className={styles.cardKicker}>EDCL AI솔루션 팀 전용</p>
      <h1 className={styles.cardTitle}>팀원 초대</h1>

      <form action={formAction}>
        <div className={styles.field}>
          <label htmlFor="invite-email">초대할 이메일</label>
          <div className={styles.fieldInput}>
            <input type="email" id="invite-email" name="email" placeholder="teammate@edcl.team" required />
          </div>
        </div>

        {state.error && <p className={styles.loginError}>{state.error}</p>}
        {state.success && <p className={styles.demoHint}>초대 메일을 보냈습니다.</p>}

        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={pending}>
          {pending ? "전송 중..." : "초대 보내기"}
        </button>
      </form>
    </div>
  );
}
