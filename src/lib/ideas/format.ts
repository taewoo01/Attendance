const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * ideas.postedAt / IdeaCommentRow.postedAt은 이제 ISO 문자열로 저장한다(TASK-034
 * 이전에는 "8월 29일 (금) · 14:20"처럼 이미 포맷된 텍스트를 직접 저장했다 — 그
 * 방식으로는 "최신순" 정렬이나 "최근 활동" 시간순 병합이 문자열 비교라 신뢰할
 * 수 없었다). 표시할 때만 이 함수로 playground-design/ideas.html의 .idea-when
 * 표기("M월 D일 (요일) · HH:mm")로 변환한다. ISO로 파싱되지 않으면(과거에 이미
 * 포맷된 텍스트로 저장된 seed 데이터 등) 원본 문자열을 그대로 보여준다 —
 * 별도 데이터 마이그레이션 없이 하위 호환을 유지하기 위함이다.
 */
export function formatIdeaTimestamp(raw: string): string {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const y = Number(get("year"));
  const m = Number(get("month"));
  const d = Number(get("day"));
  const dow = WEEKDAY_KO[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}월 ${d}일 (${dow}) · ${get("hour")}:${get("minute")}`;
}

/** 정렬/최근 활동 병합용 정렬 키. 파싱 안 되는 레거시 텍스트는 가장 오래된 것으로 취급한다. */
export function ideaTimestampMs(raw: string): number {
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}
