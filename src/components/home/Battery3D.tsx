import styles from "./Battery3D.module.css";

/**
 * playground-design/index.html 전용 히어로 그래픽(.scope-frame 전체).
 * 순수 CSS 애니메이션만 사용하고 React state/이벤트가 전혀 없어 Server Component로 유지한다.
 */
export function Battery3D() {
  return (
    <div className={styles.scopeFrame}>
      <div className={styles.b3dWrap}>
        <div className={styles.b3dInner}>
          <div className={styles.b3dGlow} />
          <div className={styles.b3dGlow2} />
          <div className={styles.b3dFloor} />

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

          <div className={styles.b3dCharging}>
            <svg viewBox="0 0 24 24">
              <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
            </svg>
            CHARGING
          </div>

          <div className={styles.b3dBody}>
            <div className={styles.b3dShine} />
            <div className={styles.b3dCap} />
            <div className={styles.b3dCells}>
              <div className={`${styles.b3dCell} ${styles.glass}`}>
                <div className={styles.b3dCellPulse} />
                <svg className={styles.b3dCellRing} viewBox="0 0 22 22">
                  <circle className={styles.track} cx={11} cy={11} r={9} />
                  <circle className={styles.prog} cx={11} cy={11} r={9} />
                </svg>
              </div>
              <div className={`${styles.b3dCell} ${styles.fill}`} />
              <div className={`${styles.b3dCell} ${styles.fill}`} />
              <div className={`${styles.b3dCell} ${styles.fill}`} />
              <div className={`${styles.b3dCell} ${styles.fill}`} />
            </div>
            <div className={styles.b3dGloss} />
          </div>

          <div className={`${styles.b3dHud} ${styles.soc}`}>
            <div className={styles.b3dHudIcon}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
                <rect x={2} y={7} width={18} height={10} rx={2} />
                <path d="M22 10v4" />
                <rect x={5} y={9.5} width={10} height={5} fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              <p className={styles.label}>SOC</p>
              <p className={styles.value}>82%</p>
            </div>
          </div>
          <div className={`${styles.b3dHud} ${styles.volt}`}>
            <div className={styles.b3dHudIcon}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
                <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
              </svg>
            </div>
            <div>
              <p className={styles.label}>VOLT</p>
              <p className={styles.value}>3.98 V</p>
            </div>
          </div>
          <div className={`${styles.b3dHud} ${styles.temp}`}>
            <div className={styles.b3dHudIcon}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
                <path d="M10 14.5V4a2 2 0 114 0v10.5a4 4 0 11-4 0z" />
                <circle cx={12} cy={16} r={1.4} fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              <p className={styles.label}>TEMP</p>
              <p className={styles.value}>27.4&deg;C</p>
            </div>
          </div>
          <div className={`${styles.b3dHud} ${styles.soh}`}>
            <div className={styles.b3dHudIcon}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
                <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6z" />
                <path d="M9 12l2 2 4-4.5" />
              </svg>
            </div>
            <div>
              <p className={styles.label}>SOH</p>
              <p className={styles.value}>97%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
