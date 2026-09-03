"use client";

import { useRef, useState, type FormEvent } from "react";
import styles from "./LoginScreen.module.css";

interface LoginFormProps {
  loginErrorVisible: boolean;
  loginBtnDisabled: boolean;
  loginBtnLabel: string;
  goHomeVisible: boolean;
  onSubmit: (email: string, password: string) => void;
  onGoHome: () => void;
}

/**
 * playground-design/login.html 우측 .form-panel(로그인 폼).
 * 비밀번호 표시 토글은 이 컴포넌트 내부 상태로만 처리하고(아이콘은 원본처럼
 * 바뀌지 않는다), 배터리 애니메이션과 얽힌 로그인 성공/실패 타이밍은 부모
 * (LoginScreen)가 controlled props로 내려준다.
 */
export function LoginForm({
  loginErrorVisible,
  loginBtnDisabled,
  loginBtnLabel,
  goHomeVisible,
  onSubmit,
  onGoHome,
}: LoginFormProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(emailRef.current?.value.trim() ?? "", passwordRef.current?.value ?? "");
  }

  return (
    <div className={styles.formPanel}>
      <div className={styles.wrap}>
        <div className={styles.mobileLogo}>
          <span className={styles.dot} />
          PLAY <span className={styles.l2}>GROUND</span>
        </div>

        <p className={styles.cardKicker}>EDCL AI솔루션 팀 전용</p>
        <h1 className={styles.cardTitle}>로그인</h1>
        <p className={styles.demoHint}>데모 계정: demo@edcl.team / 1234</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">이메일</label>
            <div className={styles.fieldInput}>
              <input ref={emailRef} type="email" id="email" placeholder="you@edcl.team" />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="password">비밀번호</label>
            <div className={styles.fieldInput}>
              <input
                ref={passwordRef}
                type={passwordVisible ? "text" : "password"}
                id="password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className={styles.togglePw}
                aria-label="비밀번호 표시"
                onClick={() => setPasswordVisible((v) => !v)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx={12} cy={12} r={3} />
                </svg>
              </button>
            </div>
          </div>

          <p className={styles.loginError} style={{ display: loginErrorVisible ? "block" : "none" }}>
            이메일 또는 비밀번호가 올바르지 않습니다.
          </p>

          <div className={styles.rowBetween}>
            <label className={styles.remember}>
              <input type="checkbox" defaultChecked />
              로그인 상태 유지
            </label>
            <a className={styles.forgot} href="#">
              비밀번호 찾기
            </a>
          </div>

          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loginBtnDisabled}>
            <span className={styles.btnLabel}>{loginBtnLabel}</span>
          </button>
        </form>

        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ display: goHomeVisible ? "inline-flex" : "none", marginTop: "10px" }}
          onClick={onGoHome}
        >
          홈으로 이동 →
        </button>

        <div className={styles.divider}>또는</div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={() => alert("이메일로 로그인 링크를 보냈습니다. (데모)")}
        >
          이메일로 로그인 링크 받기
        </button>

        <p className={styles.cardFooter}>
          계정이 없으신가요?{" "}
          <a href="#">팀장에게 초대 요청</a>
        </p>
      </div>
    </div>
  );
}
