"use client";

import { useRef, useState, type ReactNode } from "react";
import { PastLogsCard } from "@/components/daily/PastLogsCard";
import { TeamFeedCard, type FeedEntry } from "@/components/daily/TeamFeedCard";
import { WriteLogModal } from "@/components/daily/WriteLogModal";

type FeedDay = { label: string; ratio: string; entries: FeedEntry[]; emptyNote: string };

const FEED_DATES = ["0831", "0829", "0828", "0827", "0826"] as const;

/**
 * playground-design/daily.html의 FEED_DATA 상수. 원본 <script>가 이 데이터를
 * 조작하지 않고 조회만 하므로 local constant로 유지한다(docs/MIGRATION.md 8절).
 */
const FEED_DATA: Record<(typeof FEED_DATES)[number], FeedDay> = {
  "0831": {
    label: "8월 31일 (월)",
    ratio: "3/4명 작성",
    entries: [
      {
        mine: true,
        name: "김연구",
        avatar: "연",
        time: "09:14",
        desc: "DC 리플 기반 SOH 추정 continual learning 실험 1차 마무리. 배치 학습 대비 드리프트 대응 정확도 비교표 정리해서 김병철 교수님께 공유. 오후에는 KEPCO 과제 중간보고서 리뷰 참여.",
        check: "2/4 완료",
        pct: 50,
      },
      {
        name: "이하늘",
        avatar: "하",
        time: "10:32",
        desc: "온도 조건별 SOC 추정 논문 실험 셋업 리뷰, 결과 도표 다듬기. 오후에 김연구와 실험 섹션 논의 예정.",
        check: "2/2 완료",
        pct: 100,
      },
      {
        name: "박준서",
        avatar: "준",
        time: "11:05",
        desc: "전공수업 후 EDCL 정기 미팅 참석, IDEC 2026 색상 식별기 회로도 리뷰 코멘트 반영.",
        check: "1/2 완료",
        pct: 50,
      },
    ],
    emptyNote: "정민재님은 아직 오늘 기록을 작성하지 않았어요.",
  },
  "0829": {
    label: "8월 29일 (금)",
    ratio: "2/4명 작성",
    entries: [
      {
        mine: true,
        name: "김연구",
        avatar: "연",
        time: "18:20",
        desc: "SOH continual learning 실험 셋업 완료, 기존 배치 모델과 비교 실험 시작. 저녁에 실적 관리에 등록.",
        check: "3/3 완료",
        pct: 100,
      },
      {
        name: "정민재",
        avatar: "민",
        time: "17:05",
        desc: "KEPCO 과제 관련 데이터 수집 스크립트 정리, 다음 주 시뮬레이션 파라미터 셋업.",
        check: "2/3 완료",
        pct: 66,
      },
    ],
    emptyNote: "이하늘, 박준서님은 이날 기록을 작성하지 않았어요.",
  },
  "0828": {
    label: "8월 28일 (목)",
    ratio: "2/4명 작성",
    entries: [
      {
        mine: true,
        name: "김연구",
        avatar: "연",
        time: "19:40",
        desc: "KEPCO 과제 중간보고서 초안 작성, PPO 학습 진행상황 정리해서 팀 채널에 공유.",
        check: "2/3 완료",
        pct: 66,
      },
      {
        name: "강태윤",
        avatar: "태",
        time: "16:15",
        desc: "투자자 미팅 자료 초안 정리, GoldenLink 데모 시나리오 구성.",
        check: "1/2 완료",
        pct: 50,
      },
    ],
    emptyNote: "이하늘, 박준서님은 이날 기록을 작성하지 않았어요.",
  },
  "0827": {
    label: "8월 27일 (수)",
    ratio: "2/4명 작성",
    entries: [
      {
        mine: true,
        name: "김연구",
        avatar: "연",
        time: "20:02",
        desc: "온도 조건별 SOC 추정 하이브리드 모델 논문 초안 리뷰, 이하늘과 실험 셋업 섹션 논의.",
        check: "2/2 완료",
        pct: 100,
      },
      {
        name: "이하늘",
        avatar: "하",
        time: "19:55",
        desc: "SOC 논문 실험 셋업 섹션 초안 작성, 김연구와 리뷰 논의.",
        check: "2/2 완료",
        pct: 100,
      },
    ],
    emptyNote: "박준서, 정민재님은 이날 기록을 작성하지 않았어요.",
  },
  "0826": {
    label: "8월 26일 (화)",
    ratio: "1/4명 작성",
    entries: [
      {
        mine: true,
        name: "김연구",
        avatar: "연",
        time: "21:10",
        desc: "IDEC 2026 색상 식별기 브레드보드 테스트, 오차 범위 확인 후 회로도 수정.",
        check: "1/2 완료",
        pct: 50,
      },
    ],
    emptyNote: "이하늘, 박준서, 정민재님은 이날 기록을 작성하지 않았어요.",
  },
};

/**
 * playground-design/daily.html의 .page-head + .main 좌측 컬럼(팀 기록 카드,
 * 작성/수정 모달, 지난 기록 카드) 전체를 담당한다.
 * feedIndex(팀 기록 날짜 이동)와 modalOpen(작성 모달)을 page-head 버튼,
 * 팀 기록의 "수정" 링크, 지난 기록 클릭이 함께 공유해야 해서 하나의 Client
 * Component에서 관리한다. 사이드바는 이 상태와 무관한 정적 영역이라
 * Server Component로 유지하고 `sidebar` prop(children)으로 전달받는다
 * (ScheduleCalendar의 monthView prop과 동일한 패턴).
 */
export function DailyBoard({ sidebar }: { sidebar: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [feedIndex, setFeedIndex] = useState(0);
  const feedCardRef = useRef<HTMLDivElement>(null);

  const clamp = (i: number) => Math.max(0, Math.min(FEED_DATES.length - 1, i));
  const data = FEED_DATA[FEED_DATES[feedIndex]];

  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">데일리 업무 정리</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">데일리 업무 정리</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-[5px] rounded-pill bg-amber-dim px-[11px] py-[5px] font-mono text-[11px] text-amber">
            🔥 5일 연속 기록 중
          </span>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
          >
            + 오늘 기록 작성
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_300px] items-start gap-[22px] px-7 pt-[22px] pb-[90px] max-[960px]:grid-cols-1">
        <div>
          <TeamFeedCard
            label={data.label}
            ratio={data.ratio}
            entries={data.entries}
            emptyNote={data.emptyNote}
            onPrev={() => setFeedIndex((i) => clamp(i + 1))}
            onNext={() => setFeedIndex((i) => clamp(i - 1))}
            onEditMine={() => setModalOpen(true)}
            containerRef={feedCardRef}
          />
          <WriteLogModal open={modalOpen} onClose={() => setModalOpen(false)} />
          <PastLogsCard
            onSelectDate={(date) => {
              const idx = FEED_DATES.indexOf(date as (typeof FEED_DATES)[number]);
              if (idx !== -1) {
                setFeedIndex(idx);
                feedCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
        </div>
        {sidebar}
      </div>
    </>
  );
}
