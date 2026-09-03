import { MeetingCard, type Meeting } from "@/components/meetings/MeetingCard";
import { MeetingsSidebar } from "@/components/meetings/MeetingsSidebar";
import { SearchFilterBar } from "@/components/meetings/SearchFilterBar";

/**
 * playground-design/meetings.html의 .mtg-card 3건 정적 데이터.
 * 원본 <script>가 이 데이터를 조작하지 않고 filter-chip의 active 클래스만
 * 토글하므로 local constant로 유지한다(docs/MIGRATION.md 8절).
 */
const MEETINGS: Meeting[] = [
  {
    title: "KEPCO 과제 중간보고 준비 회의",
    date: "8월 28일 (목) 15:00",
    place: "302호",
    attendees: ["지", "연", "태", "민"],
    agenda: [
      "PPO 기반 Volt-VAR/Volt-Watt 제어 학습 진행상황 공유",
      "중간보고서 목차 및 분량 조율",
      "다음 분기 실험 계획 초안 검토",
    ],
    decisions: [
      "중간보고서는 9월 3일까지 초안 완성, 오지훈이 최종 취합 후 교수님 검토 요청",
      "다음 분기부터 ESS 용량별 시나리오 3종으로 실험 범위 확대",
    ],
    actions: [
      { text: "PPO 학습 로그 정리해서 공유 드라이브 업로드", avatar: "연", who: "김연구", due: "8/29 완료", done: true },
      { text: "중간보고서 초안 작성 (배경·방법론 파트)", avatar: "태", who: "강태윤", due: "9/3 D-3", dueVariant: "soon" },
      { text: "시나리오 3종 실험 설계안 작성", avatar: "민", who: "정민재", due: "9/6" },
    ],
    tag: "KEPCO 과제",
    recorder: "오지훈",
  },
  {
    title: "Playground 주간 정기회의",
    date: "8월 26일 (화) 19:00",
    place: "온라인",
    attendees: ["지", "연", "하", "준", "도", "민"],
    agenda: [
      "AI Rookie 본선 준비 방향 논의",
      "협업 플랫폼 요구사항 정의서 리뷰",
      "이번 주 개인별 우선순위 공유",
    ],
    decisions: [
      "본선 데모는 실시간 병상 현황 연동 기능까지 포함해서 준비하기로 확정",
      "협업 플랫폼은 요구사항 정의서 v0.2로 확정, 와이어프레임 작업 착수",
    ],
    actions: [
      { text: "요구사항 정의서 최종본 팀 채널 공유", avatar: "민", who: "정민재", due: "8/26 완료", done: true },
      { text: "병상 현황 연동 기능 기술 검토", avatar: "지", who: "오지훈", due: "9/1 지연", dueVariant: "late" },
    ],
    tag: "Playground",
    recorder: "정민재",
  },
  {
    title: "EDCL 팀 IDEC 2026 킥오프",
    date: "8월 21일 (금) 16:00",
    place: "EDCL 랩실",
    attendees: ["준", "연", "서"],
    agenda: [
      "MCU 없이 아날로그 회로로 색상 판별하는 방식 타당성 검토",
      "역할 분담 및 일정 수립",
    ],
    decisions: ["비교기(comparator) 기반 RGB 판별 회로로 방향 확정"],
    actions: [
      { text: "비교기 회로 1차 설계 및 브레드보드 테스트", avatar: "준", who: "박준서", due: "8/26 완료", done: true },
    ],
    tag: "IDEC 2026",
    recorder: "박준서",
  },
];

export default function MeetingsPage() {
  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">회의록 관리</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">회의록 관리</h1>
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
        >
          + 회의록 작성
        </button>
      </div>

      <SearchFilterBar />

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_300px] items-start gap-[22px] px-7 pt-5 pb-[90px] max-[960px]:grid-cols-1">
        <div>
          {MEETINGS.map((meeting) => (
            <MeetingCard key={meeting.title} meeting={meeting} />
          ))}
        </div>
        <MeetingsSidebar />
      </div>
    </>
  );
}
