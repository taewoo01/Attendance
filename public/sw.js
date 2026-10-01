// Web Push 전용 Service Worker. Next.js가 빌드하지 않는 정적 파일로 두고
// (Push API는 번들링이 필요 없는 저수준 브라우저 API) /sw.js로 그대로 서빙한다.
// skipWaiting/clients.claim은 등록 직후(첫 구독 시도 시점) 바로 active 상태가
// 되게 해서, 새로고침 없이도 pushManager.subscribe()가 곧장 동작하게 한다.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "PLAY GROUND", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "PLAY GROUND";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
