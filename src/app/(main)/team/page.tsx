import { FilterRow } from "@/components/team/FilterRow";
import { TeamGrid } from "@/components/team/TeamGrid";

export default function TeamPage() {
  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">팀 소개</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">팀원 소개</h1>
          <p className="m-0 mt-1 text-[13px] text-silk-dim">Team VAMOS · AI Solution Team Playground</p>
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
        >
          + 프로필 편집
        </button>
      </div>

      <FilterRow />
      <TeamGrid />
    </>
  );
}
