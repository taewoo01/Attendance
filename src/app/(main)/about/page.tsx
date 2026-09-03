import { BusinessItems } from "@/components/about/BusinessItems";
import { HistoryTimeline } from "@/components/about/HistoryTimeline";
import { StatsStrip } from "@/components/about/StatsStrip";
import { VisionMission } from "@/components/about/VisionMission";

/**
 * playground-design/about.html에는 <script> 태그가 없어 페이지 전체가
 * 순수 정적 마크업이다. 그대로 Server Component로 유지한다.
 * StatusBar 우측의 share-chip variant는 공유 StatusBar 컴포넌트에서
 * pathname 기반으로 처리한다(src/components/layout/StatusBar.tsx 참고).
 */
export default function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-[1220px] px-7 pt-[70px] pb-[50px] text-center">
        <p className="m-0 mb-5 inline-flex items-center gap-2 font-mono text-[12.5px] text-teal">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          COMPANY INTRODUCTION
        </p>
        <h1 className="m-0 mb-[18px] text-[42px] font-bold leading-[1.25]">
          현장의 <span className="text-teal">배터리·전력 데이터</span>를
          <br />
          AI로 연결하는 팀, PLAY GROUND
        </h1>
        <p className="mx-auto max-w-[56ch] text-[15.5px] leading-[1.7] text-silk-dim">
          전자공학부 학부생들이 모여 배터리 관리 시스템(BMS)과 전력전자, AI를 접목해 실제 문제를 푸는
          창업팀입니다. 연구실에서 시작한 기술을 현장에 닿는 제품으로 만듭니다.
        </p>
      </div>

      <VisionMission />
      <BusinessItems />
      <HistoryTimeline />
      <StatsStrip />
    </>
  );
}
