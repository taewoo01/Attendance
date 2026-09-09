import Link from "next/link";
import { AchievementFileLink } from "@/components/results/AchievementFileLink";
import { ResultDeleteButton } from "@/components/results/ResultDeleteButton";

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
  link?: string;
  date: string;
  metric?: { label: string; value: string };
};

type ResultListProps = {
  results: Result[];
  currentUserId?: string;
};

/**
 * playground-design/results.html의 .list-card 전체(헤더 + .res-row 목록).
 * 원본 <script>가 건드리지 않는 정적 영역이라 Server Component로 유지한다.
 * TASK-026: 하드코딩 7건 대신 실제 achievements를 page.tsx에서 조회해
 * props로 받는다. `tag`("개인"/"팀")는 `team`에서 파생해 렌더링 시 계산한다.
 */
export function ResultList({ results, currentUserId }: ResultListProps) {
  const personalCount = results.filter((r) => !r.team).length;
  const teamCount = results.filter((r) => r.team).length;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h3 className="m-0 text-[14.5px] font-semibold">이번 주 실적</h3>
        <span className="font-mono text-[11.5px] text-silk-faint">
          {results.length}건 등록 · 개인 {personalCount} / 팀 {teamCount}
        </span>
      </div>

      {results.map((r) => (
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
              {r.link && (
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[5px] text-teal hover:underline"
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[11px] w-[11px] stroke-teal">
                    <path d="M9 15l6-6M11 6h5a2 2 0 012 2v5M13 18H8a2 2 0 01-2-2v-5" />
                  </svg>
                  참고 링크
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 max-[640px]:col-span-2 max-[640px]:mt-2 max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-between max-[640px]:pl-12">
            <span className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-[11.5px] text-silk-faint">
              {r.date}
              {r.userId && r.userId === currentUserId && <ResultDeleteButton id={r.id} />}
            </span>
            {r.metric && (
              <span className="whitespace-nowrap rounded-chip border border-border bg-bg-raised px-2.5 py-[5px] font-mono text-[11.5px] font-bold text-teal">
                <span className="mr-[5px] font-medium text-silk-faint">{r.metric.label}</span>
                {r.metric.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
