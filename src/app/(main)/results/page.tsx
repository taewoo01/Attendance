import { RegisterResultModal } from "@/components/results/RegisterResultModal";
import { ResultList, type Result } from "@/components/results/ResultList";
import { ResultsSidebar } from "@/components/results/ResultsSidebar";
import { ResultsToolbar } from "@/components/results/ResultsToolbar";
import { listAchievements } from "@/lib/db/achievements";

// TASK-026: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const rows = await listAchievements();
  const results: Result[] = rows.map((row) => ({
    id: row.id,
    avatar: row.avatar,
    team: row.team,
    title: row.title,
    desc: row.desc,
    who: row.who,
    file: row.file,
    date: row.resultDate,
    metric: row.metricLabel ? { label: row.metricLabel, value: row.metricValue } : undefined,
  }));

  return (
    <>
      <RegisterResultModal />

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_300px] items-start gap-[22px] px-7 pt-[22px] pb-[90px] max-[960px]:grid-cols-1">
        <div>
          <ResultsToolbar />
          <ResultList results={results} />
        </div>
        <ResultsSidebar results={results} />
      </div>
    </>
  );
}
