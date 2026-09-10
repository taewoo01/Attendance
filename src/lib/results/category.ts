/**
 * RegisterResultModal/EditResultModal/ResultList/results/[id]/page.tsx가 공유하는
 * 카테고리(논문/공모전/프로젝트/창업) 타입 + 표시용 라벨 포맷터. 두 모달의 select
 * 값과 서버(actions.ts parseCategoryFields)의 whitelist가 이 값들과 어긋나지
 * 않아야 한다.
 */
export type AchievementCategory = "" | "논문" | "공모전" | "프로젝트" | "창업";
export type PaperType = "KCI" | "SCI";

/** 목록/상세 페이지의 카테고리 배지 텍스트. 값이 없으면 배지를 그리지 않도록 null. */
export function formatCategoryLabel({
  category,
  paperType,
  awarded,
  awardName,
}: {
  category: string;
  paperType: string;
  awarded: boolean;
  awardName: string;
}): string | null {
  if (category === "논문") {
    return paperType ? `논문 · ${paperType}` : "논문";
  }
  if (category === "공모전") {
    return `공모전 · ${awarded ? `수상${awardName ? ` (${awardName})` : ""}` : "미수상"}`;
  }
  return category || null;
}
