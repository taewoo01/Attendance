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
 * html/htm/svg는 화면으로 바로 볼 수 있게 허용하되, signed URL을 그대로 새 탭에 열면
 * (svg도 <script>를 심을 수 있어 html과 동일하게) Storage 도메인에서 첨부된 스크립트가
 * 실행될 수 있어(stored XSS) 항상 sandbox iframe 뷰어(src/app/preview,
 * getPreviewKind() 참고)를 거쳐서만 보여준다.
 * hwp/hwpx(한글과컴퓨터 문서)·office 문서·zip은 브라우저가 직접 열 수 없는 포맷이라
 * /preview에서도 미리보기 없이 "다운로드 버튼을 이용하라"는 안내만 보여준다
 * (getPreviewKind()가 "unsupported"로 분류).
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
  "svg",
  "txt",
  "csv",
  "zip",
  "html",
  "htm",
  "hwp",
  "hwpx",
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

const SANDBOXED_PREVIEW_EXTENSIONS = new Set(["html", "htm", "svg"]);
const PDF_PREVIEW_EXTENSIONS = new Set(["pdf"]);
const TEXT_PREVIEW_EXTENSIONS = new Set(["txt", "csv"]);

export type PreviewKind = "sandboxed" | "pdf" | "image" | "text" | "unsupported";

/**
 * "보기" 버튼이 /preview에서 첨부파일을 어떤 방식으로 보여줄지 판단한다.
 * - sandboxed: html/htm/svg — <script> 삽입이 가능해(stored XSS) fetch한 텍스트를
 *   sandbox iframe의 srcDoc에 넣어서만 보여준다.
 * - pdf/image: 브라우저가 직접 렌더링 가능 — signed URL을 iframe/img src에 그대로 건다.
 * - text: txt/csv — fetch한 내용을 그대로 텍스트로 보여준다(HTML로 파싱되지 않아 안전).
 * - unsupported: office 문서(doc/xls/ppt 등)·hwp·zip처럼 브라우저가 직접 열 수 없는
 *   포맷 — /preview가 "다운로드 버튼을 이용하라"는 안내만 보여준다(여기서 바로
 *   열면 원본 파일명 없이 다운로드가 시작돼 버린다).
 */
export function getPreviewKind(name: string): PreviewKind {
  const ext = extensionOf(name);
  if (SANDBOXED_PREVIEW_EXTENSIONS.has(ext)) return "sandboxed";
  if (PDF_PREVIEW_EXTENSIONS.has(ext)) return "pdf";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (TEXT_PREVIEW_EXTENSIONS.has(ext)) return "text";
  return "unsupported";
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
  svg: "image/svg+xml",
  txt: "text/plain",
  csv: "text/csv",
  zip: "application/zip",
  html: "text/html",
  htm: "text/html",
  hwp: "application/haansofthwp",
  hwpx: "application/haansofthwpx",
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

/**
 * DB의 `name`(화면 표시용) 컬럼에 저장할 값을 만든다. 슬래시/백슬래시/공백/하이픈만
 * "_"로 바꾸고 한글 등 원본 파일명은 그대로 유지한다.
 * 주의: 이 값을 Storage 오브젝트 키(storagePath)에 그대로 쓰면 안 된다 — Supabase
 * Storage는 키에 한글 등 비-ASCII 문자가 섞이면 업로드가 실패한다. storagePath는
 * `${crypto.randomUUID()}.${extensionOf(file.name)}`처럼 항상 ASCII로만 구성한다
 * (team/actions.ts의 아바타 업로드 경로가 원래 이 방식이었다).
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\ -]/g, "_");
}
