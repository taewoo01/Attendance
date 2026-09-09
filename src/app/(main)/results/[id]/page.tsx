import Link from "next/link";
import { notFound } from "next/navigation";
import { AchievementFileLink } from "@/components/results/AchievementFileLink";
import { ResultDeleteButton } from "@/components/results/ResultDeleteButton";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getAchievementById, listAchievementFilesFor } from "@/lib/db/achievements";

// 목록과 동일하게 매 요청마다 렌더링한다(TASK-026 dynamic 설정과 동일 원칙).
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 실적 상세 페이지. 지금까지는 등록한 실적을 클릭해도 목록(#/results)의 압축된
 * 한 줄 정보 이상을 볼 방법이 없었다 — 클릭 시 모달이 아니라 별도 경로
 * (`/results/[id]`)로 이동해 전체 내용(설명 전체, 팀원, 참고 링크, 첨부파일
 * 전체 목록)을 보여준다. (main) route group 아래라 StatusBar/Footer를 그대로
 * 상속한다.
 */
export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // achievements.id는 uuid 컬럼이라 형식이 아니면 DB가 예외를 던진다 — 그 경우도
  // 404가 되게 쿼리 전에 먼저 막는다(존재하지 않는 id와 형식이 잘못된 id를 구분하지
  // 않고 둘 다 notFound()로 처리).
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const [user, achievement, files] = await Promise.all([
    getCurrentUser(),
    getAchievementById(id),
    listAchievementFilesFor(id),
  ]);

  if (!achievement) {
    notFound();
  }

  const isOwner = !!user && achievement.userId === user.id;

  return (
    <div className="mx-auto max-w-[720px] px-7 pt-[30px] pb-[90px]">
      <p className="m-0 font-mono text-xs text-silk-faint">
        <Link href="/results" className="hover:underline">
          PLAY GROUND / 실적 관리
        </Link>{" "}
        / <span className="text-teal">상세</span>
      </p>

      <div className="mt-4 overflow-hidden rounded-card border border-border bg-bg-panel">
        <div className="flex items-start justify-between gap-3 border-b border-border px-[22px] py-[18px]">
          <div className="flex flex-wrap items-center gap-[9px]">
            <h1 className="m-0 text-[19px] font-semibold text-silk">{achievement.title}</h1>
            <span
              className={`rounded-badge px-1.5 py-0.5 font-mono text-[9.5px] font-bold tracking-[0.03em] ${
                achievement.team ? "bg-amber-dim text-amber" : "bg-[rgba(72,217,176,0.14)] text-teal"
              }`}
            >
              {achievement.team ? "팀" : "개인"}
            </span>
          </div>
          {isOwner && <ResultDeleteButton id={achievement.id} redirectTo="/results" />}
        </div>

        <div className="px-[22px] py-5">
          <p className="m-0 mb-5 whitespace-pre-wrap text-[13.5px] leading-[1.65] text-silk-dim">
            {achievement.desc || "설명이 없습니다."}
          </p>

          <div className="grid grid-cols-2 gap-[14px] border-t border-border pt-4">
            <div>
              <p className="m-0 mb-1 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">담당자</p>
              <p className="m-0 text-[13.5px] text-silk">{achievement.who}</p>
            </div>
            <div>
              <p className="m-0 mb-1 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">날짜</p>
              <p className="m-0 text-[13.5px] text-silk">{achievement.resultDate}</p>
            </div>
            {achievement.team && achievement.teamMembers.length > 0 && (
              <div className="col-span-2">
                <p className="m-0 mb-1 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">팀원</p>
                <p className="m-0 text-[13.5px] text-silk">{achievement.teamMembers.join(", ")}</p>
              </div>
            )}
            {achievement.metricLabel && (
              <div>
                <p className="m-0 mb-1 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">
                  {achievement.metricLabel}
                </p>
                <p className="m-0 font-mono text-[15px] font-bold text-teal">{achievement.metricValue}</p>
              </div>
            )}
            {achievement.link && (
              <div>
                <p className="m-0 mb-1 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">참고 링크</p>
                <a
                  href={achievement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-[13px] text-teal hover:underline"
                >
                  {achievement.link}
                </a>
              </div>
            )}
          </div>

          {(files.length > 0 || achievement.file) && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">첨부파일</p>
              <div className="flex flex-col gap-1.5">
                {achievement.file && (
                  <span className="inline-flex items-center gap-[5px] font-mono text-[12px] text-silk-faint">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[12px] w-[12px] stroke-silk-faint">
                      <path d="M4 4h11l5 5v11H4z" />
                      <path d="M15 4v5h5" />
                    </svg>
                    {achievement.file}
                  </span>
                )}
                {files.map((f) => (
                  <AchievementFileLink key={f.id} fileId={f.id} name={f.name} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
