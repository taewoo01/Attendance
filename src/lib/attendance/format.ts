import { daysBetweenKeys, seoulDateKey } from "@/lib/date";

/** Asia/Seoul 기준 "HH:MM"(24시간제). */
export function seoulTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/**
 * 홈 화면/출석 인증 페이지가 공유하는 체크인 시각 표시. 원래는 "오늘"/"전날" 둘로만
 * 나눴는데, 퇴근을 안 누르고 여러 날이 지나도(latestAttendanceByUser가 열린 행을
 * 우선하도록 고친 뒤로는 실제로 그런 행이 그대로 보인다) "전날"이라고만 나오면
 * 며칠째인지 알 수 없어 혼란스러웠다 — 오늘이 아니면 실제 경과 일수를 "N일째"로
 * 보여준다(체크인한 날을 1일째로 센다).
 */
export function formatCheckinTime(checkedInAt: Date, todayKey: string): string {
  const checkedInKey = seoulDateKey(checkedInAt);
  if (checkedInKey === todayKey) return seoulTime(checkedInAt);
  const days = daysBetweenKeys(checkedInKey, todayKey) + 1;
  return `${days}일째 ${seoulTime(checkedInAt)}`;
}
