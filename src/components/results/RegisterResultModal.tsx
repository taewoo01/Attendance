"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CategoryFields } from "@/components/results/CategoryFields";
import { createAchievement } from "@/lib/results/actions";
import type { AchievementCategory, PaperType } from "@/lib/results/category";

/**
 * playground-design/results.html의 .page-head(제목+실적 등록 버튼)와
 * #resultModalOverlay(실적 등록 모달)를 함께 담당한다.
 * 버튼 클릭으로 모달을 열고 닫는 상태를 공유해야 해서 두 마크업을 한 Client
 * Component에서 원본과 동일한 DOM 순서(Fragment)로 반환한다.
 * 모달은 원본처럼 항상 마운트된 채 className으로 표시 여부만 토글한다
 * (display 토글형 — DESIGN-SYSTEM.md 10.3절, index.html의 fade형과 다름).
 * 실적 페이지 상세화 #3/#4: 원본은 "등록" 버튼이 저장 로직 없이 모달만 닫는
 * 정적 마크업이라(input에 name도 없었다) 등록해도 목록에 안 보이고, 모달을 다시
 * 열면 입력값이 그대로 남아있었다 — 실제 Server Action(createAchievement) 연결 +
 * 성공 시 form.reset()으로 두 문제를 함께 해결한다.
 * 실적 페이지 상세화 #5/#6: "날짜"는 자유 텍스트 대신 `type="date"` 피커로,
 * "담당자"는 하드코딩 기본값 대신 팀원 목록(`members`, page.tsx가 listProfiles()로
 * 조회해 내려준다) 드롭다운으로 바꿨다. 아직 이름을 입력하지 않은 팀원(온보딩
 * 미완료, profiles.name === "")은 목록에서 제외한다 — 안 그러면 그 사람의 빈
 * option이 "선택" placeholder(값도 "")와 값이 겹쳐 구분이 안 된다.
 * 실적 페이지 상세화 #7/#8: 첨부파일을 여러 개 선택할 수 있고(`multiple`), 선택한
 * 파일은 즉시 업로드하지 않고 `files` state로 들고 있다가 등록 시 한 번에 보낸다 —
 * 선택 목록에서 개별로 빼고(×) 다시 추가할 수 있어야 해서, 네이티브 input의
 * FileList를 그대로 쓰지 않고 배열로 직접 관리한다(그래서 이 input엔 `name`이
 * 없다 — 제출은 `files` state를 handleSubmit에서 FormData에 직접 append한다).
 * 참고링크 여러 개 등록: `links` state(문자열 배열, 항상 최소 한 칸 `[""]`로
 * 시작)로 입력칸 자체를 여러 개 렌더링한다 — "+" 버튼으로 칸을 추가하고, 각 칸
 * 옆의 ×로 뺄 수 있다(첨부파일 목록의 개별 제거 패턴과 동일). 빈 칸은 제출 시
 * actions.ts에서 걸러내므로 여기서는 입력 그대로 두고, 마지막 칸까지 지우면
 * 다시 빈 칸 하나를 유지해 "+"만으로도 첫 링크를 추가할 수 있게 한다.
 * 카테고리(논문/공모전/프로젝트/창업): select로 고르고, 선택값에 따라 하위 필드가
 * 나타난다 — "논문"이면 KCI/SCI 토글(구분 토글과 동일한 버튼 스타일, hidden input에
 * 값을 담아 제출), "공모전"이면 수상 여부 토글 + 수상 시에만 나타나는 수상명
 * 입력칸. 카테고리를 바꾸면 이전에 골랐던 하위 값(KCI/SCI, 수상 여부/명)은 의미가
 * 없어지므로 함께 초기화한다(서버도 category 불일치 시 무시하지만, 폼에 남아있는
 * 값이 다음 제출에 실수로 섞여 들어가는 걸 막기 위해 클라이언트에서도 리셋).
 */
export function RegisterResultModal({ members: allMembers }: { members: { userId: string; name: string }[] }) {
  const members = allMembers.filter((m) => m.name);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"personal" | "team">("personal");
  const [category, setCategory] = useState<AchievementCategory>("");
  const [paperType, setPaperType] = useState<PaperType>("KCI");
  const [awarded, setAwarded] = useState(false);
  const [awardName, setAwardName] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCategoryChange(value: AchievementCategory) {
    setCategory(value);
    setPaperType("KCI");
    setAwarded(false);
    setAwardName("");
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function closeModal() {
    setOpen(false);
    setType("personal");
    handleCategoryChange("");
    setLinks([""]);
    setFiles([]);
    setError(null);
  }

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

  function addFiles(picked: File[]) {
    if (picked.length === 0) return;
    setFiles((prev) => [...prev, ...picked]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);

    const formData = new FormData(form);
    for (const file of files) {
      formData.append("files", file);
    }

    const result = await createAchievement(formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    closeModal();
    router.refresh();
  }

  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">실적 관리</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">실적 관리</h1>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
        >
          + 실적 등록
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[100] items-center justify-center bg-[rgba(4,10,8,0.65)] p-5 ${
          open ? "flex" : "hidden"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-card border border-border bg-bg-panel">
          <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
            <h3 className="m-0 text-[14.5px] font-semibold">실적 등록</h3>
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <input type="hidden" name="kind" value={type} />

            <div className="px-[22px] pt-5 pb-[22px]">
              <div className="mb-[18px]">
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">제목</p>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="예: DC 리플 기반 SOH 추정 실험 완료"
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
                        <input type="checkbox" name="teamMembers" value={member.name} className="cursor-pointer accent-teal" />
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
                    defaultValue=""
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
                    placeholder="예: 오차"
                    className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                  />
                </div>
                <div>
                  <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">수치 지표 값 (선택)</p>
                  <input
                    name="metricValue"
                    type="text"
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
                <label
                  htmlFor="resFileInput"
                  className="inline-flex cursor-pointer items-center gap-[7px] rounded-button border border-dashed border-border bg-bg-raised px-[13px] py-[9px] text-[12.5px] text-silk-dim hover:border-teal-dim hover:text-silk"
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[13px] w-[13px] stroke-silk-faint">
                    <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                  <span>파일 선택 (여러 개 가능)</span>
                </label>
                <input
                  type="file"
                  id="resFileInput"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    e.target.value = "";
                    addFiles(picked);
                  }}
                />
                {files.length > 0 && (
                  <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
                    {files.map((file, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-input border border-border bg-bg-raised px-[12px] py-[7px] text-[12px] text-silk"
                      >
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
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

            <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border px-[22px] py-[14px]">
              <span className="font-mono text-[11px] text-silk-faint">등록한 실적은 팀 전체에 공유돼요</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "등록 중..." : "등록"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
