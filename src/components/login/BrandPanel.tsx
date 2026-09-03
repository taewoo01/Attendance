import { LoginBattery, type PillState } from "./LoginBattery";
import styles from "./LoginScreen.module.css";

interface BrandPanelProps {
  cellsFilled: boolean[];
  soc: number;
  pill: PillState;
  shake: boolean;
}

/**
 * playground-design/login.html 좌측 .brand-panel(로고/카피/3D 배터리/기능 목록).
 * 900px 이하에서는 CSS(LoginScreen.module.css)로 전체를 숨긴다.
 */
export function BrandPanel({ cellsFilled, soc, pill, shake }: BrandPanelProps) {
  return (
    <div className={styles.brandPanel}>
      <div className={styles.brandTop}>
        <div className={styles.logo}>
          <span className={styles.dot} />
          PLAY <span className={styles.l2}>GROUND</span>
        </div>
        <p className={styles.kicker}>BATTERY MANAGEMENT SYSTEM</p>
      </div>

      <div className={styles.brandHero}>
        <LoginBattery cellsFilled={cellsFilled} soc={soc} pill={pill} shake={shake} />
      </div>

      <div className={styles.brandBottom}>
        <h2>배터리 관리 시스템(BMS)을 개발하는 EDCL AI솔루션 팀의 협업 공간입니다.</h2>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <span className={styles.fiDot} />
            QR 체크인으로 출석을 관리해요
          </div>
          <div className={styles.featureItem}>
            <span className={styles.fiDot} />
            상주 시간과 일정을 한 화면에서 확인해요
          </div>
          <div className={styles.featureItem}>
            <span className={styles.fiDot} />
            실적과 아이디어를 팀과 함께 기록해요
          </div>
        </div>
      </div>
    </div>
  );
}
