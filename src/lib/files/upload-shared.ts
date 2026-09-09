/**
 * files/results 첨부파일 업로드가 공유하는 상수/헬퍼. `"use server"` 파일
 * (src/lib/files/actions.ts, src/lib/results/actions.ts)은 async 함수만
 * export할 수 있어서 이 값들은 별도의 일반 모듈로 뺐다.
 */
export const BUCKET = "files";

/**
 * 서버 측 확장자 allowlist(AGENTS.md 11.4절: 실행 파일 업로드 차단).
 * office 문서/이미지/텍스트/압축 파일만 허용하고 그 외(실행 파일 포함)는
 * 전부 거부한다. 목록 밖 확장자를 만나면 값을 추측해서 추가하지 않는다.
 * 실적 첨부파일(src/lib/results/actions.ts)도 같은 버킷/allowlist를 그대로
 * 재사용한다 — 새 버킷을 만들지 않고 `achievements/<id>/...` 경로로 구분한다.
 */
export const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "txt",
  "csv",
  "zip",
]);

// 버킷 생성 시 file_size_limit(20MB)과 동일한 값. 서버 측에서도 별도로 확인한다.
export const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

/** 슬래시/백슬래시/공백/하이픈만 "_"로 바꾼다(Storage 경로에 안전하게) — 한글 파일명은 원본 그대로 유지한다. */
export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\ -]/g, "_");
}
