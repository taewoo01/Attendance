export type FileKind = "pdf" | "doc" | "sheet" | "img";

/** playground-design/files.html의 .file-icon 4종 분류를 확장자에서 계산한다. */
export function fileKindOf(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif"].includes(ext)) return "img";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (ext === "pdf") return "pdf";
  return "doc";
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

/** "8/29" 형식(Asia/Seoul 기준). */
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(date);
}

/** "방금 전"/"어제"/"8/29"(Asia/Seoul 기준). */
export function formatRelative(date: Date, now: Date): string {
  if (now.getTime() - date.getTime() < 60 * 60 * 1000) return "방금 전";
  const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date);
  const yesterdayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
    new Date(now.getTime() - 86400000),
  );
  return dateKey === yesterdayKey ? "어제" : formatShortDate(date);
}
