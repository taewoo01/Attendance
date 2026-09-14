import { listAttendance } from "@/lib/db/attendance";
import { listAchievements } from "@/lib/db/achievements";
import { listDailyLogs } from "@/lib/db/daily";
import { listFiles } from "@/lib/db/files";
import { listMeetings } from "@/lib/db/meetings";
import { listProfiles } from "@/lib/db/profiles";

export type ActivityItem = {
  id: string;
  message: string;
  at: Date;
};

const RECENT_LIMIT = 20;

/**
 * 상단바 알림 드롭다운(NotificationBell)이 쓰는 최근 활동 목록.
 * 새 notifications 테이블/기록 로직을 만들지 않고, 이미 각 기능이 갖고 있는
 * 등록·체크인 시각 컬럼(attendance.checkedInAt / achievements.createdAt /
 * daily_logs.loggedAt / files.uploadedAt / meeting_notes.createdAt)만 모아
 * 최신순으로 합친다 — 기존 목록 함수를 그대로 재사용한다(각자 이미 해당
 * 컬럼으로 정렬해 반환한다).
 * ideas/personal_events/fixed_schedules는 등록 시각 컬럼 자체가 없어(ideas.postedAt은
 * 표시용 자유 텍스트, personal_events/fixed_schedules는 이벤트 날짜만 있고 "등록한
 * 시각"이 없다) 이번 범위에서는 제외했다 — 넣으려면 각 테이블에 createdAt을 추가하는
 * 별도 작업이 필요하다.
 */
export async function listRecentActivity(limit = RECENT_LIMIT): Promise<ActivityItem[]> {
  // (main)/layout.tsx가 모든 페이지에서 이 함수를 호출한다 — 각 page.tsx도 이미
  // Promise.all로 여러 쿼리를 동시에 날리는데(예: 홈 화면 4개), 여기서도 6개를
  // Promise.all로 겹치면 동시 커넥션이 db/client.ts의 pool max(5)를 넘는다
  // (같은 문제로 발생했던 커넥션 풀 고갈 사고가 db/client.ts에 기록돼 있다).
  // 알림은 모든 페이지에서 매번 필요한 부가 기능이라 병렬화 이득보다 안전을
  // 우선해 순차로 조회한다.
  const attendanceRows = await listAttendance();
  const achievementRows = await listAchievements();
  const dailyLogRows = await listDailyLogs();
  const fileRows = await listFiles();
  const meetingRows = await listMeetings();
  const profileRows = await listProfiles();

  const nameByUserId = new Map(profileRows.map((p) => [p.userId, p.name]));

  const items: ActivityItem[] = [
    ...attendanceRows.map((row) => ({
      id: `checkin-${row.id}`,
      message: `${nameByUserId.get(row.userId) || "누군가"}님이 체크인했습니다`,
      at: row.checkedInAt,
    })),
    ...achievementRows.map((row) => ({
      id: `achievement-${row.id}`,
      message: `${row.who || "누군가"}님이 실적 "${row.title}"을 등록했습니다`,
      at: row.createdAt,
    })),
    ...dailyLogRows.map((row) => ({
      id: `daily-${row.id}`,
      message: `${row.name || "누군가"}님이 데일리 기록을 등록했습니다`,
      at: row.loggedAt,
    })),
    ...fileRows.map((row) => ({
      id: `file-${row.id}`,
      message: `${row.uploaderName || "누군가"}님이 파일 "${row.name}"을 업로드했습니다`,
      at: row.uploadedAt,
    })),
    ...meetingRows.map((row) => ({
      id: `meeting-${row.id}`,
      message: `${row.recorder || "누군가"}님이 회의록 "${row.title}"을 등록했습니다`,
      at: row.createdAt,
    })),
  ];

  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
