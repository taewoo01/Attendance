"use client";

import { useEffect, useState } from "react";
import { deletePushSubscription, savePushSubscription } from "@/lib/push/actions";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** pushManager.subscribe()가 요구하는 Uint8Array 형식으로 base64url VAPID 공개키를 변환한다. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

type Status = "unsupported" | "checking" | "subscribed" | "unsubscribed";

function isPushSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window &&
    Boolean(VAPID_PUBLIC_KEY)
  );
}

/**
 * 알림 벨 드롭다운 상단에 얹는 "이 브라우저에서 데스크탑 알림 받기" 토글.
 * 로그인 계정이 아니라 "이 브라우저의 Service Worker 구독" 단위라 같은
 * 사람이 노트북/데스크탑 각각에서 따로 켜야 한다(기기별 독립 설정).
 * 구독 여부는 서버에 묻지 않고 브라우저의 pushManager.getSubscription()으로만
 * 판단한다 — 이 브라우저가 실제로 구독 중인지는 브라우저 자신이 제일 정확하다.
 */
export function PushSubscribeToggle() {
  // 지원 여부는 마운트 시점에 한 번만 동기적으로 알 수 있어 lazy initializer로
  // 바로 계산한다(effect 안에서 setState하면 불필요한 cascading render가 생긴다).
  const [status, setStatus] = useState<Status>(() => (isPushSupported() ? "checking" : "unsupported"));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "checking") return;
    let cancelled = false;
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((existing) => {
        if (!cancelled) setStatus(existing ? "subscribed" : "unsubscribed");
      })
      .catch(() => {
        if (!cancelled) setStatus("unsupported");
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  async function handleEnable() {
    setPending(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("브라우저 알림 권한이 거부됐습니다.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setError("알림 구독 정보를 가져오지 못했습니다.");
        return;
      }

      const result = await savePushSubscription({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        authKey: json.keys.auth,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("subscribed");
    } catch {
      setError("알림 설정 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function handleDisable() {
    setPending(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await deletePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("unsubscribed");
    } catch {
      setError("알림 해제 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  if (status === "unsupported") return null;

  return (
    <div className="border-b border-border px-4 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11.5px] text-silk-dim">이 브라우저 데스크탑 알림</span>
        <button
          type="button"
          onClick={status === "subscribed" ? handleDisable : handleEnable}
          disabled={pending || status === "checking"}
          className="shrink-0 cursor-pointer rounded-chip border border-border bg-transparent px-2.5 py-1 font-mono text-[10.5px] text-silk-faint hover:border-teal-dim hover:text-teal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "처리 중..." : status === "subscribed" ? "켜짐" : "켜기"}
        </button>
      </div>
      {error && <p className="m-0 mt-1.5 text-[10.5px] text-[#e2543f]">{error}</p>}
    </div>
  );
}
