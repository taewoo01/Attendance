"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createMeetingRecording } from "@/lib/meetings/recordings";

/**
 * 상단바 녹음 버튼. StatusBar는 (main)/layout.tsx에서 한 번만 렌더링되고
 * 페이지 이동 시에도 unmount되지 않으므로(<main>{children}</main>만 바뀜),
 * 이 컴포넌트의 state(녹음 중인 MediaRecorder 등)도 페이지를 옮겨 다니는
 * 동안 그대로 유지된다 — "녹음하면서 다른 페이지에서도 작업할 수 있게"
 * 해달라는 요청을 별도의 전역 상태 관리 없이 컴포넌트 위치만으로 만족한다.
 * 종료하면 특정 회의록을 고르지 않고 바로 저장하고(meeting_recordings),
 * 회의록 페이지 사이드바(RecordingsCard)에 나타난다.
 */
const MIME_CANDIDATES: { mimeType: string; ext: string }[] = [
  { mimeType: "audio/webm;codecs=opus", ext: "webm" },
  { mimeType: "audio/webm", ext: "webm" },
  { mimeType: "audio/mp4", ext: "m4a" },
  { mimeType: "audio/ogg", ext: "ogg" },
];

// 음성 위주 녹음이라 낮은 비트레이트로도 충분하고, Storage 버킷 용량 제한(20MB)
// 안에서 더 긴 회의를 녹음할 수 있게 해준다(32kbps ≈ 20MB로 80분 안팎).
const AUDIO_BITS_PER_SECOND = 32000;

function pickMimeType(): { mimeType: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((c) => MediaRecorder.isTypeSupported(c.mimeType)) ?? null;
}

function extForMime(mimeType: string, fallback: string): string {
  if (mimeType.startsWith("audio/webm")) return "webm";
  if (mimeType.startsWith("audio/mp4")) return "m4a";
  if (mimeType.startsWith("audio/ogg")) return "ogg";
  return fallback;
}

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function RecordingControl() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsedRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // 컴포넌트가 unmount될 일은 거의 없지만(레이아웃에 상주), 혹시 모를 경우
    // 마이크를 계속 점유하지 않도록 정리한다.
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function handleStart() {
    setError(null);
    const picked = pickMimeType();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = picked
        ? new MediaRecorder(stream, { mimeType: picked.mimeType, audioBitsPerSecond: AUDIO_BITS_PER_SECOND })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => void handleRecorded(picked?.ext ?? "webm", recorder.mimeType);

      recorder.start();
      recorderRef.current = recorder;
      elapsedRef.current = 0;
      setElapsedSeconds(0);
      intervalRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSeconds(elapsedRef.current);
      }, 1000);
      setRecording(true);
    } catch {
      setError("마이크 권한이 필요합니다.");
    }
  }

  function handleStop() {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setRecording(false);
  }

  async function handleRecorded(fallbackExt: string, recorderMimeType: string) {
    const blob = new Blob(chunksRef.current, { type: recorderMimeType || "audio/webm" });
    chunksRef.current = [];
    if (blob.size === 0) return;

    const ext = extForMime(recorderMimeType, fallbackExt);

    setPending(true);
    const formData = new FormData();
    formData.append("recording", new File([blob], `recording.${ext}`, { type: blob.type }));
    formData.append("durationSeconds", String(elapsedRef.current));
    const result = await createMeetingRecording(formData);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

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
        onClick={recording ? handleStop : handleStart}
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
