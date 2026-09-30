"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createMeetingRecording } from "@/lib/meetings/recordings";

/**
 * RecordingControl.tsx(상단바 녹음 버튼)에서 뺀 순수 로직.
 * StatusBar는 모바일에서 데스크톱 칩(RecordingControl)과 상단바 배지(recording
 * 중일 때만) + 드로워 안의 칩, 이렇게 같은 상태를 여러 군데서 보여줘야 한다 —
 * MediaRecorder/스트림을 각자 따로 잡으면 동시에 두 녹음이 잡히는 사고가 나니
 * 이 훅을 StatusBar 한 곳에서만 호출하고, 화면들은 반환값을 props로 받아 그리기만
 * 한다(레이아웃이 unmount되지 않는 한 페이지 이동 중에도 녹음이 유지되는 건 기존과 동일).
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

export function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useRecordingControl() {
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

  async function start() {
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

  function stop() {
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

  return { recording, pending, elapsedSeconds, error, start, stop };
}

export type RecordingControlState = ReturnType<typeof useRecordingControl>;
