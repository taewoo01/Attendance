export const DOW_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** Asia/Seoul 기준 캘린더 날짜 키(YYYY-MM-DD). 서버에서 "오늘"을 계산할 때 쓴다. */
export function seoulDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date);
}

/** dateKey("YYYY-MM-DD") 기준 +/- delta일. */
export function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export function weekdayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function mondayKeyOf(dateKey: string): string {
  return addDays(dateKey, -((weekdayIndex(dateKey) + 6) % 7));
}

export function weekRangeLabelOf(mondayKey: string, sundayKey: string): string {
  const [startY, startM, startD] = mondayKey.split("-").map(Number);
  const [endY, endM, endD] = sundayKey.split("-").map(Number);
  return startY === endY && startM === endM
    ? `${startM}월 ${startD}일 – ${endD}일`
    : `${startM}월 ${startD}일 – ${endM}월 ${endD}일`;
}

/** dateKey("YYYY-MM-DD")의 "YYYY-MM" 부분. */
export function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** monthKey("YYYY-MM") 기준 +/- delta개월. */
export function addMonths(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  return `${ny}-${String(nm + 1).padStart(2, "0")}`;
}

export function monthRangeLabelOf(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `${y}년 ${m}월`;
}

/** dateKey("YYYY-MM-DD") → "M월 D일 (요일)". 실적/일정 등 날짜 하나를 사람이 읽을 표기로 바꿀 때 쓴다. */
export function formatKoreanDateLabel(dateKey: string): string {
  const [, m, d] = dateKey.split("-").map(Number);
  return `${m}월 ${d}일 (${DOW_KO[weekdayIndex(dateKey)]})`;
}

/**
 * dateKey("YYYY-MM-DD") + time("HH:MM", 선택) → "M월 D일 (요일) HH:MM".
 * 회의록의 날짜/시간 피커(meetingDateKey/meetingTime)를 저장용 표시 문자열로
 * 합칠 때 쓴다 — time이 없으면 날짜만 반환한다.
 */
export function formatKoreanDateTimeLabel(dateKey: string, time: string): string {
  const dateLabel = formatKoreanDateLabel(dateKey);
  return time ? `${dateLabel} ${time}` : dateLabel;
}
