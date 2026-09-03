import type { ReactNode } from "react";

type BomRow = {
  desig: string;
  icon: ReactNode;
  title: string;
  desc: string;
};

type BomSection = {
  label: string;
  rows: BomRow[];
};

/**
 * playground-design/index.html의 .bom(기능 목록) 정적 데이터.
 * 실제 기능 상태 조회 없이 원본 하드코딩 값을 local constant로 유지한다
 * (docs/MIGRATION.md 8절). 11개 행 전부 원본에서 상태가 "운영중"(on)으로 동일하다.
 */
const SECTIONS: BomSection[] = [
  {
    label: "A — 근태 & 일정",
    rows: [
      {
        desig: "A1",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <rect x={3} y={3} width={7} height={7} />
            <rect x={14} y={3} width={7} height={7} />
            <rect x={3} y={14} width={7} height={7} />
            <path d="M14 14h7v7h-7z" />
          </svg>
        ),
        title: "출석 인증",
        desc: "QR 코드를 스캔해 오늘의 체크인·체크아웃을 기록해요.",
      },
      {
        desig: "A2",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <circle cx={12} cy={12} r={9} />
            <path d="M12 7v5l3 3" />
          </svg>
        ),
        title: "상주 시간 등록",
        desc: "DAY, NIGHT, FULL TIME과 시작~종료 시각을 함께 등록해요.",
      },
      {
        desig: "A3",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <rect x={3} y={4} width={18} height={17} rx={1} />
            <path d="M3 9h18M8 2v4M16 2v4" />
          </svg>
        ),
        title: "개인 일정",
        desc: "팀원 전체에게 공개되는 캘린더에 개인 일정을 등록해요.",
      },
      {
        desig: "A4",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <path d="M4 4h16v16H4z" />
            <path d="M4 9h16M9 4v16" />
          </svg>
        ),
        title: "고정 시간표",
        desc: "수업, 아르바이트 등 매주 반복되는 일정을 등록해요.",
      },
    ],
  },
  {
    label: "B — 협업 자산",
    rows: [
      {
        desig: "B1",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <path d="M3 17l5-6 4 4 5-8 4 5" />
          </svg>
        ),
        title: "실적 관리",
        desc: "제목·날짜·담당자별로 실적을 기록하고 기간별로 조회해요.",
      },
      {
        desig: "B2",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0012 3z" />
          </svg>
        ),
        title: "아이디어 모음집",
        desc: "형식 없이 자유롭게 적고, 댓글과 리액션으로 피드백해요.",
      },
      {
        desig: "B3",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <path d="M4 4h11l5 5v11H4z" />
            <path d="M15 4v5h5" />
          </svg>
        ),
        title: "자료실",
        desc: "프로젝트별 폴더로 정리된 팀 공유 파일 저장소예요.",
      },
      {
        desig: "B4",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <path d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
            <path d="M8 9h8M8 13h8M8 17h5" />
          </svg>
        ),
        title: "회의록",
        desc: "안건과 결정사항, 담당자·기한이 담긴 액션 아이템을 기록해요.",
      },
    ],
  },
  {
    label: "C — 팀 & 소개",
    rows: [
      {
        desig: "C1",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <path d="M3 21V10l9-7 9 7v11" />
            <path d="M9 21v-6h6v6" />
          </svg>
        ),
        title: "회사 소개",
        desc: "비전과 연혁을 담아 외부에도 URL로 공유할 수 있어요.",
      },
      {
        desig: "C2",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <circle cx={9} cy={8} r={3.2} />
            <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
            <circle cx={18} cy={9} r={2.6} />
            <path d="M16.2 14.2c2.4.3 4 2 4 5.8" />
          </svg>
        ),
        title: "팀원 소개",
        desc: "이름, 역할, 연락처가 담긴 명함형 프로필을 확인해요.",
      },
      {
        desig: "C3",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <path d="M4 4h16v4H4zM4 12h16v4H4zM4 20h10" />
          </svg>
        ),
        title: "데일리 업무 정리",
        desc: "서술과 체크리스트를 섞어 하루 업무를 간단히 남겨요.",
      },
    ],
  },
];

/**
 * playground-design/index.html의 .bom(기능 목록) 섹션. 상호작용이 없어 Server Component로 유지한다.
 *
 * 참고(원본 CSS 확인 사항): 원본 `.bom-section-title:first-of-type{margin-top:22px}`는
 * `:first-of-type`이 태그(div) 기준으로 평가되는데 `.bom-head`가 이미 첫 번째 div라서
 * 세 섹션 타이틀 중 어떤 것도 이 규칙에 실제로 매칭되지 않는다(원본 자체의 CSS 선택자 오류로
 * 보임). 즉 원본 렌더링 결과는 세 섹션 타이틀 모두 margin-top:34px로 동일하게 나온다 —
 * 이 페이지도 실제 렌더링 결과와 동일하게 34px을 균일 적용했다(임의 개선 아님).
 */
export function FeatureList() {
  return (
    <section className="mx-auto max-w-[1220px] px-7 pt-2 pb-[100px]">
      <div className="mb-1.5 flex items-baseline justify-between border-b border-border pb-4">
        <h2 className="m-0 text-[15px] font-semibold">기능 목록</h2>
        <span className="font-mono text-[11.5px] text-silk-faint">SECTION A–C · 11 MODULES</span>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.label}>
          <div className="mt-[34px] mb-1.5 font-mono text-xs tracking-[0.02em] text-silk-dim">{section.label}</div>
          {section.rows.map((row) => (
            <div
              key={row.desig}
              className="group grid grid-cols-[52px_34px_1fr_130px] items-center gap-[18px] border-b border-border px-1.5 py-4 [transition:background_.15s_ease] hover:bg-[rgba(72,217,176,0.035)] max-[640px]:grid-cols-[30px_26px_1fr]"
            >
              <div className="font-mono text-[12.5px] text-silk-faint">{row.desig}</div>
              <div className="[&_svg]:h-[17px] [&_svg]:w-[17px] [&_svg]:stroke-silk-dim group-hover:[&_svg]:stroke-teal">
                {row.icon}
              </div>
              <div>
                <h4 className="m-0 mb-[3px] text-[14.5px] font-semibold">{row.title}</h4>
                <p className="m-0 text-[12.8px] text-silk-dim">{row.desc}</p>
              </div>
              <div className="flex items-center justify-end gap-[7px] font-mono text-[11px] text-teal max-[640px]:hidden">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                운영중
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
