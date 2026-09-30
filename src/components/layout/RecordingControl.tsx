"use client";

import { formatElapsed, type RecordingControlState } from "@/lib/meetings/useRecordingControl";

/**
 * 상단바 녹음 버튼(데스크톱 칩). 실제 MediaRecorder 상태/로직은
 * useRecordingControl(StatusBarControls가 한 번만 호출)에서 받아 그리기만 한다 —
 * 모바일 배지/드로워 칩과 상태를 공유해야 해서(동시에 두 녹음이 잡히지 않게)
 * 이 컴포넌트 안에 두지 않았다.
 */
export function RecordingControl({ recording, pending, elapsedSeconds, error, start, stop }: RecordingControlState) {
  return (
    <div className="flex items-center gap-2">
      {recording && (
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#e2543f]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e2543f]" />
          {formatElapsed(elapsedSeconds)}
        </span>
      )}
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={pending}
        className={
          recording
            ? "flex cursor-pointer items-center gap-1.5 rounded-chip border border-[#e2543f] bg-[rgba(226,84,63,0.16)] px-2.5 py-[6px] font-mono text-[11.5px] font-semibold text-[#e2543f] disabled:cursor-not-allowed"
            : "flex cursor-pointer items-center gap-1.5 rounded-chip border border-border bg-bg-panel px-2.5 py-[6px] font-mono text-[11.5px] text-silk-dim hover:border-teal-dim hover:text-teal disabled:cursor-not-allowed"
        }
      >
        {pending ? "저장 중..." : recording ? "■ 종료" : "● 녹음"}
      </button>
      {error && <span className="max-w-[160px] font-mono text-[10.5px] text-[#e2543f]">{error}</span>}
    </div>
  );
}
