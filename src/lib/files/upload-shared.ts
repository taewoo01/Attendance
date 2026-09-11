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

/**
 * 팀소개 페이지 수정: 프로필 사진 업로드 용량 제한. 일반 첨부파일(20MB)보다
 * 훨씬 작은 이미지 한 장이라 더 낮게 둔다 — 새 버킷/allowlist 없이 기존
 * "files" 버킷과 ALLOWED_EXTENSIONS를 그대로 재사용하되(위 주석과 동일 원칙),
 * 용량만 avatars/<userId>/... 경로 업로드에서 별도로 검증한다.
 */
export const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif"]);

/** 실적 상세 페이지에서 이미지 첨부파일을 다운로드 클릭 없이 바로 미리보기로 보여줄지 판단한다. */
export function isImageExtension(name: string): boolean {
  return IMAGE_EXTENSIONS.has(extensionOf(name));
}

/** ALLOWED_EXTENSIONS와 1:1로 대응하는 MIME 타입. contentTypeFor()의 신뢰 가능한 소스. */
const EXTENSION_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  txt: "text/plain",
  csv: "text/csv",
  zip: "application/zip",
};

/**
 * 브라우저가 넘겨주는 File.type은 OS/브라우저마다 신뢰도가 다르다(macOS Safari 등에서
 * 특정 파일에 빈 문자열을 주는 경우가 있다 — Windows Chrome에서는 되는데 macOS에서
 * 안 되는 업로드 오류의 흔한 원인). 확장자 allowlist에 있는 파일은 그 값으로 고정하고,
 * 목록 밖 확장자만 브라우저가 준 값(그래도 없으면 octet-stream)으로 대체한다.
 */
export function contentTypeFor(name: string, browserType: string): string {
  return EXTENSION_MIME_TYPES[extensionOf(name)] ?? (browserType || "application/octet-stream");
}

/** 슬래시/백슬래시/공백/하이픈만 "_"로 바꾼다(Storage 경로에 안전하게) — 한글 파일명은 원본 그대로 유지한다. */
export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\ -]/g, "_");
}
