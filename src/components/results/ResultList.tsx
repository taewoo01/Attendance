import Link from "next/link";
import { AchievementFileLink } from "@/components/results/AchievementFileLink";
import { ResultDeleteButton } from "@/components/results/ResultDeleteButton";
import { ResultEditButton } from "@/components/results/ResultEditButton";
import { formatCategoryLabel } from "@/lib/results/category";

export type Result = {
  id: string;
  /** 삭제 버튼 노출 여부 판단용(currentUserId와 비교) — 등록 기능이 없던 시절 값에는 없을 수 있다. */
  userId?: string;
  avatar: string;
  team: boolean;
  title: string;
  desc: string;
  who: string;
  /** team이 true일 때만 의미가 있다 — "담당자"(who) 외 참여한 팀원 목록. */
  teamMembers?: string[];
  /** 등록 기능이 없던 시절 값이 들어간 옛 실적에만 남아있는 단일 첨부(레거시, 다운로드 불가). */
  file: string;
  /** 실적 페이지 상세화 #8: 실적 하나에 여러 개 첨부 가능(achievement_files). */
  files?: { id: string; name: string }[];
  /** 실적 페이지 상세화: 참고 링크 여러 개 등록 가능(achievements.links). */
  links?: string[];
  /** "" | "논문" | "공모전" | "프로젝트" | "창업" */
  category: string;
  /** category === "논문"일 때만 의미 있음. "" | "KCI" | "SCI". */
  paperType: string;
  awarded: boolean;
  awardName: string;
  /** 표시용 파생값("8월 31일 (월)"). 기간 필터링은 dateKey(ISO)로 한다. */
  date: string;
  /** ISO 날짜("YYYY-MM-DD") — ResultsBoard가 주간/월간 기간 필터링에 쓴다. */
  dateKey: string;
  metric?: { label: string; value: string };
};

type ResultListProps = {
  results: Result[];
  currentUserId?: string;
  /** 현재 선택된 기간을 반영한 헤더 문구(예: "이번 주 실적"/"이번 달 실적") — ResultsBoard가 계산해 내려준다. */
  heading: string;
  /** 본인 소유 실적의 수정 모달(EditResultModal)이 담당자/팀원 선택지로 쓴다. */
  members: { userId: string; name: string }[];
};

/**
 * playground-design/results.html의 .list-card 전체(헤더 + .res-row 목록).
 * 컴포넌트 자체는 훅이 없는 순수 프레젠테이션이라(하드코딩 헤더 문구만 있던
 * 원본과 달리 이제 heading을 prop으로 받는다) 이제는 ResultsBoard(client)
 * 안에서 필터링된 results로 렌더링된다 — 기간(주간/월간) 필터링 자체는
 * ResultsBoard가 담당한다.
 * TASK-026: 하드코딩 7건 대신 실제 achievements를 page.tsx에서 조회해
 * props로 받는다. `tag`("개인"/"팀")는 `team`에서 파생해 렌더링 시 계산한다.
 */
export function ResultList({ results, currentUserId, heading, members }: ResultListProps) {
  const personalCount = results.filter((r) => !r.team).length;
  const teamCount = results.filter((r) => r.team).length;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h3 className="m-0 text-[14.5px] font-semibold">{heading}</h3>
        <span className="font-mono text-[11.5px] text-silk-faint">
          {results.length}건 등록 · 개인 {personalCount} / 팀 {teamCount}
        </span>
      </div>

      {results.map((r) => {
        const categoryLabel = formatCategoryLabel(r);

        return (
        <div
          key={r.id}
          className="grid grid-cols-[40px_1fr_auto] items-start gap-[14px] border-b border-border px-[22px] py-[17px] last:border-b-0 hover:bg-[rgba(231,239,236,0.02)] max-[640px]:grid-cols-[34px_1fr]"
        >
          <div
            className={`mt-px flex h-[34px] w-[34px] items-center justify-center rounded-full font-mono text-xs font-bold ${
              r.team ? "bg-amber-dim text-amber" : "bg-[rgba(72,217,176,0.14)] text-teal"
            }`}
          >
            {r.avatar}
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-[9px]">
              <Link href={`/results/${r.id}`} className="text-sm font-semibold text-silk hover:underline">
                {r.title}
              </Link>
              <span
                className={`rounded-badge px-1.5 py-0.5 font-mono text-[9.5px] font-bold tracking-[0.03em] ${
                  r.team ? "bg-amber-dim text-amber" : "bg-[rgba(72,217,176,0.14)] text-teal"
                }`}
              >
                {r.team ? "팀" : "개인"}
              </span>
              {categoryLabel && (
                <span className="rounded-badge border border-border bg-bg-raised px-1.5 py-0.5 font-mono text-[9.5px] font-bold tracking-[0.03em] text-silk-dim">
                  {categoryLabel}
                </span>
              )}
            </div>
            <p className="m-0 mb-2 max-w-[64ch] text-[12.5px] leading-[1.55] text-silk-dim">{r.desc}</p>
            <div className="flex flex-wrap items-center gap-[14px] font-mono text-[11px] text-silk-faint">
              <span className="text-silk-dim">
                {r.who}
                {r.teamMembers && r.teamMembers.length > 0 && ` · 팀원: ${r.teamMembers.join(", ")}`}
              </span>
              {r.file && (
                <span className="inline-flex items-center gap-[5px]">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[11px] w-[11px] stroke-silk-faint">
                    <path d="M4 4h11l5 5v11H4z" />
                    <path d="M15 4v5h5" />
                  </svg>
                  {r.file}
                </span>
              )}
              {r.files?.map((f) => <AchievementFileLink key={f.id} fileId={f.id} name={f.name} />)}
              {r.links?.map((link, i) => (
                <a
                  key={link + i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[5px] text-teal hover:underline"
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[11px] w-[11px] stroke-teal">
                    <path d="M9 15l6-6M11 6h5a2 2 0 012 2v5M13 18H8a2 2 0 01-2-2v-5" />
                  </svg>
                  참고 링크{r.links && r.links.length > 1 ? ` ${i + 1}` : ""}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 max-[640px]:col-span-2 max-[640px]:mt-2 max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-between max-[640px]:pl-12">
            <span className="inline-flex items-center gap-2.5 whitespace-nowrap font-mono text-[11.5px] text-silk-faint">
              {r.date}
              {r.userId && r.userId === currentUserId && (
                <>
                  <ResultEditButton
                    achievement={{
                      id: r.id,
                      team: r.team,
                      title: r.title,
                      desc: r.desc,
                      who: r.who,
                      teamMembers: r.teamMembers ?? [],
                      resultDate: r.dateKey,
                      metricLabel: r.metric?.label ?? "",
                      metricValue: r.metric?.value ?? "",
                      links: r.links ?? [],
                      files: r.files ?? [],
                      category: r.category,
                      paperType: r.paperType,
                      awarded: r.awarded,
                      awardName: r.awardName,
                    }}
                    members={members}
                  />
                  <ResultDeleteButton id={r.id} />
                </>
              )}
            </span>
            {r.metric && (
              <span className="whitespace-nowrap rounded-chip border border-border bg-bg-raised px-2.5 py-[5px] font-mono text-[11.5px] font-bold text-teal">
                <span className="mr-[5px] font-medium text-silk-faint">{r.metric.label}</span>
                {r.metric.value}
              </span>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
}
