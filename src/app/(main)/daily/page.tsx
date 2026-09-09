import { DailyBoard, type FeedDay } from "@/components/daily/DailyBoard";
import type { WeekStatusDay } from "@/components/daily/DailySidebar";
import type { FeedEntry } from "@/components/daily/TeamFeedCard";
import type { PastLog } from "@/components/daily/PastLogsCard";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listDailyLogs, listMyTemplates } from "@/lib/db/daily";
import { listProfiles } from "@/lib/db/profiles";

// TASK-025: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** Asia/Seoul 기준 캘린더 날짜 키(YYYY-MM-DD). */
function seoulDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date);
}

function seoulTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/** dateKey("YYYY-MM-DD")를 원본 표기("8월 31일 (월)" 등)로 변환한다. */
function formatDateParts(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dow = DOW_KO[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return { label: `${m}월 ${d}일 (${dow})`, dateOnly: `${m}월 ${d}일`, dow };
}

function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

function weekdayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** 오늘(또는 오늘 기록이 없으면 어제)부터 거슬러 올라가며 연속 기록 일수를 센다. */
function computeCurrentStreak(myDates: Set<string>, todayKey: string): number {
  let cursor = myDates.has(todayKey) ? todayKey : addDays(todayKey, -1);
  if (!myDates.has(cursor)) return 0;
  let streak = 0;
  while (myDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** 이번 달(Asia/Seoul) 안에서 가장 긴 연속 기록 구간의 길이. */
function computeBestStreakThisMonth(myDates: Set<string>, todayKey: string): number {
  const monthPrefix = todayKey.slice(0, 7);
  const monthDates = Array.from(myDates)
    .filter((key) => key.startsWith(monthPrefix))
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of monthDates) {
    run = prev !== null && addDays(prev, 1) === key ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  return best;
}

export default async function DailyPage() {
  const [user, rows, roster] = await Promise.all([getCurrentUser(), listDailyLogs(), listProfiles()]);
  const templates = user ? await listMyTemplates(user.id) : [];
  const todayKey = seoulDateKey(new Date());

  const byDate = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = seoulDateKey(row.loggedAt);
    const list = byDate.get(key);
    if (list) {
      list.push(row);
    } else {
      byDate.set(key, [row]);
    }
  }

  const dateKeys = Array.from(new Set([todayKey, ...byDate.keys()])).sort((a, b) => (a < b ? 1 : -1));

  const feedDays: FeedDay[] = dateKeys.map((dateKey) => {
    const dayRows = byDate.get(dateKey) ?? [];
    const entries: FeedEntry[] = dayRows.map((row) => {
      const doneCount = row.checklist.filter((item) => item.done).length;
      const total = row.checklist.length;
      const name = row.name ?? "";
      return {
        id: row.id,
        userId: row.userId,
        mine: user ? row.userId === user.id : false,
        name,
        avatar: name.trim().charAt(0) || "?",
        time: seoulTime(row.loggedAt),
        desc: row.body,
        check: `${doneCount}/${total} 완료`,
        pct: total > 0 ? Math.round((doneCount / total) * 100) : 0,
        checklist: row.checklist,
      };
    });

    const authorIds = new Set(dayRows.map((row) => row.userId));
    const missing = roster.filter((profile) => !authorIds.has(profile.userId));
    const { label } = formatDateParts(dateKey);
    const noun = dateKey === todayKey ? "오늘" : "이날";
    const emptyNote =
      missing.length === 0
        ? ""
        : `${missing.map((profile) => profile.name).join(", ")}님은 아직 ${noun} 기록을 작성하지 않았어요.`;

    return {
      dateKey,
      label,
      ratio: `${authorIds.size}/${roster.length}명 작성`,
      entries,
      emptyNote,
    };
  });

  const pastLogs: PastLog[] = feedDays
    .filter((day) => day.dateKey !== todayKey)
    .flatMap((day) => {
      const { dateOnly, dow } = formatDateParts(day.dateKey);
      return day.entries
        .filter((entry) => entry.mine)
        .map((entry) => ({
          date: dateOnly,
          dow,
          desc: entry.desc,
          check: entry.check,
          pct: entry.pct,
          dataDate: day.dateKey,
        }));
    });

  // TASK-035: "이번 주 기록 현황"/연속 기록 일수를 실제 daily_logs에서 계산한다
  // (이전에는 WEEK_DAYS/"5일 연속 기록 중"이 전부 하드코딩이었다).
  const myDates = new Set(user ? rows.filter((row) => row.userId === user.id).map((row) => seoulDateKey(row.loggedAt)) : []);
  const mondayOffset = (weekdayIndex(todayKey) + 6) % 7;
  const mondayKey = addDays(todayKey, -mondayOffset);
  const weekStatus: WeekStatusDay[] = Array.from({ length: 7 }, (_, i) => addDays(mondayKey, i)).map((dateKey) => ({
    dow: DOW_KO[weekdayIndex(dateKey)],
    dnum: Number(dateKey.split("-")[2]),
    done: myDates.has(dateKey),
    today: dateKey === todayKey,
  }));
  const streakCurrent = computeCurrentStreak(myDates, todayKey);
  const streakBest = Math.max(streakCurrent, computeBestStreakThisMonth(myDates, todayKey));

  return (
    <DailyBoard
      feedDays={feedDays}
      pastLogs={pastLogs}
      todayKey={todayKey}
      templates={templates}
      weekStatus={weekStatus}
      streakCurrent={streakCurrent}
      streakBest={streakBest}
      roster={roster.map((profile) => ({ userId: profile.userId, name: profile.name }))}
    />
  );
}
