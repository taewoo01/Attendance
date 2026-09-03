import { AttendanceList } from "@/components/attendance/AttendanceList";
import { CheckinCard } from "@/components/attendance/CheckinCard";

/**
 * playground-design/attendance.html 변환.
 * 원본에 <script>가 없어 전체를 Server Component로 유지한다(체크인/체크아웃 버튼도
 * 원본에서 동작이 연결돼 있지 않고, 체크아웃 버튼은 원본에서도 disabled 정적 상태).
 */
export default function AttendancePage() {
  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">출석 인증</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">출석 인증</h1>
        </div>
        <p className="font-mono text-[12.5px] text-silk-dim">
          오늘 <b className="font-semibold text-teal">5 / 8명</b> 체크인 · 2026.08.31 (월)
        </p>
      </div>

      <div className="mx-auto grid max-w-[1220px] grid-cols-[360px_1fr] items-start gap-[22px] px-7 pt-[26px] pb-[90px] max-[860px]:grid-cols-1">
        <CheckinCard />
        <AttendanceList />
      </div>
    </>
  );
}
