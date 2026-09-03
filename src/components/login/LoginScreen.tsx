"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandPanel } from "./BrandPanel";
import { LoginForm } from "./LoginForm";
import type { PillState } from "./LoginBattery";
import styles from "./LoginScreen.module.css";

const DEMO_EMAIL = "demo@edcl.team";
const DEMO_PASSWORD = "1234";
const STEP_MS = 160; // 셀 하나 채우는/비우는 속도 (원본 login.html과 동일)
// src/middleware.ts의 데모 로그인 게이트가 확인하는 쿠키와 이름을 맞춘다.
const AUTH_COOKIE = "pg_demo_auth";

// b3d-cell 5개는 DOM 상 위(index 0)→아래(index 4) 순서로 렌더링되고,
// 원본 스크립트는 querySelectorAll 결과를 reverse()해 아래→위 순서로 채운다.
const BOTTOM_UP_DOM_INDEX = [4, 3, 2, 1, 0];

/**
 * playground-design/login.html 전체 화면(브랜드 패널 + 로그인 폼 + 3D 배터리
 * 충전/실패 애니메이션)을 재현하는 최상위 클라이언트 컴포넌트.
 * 원본 <script>가 DOM을 직접 조작해 배터리(.b3d-cell 등)와 폼(버튼 라벨/에러
 * 문구)을 동시에 갱신하므로, 두 영역이 공유하는 상태를 여기서 소유하고
 * BrandPanel/LoginForm에는 controlled props로만 내려준다.
 */
export function LoginScreen() {
  const router = useRouter();

  const [cellsFilled, setCellsFilled] = useState<boolean[]>([false, false, false, false, false]);
  const [soc, setSoc] = useState(0);
  const [pill, setPill] = useState<PillState>({ label: "CHARGING", error: false });
  const [shake, setShake] = useState(false);

  const [loginBtnDisabled, setLoginBtnDisabled] = useState(false);
  const [loginBtnLabel, setLoginBtnLabel] = useState("로그인");
  const [loginErrorVisible, setLoginErrorVisible] = useState(false);
  const [goHomeVisible, setGoHomeVisible] = useState(false);

  const timeoutIds = useRef<number[]>([]);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const timeouts = timeoutIds.current;
    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  function scheduleTimeout(fn: () => void, delay: number) {
    timeoutIds.current.push(window.setTimeout(fn, delay));
  }

  function setCellFilled(domIndex: number, filled: boolean) {
    setCellsFilled((prev) => {
      const next = [...prev];
      next[domIndex] = filled;
      return next;
    });
  }

  function animateSoc(fromPct: number, toPct: number, durationMs: number, onDone?: () => void) {
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / Math.max(durationMs, 1));
      setSoc(Math.round(fromPct + (toPct - fromPct) * t));
      if (t < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        onDone?.();
      }
    }
    rafId.current = requestAnimationFrame(tick);
  }

  function chargeSuccess() {
    BOTTOM_UP_DOM_INDEX.forEach((domIndex, i) => {
      scheduleTimeout(() => setCellFilled(domIndex, true), i * STEP_MS);
    });
    animateSoc(0, 82, BOTTOM_UP_DOM_INDEX.length * STEP_MS, () => {
      setPill({ label: "CHARGED", error: false });
      setLoginBtnLabel("✓ 로그인 완료");
      setGoHomeVisible(true);
    });
  }

  function chargeFail() {
    const partial = 3; // 5칸 중 3칸까지만 차오르다 실패 (원본과 동일)
    const partialSoc = Math.round((82 * partial) / BOTTOM_UP_DOM_INDEX.length);
    const fillOrder = BOTTOM_UP_DOM_INDEX.slice(0, partial);

    fillOrder.forEach((domIndex, i) => {
      scheduleTimeout(() => setCellFilled(domIndex, true), i * STEP_MS);
    });

    animateSoc(0, partialSoc, partial * STEP_MS, () => {
      setPill({ label: "ERROR", error: true });
      setShake(true);

      scheduleTimeout(() => {
        setShake(false);
        const emptyOrder = [...fillOrder].reverse();
        emptyOrder.forEach((domIndex, i) => {
          scheduleTimeout(() => setCellFilled(domIndex, false), i * STEP_MS);
        });
        animateSoc(partialSoc, 0, emptyOrder.length * STEP_MS, () => {
          setPill({ label: "CHARGING", error: false });
          setLoginBtnDisabled(false);
          setLoginBtnLabel("로그인");
          setLoginErrorVisible(true);
        });
      }, 350);
    });
  }

  function handleSubmit(email: string, password: string) {
    setLoginErrorVisible(false);
    setLoginBtnDisabled(true);
    setLoginBtnLabel("충전 중...");

    // TODO: Supabase Auth signInWithPassword()로 교체 (원본 login.html의 자리표시자와 동일)
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      // 데모 수준 게이트: 실제 서버 세션이 아니라 middleware.ts가 확인하는 쿠키만 세팅한다.
      document.cookie = `${AUTH_COOKIE}=1; path=/; SameSite=Lax`;
      chargeSuccess();
    } else {
      chargeFail();
    }
  }

  return (
    <div className={styles.page}>
      <BrandPanel cellsFilled={cellsFilled} soc={soc} pill={pill} shake={shake} />
      <LoginForm
        loginErrorVisible={loginErrorVisible}
        loginBtnDisabled={loginBtnDisabled}
        loginBtnLabel={loginBtnLabel}
        goHomeVisible={goHomeVisible}
        onSubmit={handleSubmit}
        onGoHome={() => router.push("/")}
      />
    </div>
  );
}
