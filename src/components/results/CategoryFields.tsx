"use client";

import type { AchievementCategory, PaperType } from "@/lib/results/category";

/**
 * RegisterResultModal/EditResultModal이 공유하는 카테고리 선택 UI(select + 논문
 * KCI/SCI 토글 + 공모전 수상 여부/수상명). 두 모달 모두 category/paperType/
 * awarded/awardName을 자기 state로 들고 있고 이 컴포넌트는 그 값과 변경 콜백만
 * 받는 순수 프레젠테이션이다 — 상태를 이 컴포넌트로 끌어올리지 않은 이유는 두
 * 모달의 "카테고리를 바꾸면 하위 값 초기화" 로직이 폼 전체의 다른 state(links,
 * files 등)와 함께 각 모달의 handleCategoryChange에 있어야 하기 때문이다.
 */
export function CategoryFields({
  category,
  onCategoryChange,
  paperType,
  onPaperTypeChange,
  awarded,
  onAwardedChange,
  awardName,
  onAwardNameChange,
}: {
  category: AchievementCategory;
  onCategoryChange: (value: AchievementCategory) => void;
  paperType: PaperType;
  onPaperTypeChange: (value: PaperType) => void;
  awarded: boolean;
  onAwardedChange: (value: boolean) => void;
  awardName: string;
  onAwardNameChange: (value: string) => void;
}) {
  return (
    <>
      <div className="mb-[18px]">
        <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">카테고리 (선택)</p>
        <select
          name="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as AchievementCategory)}
          className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
        >
          <option value="">선택 안 함</option>
          <option value="논문">논문</option>
          <option value="공모전">공모전</option>
          <option value="프로젝트">프로젝트</option>
          <option value="창업">창업</option>
        </select>
      </div>

      {category === "논문" && (
        <div className="mb-[18px]">
          <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">논문 구분</p>
          <input type="hidden" name="paperType" value={paperType} />
          <div className="flex w-fit overflow-hidden rounded-button border border-border">
            <button
              type="button"
              onClick={() => onPaperTypeChange("KCI")}
              className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                paperType === "KCI" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
              }`}
            >
              KCI
            </button>
            <button
              type="button"
              onClick={() => onPaperTypeChange("SCI")}
              className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                paperType === "SCI" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
              }`}
            >
              SCI
            </button>
          </div>
        </div>
      )}

      {category === "공모전" && (
        <div className="mb-[18px]">
          <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">수상 여부</p>
          <input type="hidden" name="awarded" value={awarded ? "true" : "false"} />
          <div className="flex w-fit overflow-hidden rounded-button border border-border">
            <button
              type="button"
              onClick={() => onAwardedChange(false)}
              className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                !awarded ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
              }`}
            >
              미수상
            </button>
            <button
              type="button"
              onClick={() => onAwardedChange(true)}
              className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                awarded ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
              }`}
            >
              수상
            </button>
          </div>
          {awarded && (
            <input
              name="awardName"
              type="text"
              value={awardName}
              onChange={(e) => onAwardNameChange(e.target.value)}
              placeholder="예: 대상, 최우수상"
              className="mt-2 w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
            />
          )}
        </div>
      )}
    </>
  );
}
