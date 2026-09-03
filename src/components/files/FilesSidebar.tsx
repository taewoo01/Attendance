type RecentShape = "doclines" | "docplain" | "image";

const RECENT_ITEMS: { shape: RecentShape; name: string; meta: string }[] = [
  { shape: "doclines", name: "SOH_실험결과_v3.xlsx", meta: "김연구 · 방금 전" },
  { shape: "docplain", name: "KEPCO_중간보고서_초안.pdf", meta: "강태윤 · 어제" },
  { shape: "image", name: "색상식별기_회로도_v2.png", meta: "박준서 · 8/27" },
];

/**
 * playground-design/files.html의 <aside> 격 2개 .side-card
 * (저장 용량 / 최근 활동). <script>가 없어 전부 정적 영역이라 Server Component로 유지한다.
 * .recent-icon svg는 원본에서 파일 타입별 색상 클래스(pdf/doc/sheet/img)를 전혀
 * 적용하지 않고 항상 기본 stroke(--silk-dim)만 쓰므로, 아이콘 모양은 파일 타입별로
 * 다르게 재현하되 색상은 붙이지 않는다(원본 quirk 보존).
 */
export function FilesSidebar() {
  return (
    <div>
      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">저장 용량</h4>
        <div className="mb-2 h-[7px] overflow-hidden rounded-badge bg-bg-raised">
          <div
            className="h-full rounded-badge bg-[linear-gradient(90deg,var(--teal),#2fa088)]"
            style={{ width: "34%" }}
          />
        </div>
        <div className="font-mono text-[11px] text-silk-faint">1.7GB 사용 중</div>
        <div className="mt-2.5 text-[11px] leading-[1.6] text-silk-faint">
          파일 용량 제한과 보관 기간 정책은 아직 팀 논의 중이에요.
        </div>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">최근 활동</h4>
        {RECENT_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0 last:pb-0">
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-chip border border-border bg-bg-raised">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-3 w-3 stroke-silk-dim">
                {item.shape === "image" ? (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </>
                ) : item.shape === "docplain" ? (
                  <>
                    <path d="M4 4h11l5 5v11H4z" />
                    <path d="M15 4v5h5" />
                  </>
                ) : (
                  <>
                    <path d="M4 4h11l5 5v11H4z" />
                    <path d="M15 4v5h5M8 13h8M8 17h5" />
                  </>
                )}
              </svg>
            </div>
            <div>
              <div className="text-[12px] text-silk">{item.name}</div>
              <div className="mt-px font-mono text-[10px] text-silk-faint">{item.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
