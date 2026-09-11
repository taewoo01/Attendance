"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { DailySidebar, type WeekStatusDay } from "@/components/daily/DailySidebar";
import { PastLogsCard, type PastLog } from "@/components/daily/PastLogsCard";
import { TeamFeedCard, type FeedEntry, type RosterMember } from "@/components/daily/TeamFeedCard";
import { WriteLogModal, type DailyLogTemplate, type WriteLogTarget } from "@/components/daily/WriteLogModal";
import { toggleDailyLogChecklistItem } from "@/lib/daily/actions";

export type FeedDay = { dateKey: string; label: string; ratio: string; entries: FeedEntry[]; emptyNote: string };

type DailyBoardProps = {
  feedDays: FeedDay[];
  pastLogs: PastLog[];
  todayKey: string;
  templates: DailyLogTemplate[];
  weekStatus: WeekStatusDay[];
  streakCurrent: number;
  streakBest: number;
  roster: RosterMember[];
};

/**
 * playground-design/daily.html의 .page-head + .main 좌측 컬럼(팀 기록 카드,
 * 작성/수정 모달, 지난 기록 카드) 전체를 담당한다.
 * feedIndex(팀 기록 날짜 이동)와 editTarget(작성 모달이 어떤 날짜를 대상으로
 * 하는지)를 page-head 버튼, 팀 기록의 "수정" 링크, 지난 기록 클릭이 함께
 * 공유해야 해서 하나의 Client Component에서 관리한다.
 * TASK-025: 하드코딩된 FEED_DATES/FEED_DATA/PAST_LOGS 대신 page.tsx가 실제
 * daily_logs를 날짜별로 묶어 계산한 결과를 props로 받는다.
 * TASK-035: modalOpen(boolean)이 editTarget(WriteLogTarget | null)으로 바뀌었다
 * — "오늘 기록 작성"과 "수정"이 이제 서로 다른 날짜/내용을 대상으로 할 수
 * 있어야 해서다. 사이드바(DailySidebar)도 "자주 쓰는 체크리스트"의 "+ 추가"가
 * 이 컴포넌트의 모달 오픈 로직과 연결돼야 해서(콜백 prop 필요) 더 이상
 * page.tsx가 내려주는 정적 children이 아니라 여기서 직접 렌더링한다.
 */
export function DailyBoard({
  feedDays,
  pastLogs,
  todayKey,
  templates,
  weekStatus,
  streakCurrent,
  streakBest,
  roster,
}: DailyBoardProps) {
  const router = useRouter();
  const [editTarget, setEditTarget] = useState<WriteLogTarget | null>(null);
  const [feedIndex, setFeedIndex] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState("all");
  const feedCardRef = useRef<HTMLDivElement>(null);

  const clamp = (i: number) => Math.max(0, Math.min(feedDays.length - 1, i));
  const data = feedDays[feedIndex];
  const visibleEntries = selectedUserId === "all" ? data.entries : data.entries.filter((e) => e.userId === selectedUserId);
  const selectedName = roster.find((m) => m.userId === selectedUserId)?.name;
  const noun = data.dateKey === todayKey ? "오늘" : "이날";
  const displayEmptyNote =
    selectedUserId === "all"
      ? data.emptyNote
      : visibleEntries.length === 0
        ? `${selectedName ?? ""}님은 아직 ${noun} 기록을 작성하지 않았어요.`
        : "";

  async function handleToggleItem(index: number) {
    const result = await toggleDailyLogChecklistItem(data.dateKey, index);
    if (!result.error) router.refresh();
  }

  function openEditor(day: FeedDay, extraItems: string[] = []) {
    const mine = day.entries.find((e) => e.mine);
    const baseChecklist = mine?.checklist ?? [];
    setEditTarget({
      dateKey: day.dateKey,
      dateLabel: day.label,
      initial:
        mine || extraItems.length > 0
          ? { body: mine?.desc ?? "", checklist: [...baseChecklist, ...extraItems.map((text) => ({ text, done: false }))] }
          : null,
    });
  }

  function openToday(extraItems: string[] = []) {
    const todayDay = feedDays.find((d) => d.dateKey === todayKey) ?? data;
    openEditor(todayDay, extraItems);
  }

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
          {streakCurrent > 0 && (
            <span className="inline-flex items-center gap-[5px] rounded-pill bg-amber-dim px-[11px] py-[5px] font-mono text-[11px] text-amber">
              🔥 {streakCurrent}일 연속 기록 중
            </span>
          )}
          <button
            type="button"
            onClick={() => openToday()}
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
            entries={visibleEntries}
            emptyNote={displayEmptyNote}
            onPrev={() => setFeedIndex((i) => clamp(i + 1))}
            onNext={() => setFeedIndex((i) => clamp(i - 1))}
            onEditMine={() => openEditor(data)}
            containerRef={feedCardRef}
            roster={roster}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
            onToggleItem={handleToggleItem}
          />
          <WriteLogModal
            key={editTarget ? editTarget.dateKey : "closed"}
            target={editTarget}
            onClose={() => setEditTarget(null)}
            templates={templates}
          />
          <PastLogsCard
            pastLogs={pastLogs}
            onSelectDate={(date) => {
              const idx = feedDays.findIndex((d) => d.dateKey === date);
              if (idx !== -1) {
                setFeedIndex(idx);
                feedCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
        </div>
        <DailySidebar
          weekStatus={weekStatus}
          streakCurrent={streakCurrent}
          streakBest={streakBest}
          templates={templates}
          onApplyTemplate={(items) => openToday(items)}
        />
      </div>
    </>
  );
}
