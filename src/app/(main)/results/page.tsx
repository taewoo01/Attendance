import { RegisterResultModal } from "@/components/results/RegisterResultModal";
import { ResultsBoard } from "@/components/results/ResultsBoard";
import type { Result } from "@/components/results/ResultList";
import { ResultsSidebar } from "@/components/results/ResultsSidebar";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listAchievementFiles, listAchievements } from "@/lib/db/achievements";
import { listProfiles } from "@/lib/db/profiles";
import { formatKoreanDateLabel, seoulDateKey } from "@/lib/date";

// TASK-026: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const [user, rows, members, fileRows] = await Promise.all([
    getCurrentUser(),
    listAchievements(),
    listProfiles(),
    listAchievementFiles(),
  ]);

  const filesByAchievement = new Map<string, { id: string; name: string }[]>();
  for (const f of fileRows) {
    const list = filesByAchievement.get(f.achievementId);
    if (list) {
      list.push({ id: f.id, name: f.name });
    } else {
      filesByAchievement.set(f.achievementId, [{ id: f.id, name: f.name }]);
    }
  }

  const results: Result[] = rows.map((row) => ({
    id: row.id,
    userId: row.userId ?? undefined,
    avatar: row.avatar,
    team: row.team,
    title: row.title,
    desc: row.desc,
    who: row.who,
    teamMembers: row.teamMembers.length > 0 ? row.teamMembers : undefined,
    file: row.file,
    files: filesByAchievement.get(row.id),
    link: row.link || undefined,
    date: formatKoreanDateLabel(row.resultDate),
    dateKey: row.resultDate,
    metric: row.metricLabel ? { label: row.metricLabel, value: row.metricValue } : undefined,
  }));

  const todayKey = seoulDateKey(new Date());

  return (
    <>
      <RegisterResultModal members={members} />

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_300px] items-start gap-[22px] px-7 pt-[22px] pb-[90px] max-[960px]:grid-cols-1">
        <ResultsBoard results={results} currentUserId={user?.id} todayKey={todayKey} />
        <ResultsSidebar results={results} members={members} />
      </div>
    </>
  );
}
