/**
 * "use server" 파일(plan.ts)은 async 함수만 export할 수 있어서(upload-shared.ts와
 * 동일한 이유) 클라이언트 컴포넌트(AttendancePlanModal)와 서버 액션이 함께 쓰는
 * 상수/타입은 이 일반 모듈로 뺀다.
 */
export type PlanKind = "day" | "night" | "full" | "off" | "custom";

export const PRESET_LABELS: Record<Exclude<PlanKind, "custom">, string> = {
  day: "주간",
  night: "야간",
  full: "종일",
  off: "안 옴",
};

export const VALID_KINDS: PlanKind[] = ["day", "night", "full", "off", "custom"];

export const CUSTOM_LABEL_MAX_LENGTH = 10;
