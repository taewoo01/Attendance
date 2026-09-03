import styles from "./LoginBattery.module.css";

export interface PillState {
  label: string;
  error: boolean;
}

interface LoginBatteryProps {
  /** DOM 상 위(index 0)→아래(index 4) 순서의 셀 5개 충전 상태. */
  cellsFilled: boolean[];
  soc: number;
  pill: PillState;
  shake: boolean;
}

/**
 * playground-design/login.html 의 .b3d-* 3D 배터리를 그대로 옮긴 것.
 * 순수 프레젠테이션 컴포넌트로, 실제 충전 애니메이션 상태(cellsFilled/soc/pill/shake)는
 * 부모(LoginScreen)가 로그인 성공/실패 타이밍에 맞춰 controlled props로 내려준다.
 */
export function LoginBattery({ cellsFilled, soc, pill, shake }: LoginBatteryProps) {
  return (
    <div className={styles.b3dWrap}>
      <div className={styles.b3dInner}>
        <div className={styles.b3dGlow} />
        <svg className={styles.b3dCircuit} viewBox="0 0 360 480" width={360} height={480} fill="none">
          <path className={styles.b3dTraceBase} d="M40 120 H100 L120 100" />
          <path className={styles.b3dTraceFlow} pathLength={100} d="M40 120 H100 L120 100" />
          <path className={styles.b3dTraceBase} d="M30 220 H100" />
          <path
            className={styles.b3dTraceFlow}
            pathLength={100}
            d="M30 220 H100"
            style={{ animationDelay: "-0.6s" }}
          />
          <path className={styles.b3dTraceBase} d="M40 340 H110 L130 360" />
          <path
            className={styles.b3dTraceFlow}
            pathLength={100}
            d="M40 340 H110 L130 360"
            style={{ animationDelay: "-1.2s" }}
          />
          <path className={styles.b3dTraceBase} d="M320 130 H260 L240 110" />
          <path
            className={styles.b3dTraceFlow}
            pathLength={100}
            d="M320 130 H260 L240 110"
            style={{ animationDelay: "-1.8s" }}
          />
          <path className={styles.b3dTraceBase} d="M330 220 H260" />
          <path
            className={styles.b3dTraceFlow}
            pathLength={100}
            d="M330 220 H260"
            style={{ animationDelay: "-2.4s" }}
          />
          <path className={styles.b3dTraceBase} d="M320 330 H250 L230 350" />
          <path
            className={styles.b3dTraceFlow}
            pathLength={100}
            d="M320 330 H250 L230 350"
            style={{ animationDelay: "-3s" }}
          />

          <rect className={styles.b3dBlockRect} x={20} y={100} width={55} height={26} rx={5} />
          <text className={styles.b3dBlockText} x={30} y={117} fontSize={8}>
            DC-DC
          </text>

          <rect className={styles.b3dBlockRect} x={18} y={345} width={50} height={26} rx={5} />
          <text className={styles.b3dBlockText} x={30} y={362} fontSize={8}>
            PMIC
          </text>

          <rect className={styles.b3dBlockRect} x={285} y={90} width={48} height={48} rx={6} />
          <text className={styles.b3dBlockText} x={296} y={118} fontSize={9}>
            MCU
          </text>
          <g className={styles.b3dPin}>
            <line x1={285} y1={98} x2={272} y2={98} />
            <line x1={285} y1={114} x2={272} y2={114} />
            <line x1={285} y1={130} x2={272} y2={130} />
          </g>

          <rect className={styles.b3dBlockRect} x={283} y={335} width={52} height={24} rx={5} />
          <text className={styles.b3dBlockText} x={292} y={351} fontSize={8}>
            SENSE
          </text>

          <circle className={styles.b3dNode} cx={40} cy={120} r={3} />
          <circle className={styles.b3dNode} cx={30} cy={220} r={3} />
          <circle className={styles.b3dNode} cx={320} cy={130} r={3} />
        </svg>

        <div className={`${styles.b3dCharging} ${pill.error ? styles.error : ""}`}>
          <span className={styles.ping} />
          {pill.label}
        </div>

        <div className={`${styles.b3dBody} ${shake ? styles.shake : ""}`}>
          <div className={styles.b3dCap} />
          <div className={styles.b3dCells}>
            {cellsFilled.map((filled, i) => (
              <div key={i} className={`${styles.b3dCell} ${filled ? styles.fill : styles.glass}`}>
                {!filled && <div className={styles.b3dCellPulse} />}
              </div>
            ))}
          </div>
          <div className={styles.b3dGloss} />
        </div>

        <div className={`${styles.b3dHud} ${styles.soc}`}>
          <p className={styles.l}>SOC</p>
          <p className={styles.v}>{soc}%</p>
        </div>
        <div className={`${styles.b3dHud} ${styles.volt}`}>
          <p className={styles.l}>VOLT</p>
          <p className={styles.v}>3.98 V</p>
        </div>
        <div className={`${styles.b3dHud} ${styles.temp}`}>
          <p className={styles.l}>TEMP</p>
          <p className={styles.v}>27.4&deg;C</p>
        </div>
        <div className={`${styles.b3dHud} ${styles.soh}`}>
          <p className={styles.l}>SOH</p>
          <p className={styles.v}>97%</p>
        </div>
      </div>
    </div>
  );
}
