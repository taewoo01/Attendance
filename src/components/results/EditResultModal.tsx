"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CategoryFields } from "@/components/results/CategoryFields";
import { updateAchievement } from "@/lib/results/actions";
import type { AchievementCategory, PaperType } from "@/lib/results/category";

export type EditableAchievement = {
  id: string;
  team: boolean;
  title: string;
  desc: string;
  who: string;
  teamMembers: string[];
  /** ISO 날짜("YYYY-MM-DD") — type="date" input의 defaultValue로 그대로 쓴다. */
  resultDate: string;
  metricLabel: string;
  metricValue: string;
  links: string[];
  files: { id: string; name: string }[];
  /** "" | "논문" | "공모전" | "프로젝트" | "창업" */
  category: string;
  /** category === "논문"일 때만 의미 있음. "" | "KCI" | "SCI". */
  paperType: string;
  awarded: boolean;
  awardName: string;
};

/**
 * RegisterResultModal의 수정판. IdeaCard/EditIdeaModal과 동일한 패턴 —
 * 목록/상세 페이지에서 본인 소유 실적에만 렌더링되는 "수정" 버튼(ResultEditButton)이
 * 이 모달을 연다. RegisterResultModal과 달리 항상 열린 채로 마운트된다(부모가
 * `editing &&`로 마운트/언마운트를 제어 — display 토글이 아니라 실제 언마운트라
 * 닫힐 때 state를 따로 리셋할 필요가 없다).
 * 첨부파일은 "기존 파일 제거"와 "새 파일 추가"를 함께 다룬다 — 기존 파일은
 * `removedFileIds`에 모아 제출 시 hidden input(removeFileIds)으로 보내고,
 * 새 파일은 RegisterResultModal과 동일하게 `files` state로 들고 있다가
 * FormData에 직접 append한다.
 */
export function EditResultModal({
  achievement,
  members: allMembers,
  onClose,
}: {
  achievement: EditableAchievement;
  members: { userId: string; name: string }[];
  onClose: () => void;
}) {
  const members = allMembers.filter((m) => m.name);
  const router = useRouter();
  const [type, setType] = useState<"personal" | "team">(achievement.team ? "team" : "personal");
  const [category, setCategory] = useState<AchievementCategory>((achievement.category as AchievementCategory) || "");
  const [paperType, setPaperType] = useState<PaperType>(achievement.paperType === "SCI" ? "SCI" : "KCI");
  const [awarded, setAwarded] = useState(achievement.awarded);
  const [awardName, setAwardName] = useState(achievement.awardName);
  const [links, setLinks] = useState<string[]>(achievement.links.length > 0 ? achievement.links : [""]);
  const [existingFiles, setExistingFiles] = useState(achievement.files);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCategoryChange(value: AchievementCategory) {
    setCategory(value);
    setPaperType("KCI");
    setAwarded(false);
    setAwardName("");
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function addLink() {
    setLinks((prev) => [...prev, ""]);
  }

  function updateLink(index: number, value: string) {
    setLinks((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function removeLink(index: number) {
    setLinks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
  }

  function removeExistingFile(id: string) {
    setExistingFiles((prev) => prev.filter((f) => f.id !== id));
    setRemovedFileIds((prev) => [...prev, id]);
  }

  function addNewFiles(picked: File[]) {
    if (picked.length === 0) return;
    setNewFiles((prev) => [...prev, ...picked]);
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);

    const formData = new FormData(form);
    for (const file of newFiles) {
      formData.append("files", file);
    }

    const result = await updateAchievement(achievement.id, formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-card border border-border bg-bg-panel">
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
          <h3 className="m-0 text-[14.5px] font-semibold">실적 수정</h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="kind" value={type} />
          {removedFileIds.map((id) => (
            <input key={id} type="hidden" name="removeFileIds" value={id} />
          ))}

          <div className="px-[22px] pt-5 pb-[22px]">
            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">제목</p>
              <input
                name="title"
                type="text"
                required
                defaultValue={achievement.title}
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">구분</p>
              <div className="flex w-fit overflow-hidden rounded-button border border-border">
                <button
                  type="button"
                  onClick={() => setType("personal")}
                  className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                    type === "personal" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
                  }`}
                >
                  개인
                </button>
                <button
                  type="button"
                  onClick={() => setType("team")}
                  className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                    type === "team" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
                  }`}
                >
                  팀
                </button>
              </div>
            </div>

            <CategoryFields
              category={category}
              onCategoryChange={handleCategoryChange}
              paperType={paperType}
              onPaperTypeChange={setPaperType}
              awarded={awarded}
              onAwardedChange={setAwarded}
              awardName={awardName}
              onAwardNameChange={setAwardName}
            />

            {type === "team" && (
              <div className="mb-[18px]">
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">팀원</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-input border border-border bg-bg-raised px-[14px] py-[11px]">
                  {members.map((member) => (
                    <label key={member.userId} className="flex cursor-pointer items-center gap-[6px] text-[13px] text-silk">
                      <input
                        type="checkbox"
                        name="teamMembers"
                        value={member.name}
                        defaultChecked={achievement.teamMembers.includes(member.name)}
                        className="cursor-pointer accent-teal"
                      />
                      {member.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">설명</p>
              <textarea
                name="desc"
                defaultValue={achievement.desc}
                placeholder="무엇을 했는지 간단히 설명해주세요"
                className="min-h-[88px] w-full resize-y rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">담당자</p>
                <select
                  name="who"
                  required
                  defaultValue={achievement.who}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                >
                  <option value="" disabled>
                    선택
                  </option>
                  {members.map((member) => (
                    <option key={member.userId} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">날짜</p>
                <input
                  name="resultDate"
                  type="date"
                  required
                  defaultValue={achievement.resultDate}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">수치 지표 라벨 (선택)</p>
                <input
                  name="metricLabel"
                  type="text"
                  defaultValue={achievement.metricLabel}
                  placeholder="예: 오차"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">수치 지표 값 (선택)</p>
                <input
                  name="metricValue"
                  type="text"
                  defaultValue={achievement.metricValue}
                  placeholder="예: 2.8%"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-[18px]">
              <div className="mb-2 flex items-center justify-between">
                <p className="m-0 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">참고 링크 (선택)</p>
                <button
                  type="button"
                  onClick={addLink}
                  className="cursor-pointer rounded-button border border-border bg-transparent px-2 py-0.5 text-[13px] leading-none text-silk-dim hover:border-teal-dim hover:text-silk"
                  aria-label="참고 링크 칸 추가"
                >
                  +
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {links.map((value, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      name="links"
                      type="url"
                      value={value}
                      onChange={(e) => updateLink(i, e.target.value)}
                      placeholder="예: https://github.com/team/repo/pull/12"
                      className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        aria-label="참고 링크 칸 제거"
                        className="shrink-0 cursor-pointer border-none bg-transparent px-1 text-lg leading-none text-silk-faint hover:text-[#e2543f]"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">첨부파일 (선택)</p>
              {existingFiles.length > 0 && (
                <ul className="m-0 mb-2 flex list-none flex-col gap-1.5 p-0">
                  {existingFiles.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between gap-2 rounded-input border border-border bg-bg-raised px-[12px] py-[7px] text-[12px] text-silk"
                    >
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(file.id)}
                        aria-label="첨부파일 제거"
                        className="shrink-0 cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f]"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label
                htmlFor="resEditFileInput"
                className="inline-flex cursor-pointer items-center gap-[7px] rounded-button border border-dashed border-border bg-bg-raised px-[13px] py-[9px] text-[12.5px] text-silk-dim hover:border-teal-dim hover:text-silk"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[13px] w-[13px] stroke-silk-faint">
                  <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                <span>파일 추가 (여러 개 가능)</span>
              </label>
              <input
                type="file"
                id="resEditFileInput"
                multiple
                className="hidden"
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  addNewFiles(picked);
                }}
              />
              {newFiles.length > 0 && (
                <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
                  {newFiles.map((file, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-input border border-border bg-bg-raised px-[12px] py-[7px] text-[12px] text-silk"
                    >
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        aria-label="첨부파일 제거"
                        className="shrink-0 cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f]"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && <p className="m-0 mt-[14px] font-mono text-[11px] text-[#e2543f]">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-[22px] py-[14px]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
