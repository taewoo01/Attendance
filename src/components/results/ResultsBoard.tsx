"use client";

import { useMemo, useState } from "react";
import { addDays, addMonths, mondayKeyOf, monthKeyOf, monthRangeLabelOf, weekRangeLabelOf } from "@/lib/date";
import { ResultList, type Result } from "@/components/results/ResultList";
import { ResultsToolbar } from "@/components/results/ResultsToolbar";

type ResultsBoardProps = {
  results: Result[];
  currentUserId?: string;
  todayKey: string;
  members: { userId: string; name: string }[];
};

/**
 * ResultsToolbar(주간/월간 전환 + ‹ › 이동)와 ResultList(목록)를 함께 묶어서
 * 실제로 기간 이동이 목록 필터링에 반영되게 한다 — ScheduleCalendar(schedule
 * 페이지)와 동일한 패턴(mondayKey/monthKey를 client state로 들고 addDays/
 * addMonths로 순수 날짜 연산만 하므로, 그 기간에 result가 있는지와 무관하게
 * 항상 이전/다음으로 이동 가능하다). 이전에는 ResultsToolbar가 자체 view state만
 * 갖고 ‹ › 버튼에 onClick조차 없어서 "이번 주 실적" 목록이 항상 전체 결과를
 * 그대로 보여줬다.
 */
export function ResultsBoard({ results, currentUserId, todayKey, members }: ResultsBoardProps) {
  const [view, setView] = useState<"week" | "month">("week");
  const [mondayKey, setMondayKey] = useState(() => mondayKeyOf(todayKey));
  const [monthKey, setMonthKey] = useState(() => monthKeyOf(todayKey));

  const sundayKey = addDays(mondayKey, 6);
  const rangeLabel = view === "week" ? weekRangeLabelOf(mondayKey, sundayKey) : monthRangeLabelOf(monthKey);

  const visibleResults = useMemo(
    () =>
      view === "week"
        ? results.filter((r) => r.dateKey >= mondayKey && r.dateKey <= sundayKey)
        : results.filter((r) => monthKeyOf(r.dateKey) === monthKey),
    [results, view, mondayKey, sundayKey, monthKey],
  );

  function handlePrev() {
    if (view === "week") setMondayKey((k) => addDays(k, -7));
    else setMonthKey((k) => addMonths(k, -1));
  }

  function handleNext() {
    if (view === "week") setMondayKey((k) => addDays(k, 7));
    else setMonthKey((k) => addMonths(k, 1));
  }

  return (
    <div>
      <ResultsToolbar view={view} onViewChange={setView} rangeLabel={rangeLabel} onPrev={handlePrev} onNext={handleNext} />
      <ResultList
        results={visibleResults}
        currentUserId={currentUserId}
        heading={view === "week" ? "주간 실적" : "월간 실적"}
        members={members}
      />
    </div>
  );
}
