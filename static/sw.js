/* ─────────────────────────────────────────────────────
   Aménagement Monzon — Service Worker v2
   Strategy: Cache-First for assets, Network-First for pages
───────────────────────────────────────────────────── */
const CACHE_VERSION = "monzon-v2";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE   = `${CACHE_VERSION}-images`;
const VIDEO_CACHE   = `${CACHE_VERSION}-video`;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",
];

const OFFLINE_PAGE = "./offline.html";

/* ── Install: pre-cache shell ── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: purge old caches ── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, VIDEO_CACHE].includes(k)
            )
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ── Fetch strategy ── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin analytics/sdk requests
  if (request.method !== "GET") return;
  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("supabase") ||
    url.hostname.includes("localhost")
  )
    return;

  // Images: Cache-First
  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            fetch(request)
              .then((res) => {
                if (res.ok) cache.put(request, res.clone());
                return res;
              })
              .catch(() => new Response("", { status: 404 }))
        )
      )
    );
    return;
  }

  // Videos / 3D assets: Cache-First with range support
  if (
    request.destination === "video" ||
    /\.(mp4|webm|glb|obj|gltf|hdr)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((res) => {
              if (res.ok && res.status === 200) cache.put(request, res.clone());
              return res;
            })
        )
      )
    );
    return;
  }

  // JS / CSS: Cache-First
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    /\.(js|css|woff2?|ttf)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((res) => {
              if (res.ok) cache.put(request, res.clone());
              return res;
            })
        )
      )
    );
    return;
  }

  // HTML / navigation: Network-First, offline fallback
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches
              .open(DYNAMIC_CACHE)
              .then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              caches.match(OFFLINE_PAGE)
          )
        )
    );
    return;
  }

  // Default: Network-First
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          caches.open(DYNAMIC_CACHE).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});

/* ── Background Sync ── */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-leads") {
    event.waitUntil(syncPendingLeads());
  }
  if (event.tag === "sync-contacts") {
    event.waitUntil(syncPendingContacts());
  }
});

async function syncPendingLeads() {
  const db = await openIDB();
  const pending = await db.getAll("pending-leads");
  for (const lead of pending) {
    try {
      // Would POST to API here
      await db.delete("pending-leads", lead.id);
    } catch (_) {}
  }
}

async function syncPendingContacts() {
  const db = await openIDB();
  const pending = await db.getAll("pending-contacts");
  for (const contact of pending) {
    try {
      await db.delete("pending-contacts", contact.id);
    } catch (_) {}
  }
}

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("monzon-sync", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("pending-leads"))
        db.createObjectStore("pending-leads", { keyPath: "id" });
      if (!db.objectStoreNames.contains("pending-contacts"))
        db.createObjectStore("pending-contacts", { keyPath: "id" });
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      resolve({
        getAll: (store) =>
          new Promise((res, rej) => {
            const tx = db.transaction(store, "readonly");
            const req = tx.objectStore(store).getAll();
            req.onsuccess = () => res(req.result);
            req.onerror = () => rej(req.error);
          }),
        delete: (store, id) =>
          new Promise((res, rej) => {
            const tx = db.transaction(store, "readwrite");
            const req = tx.objectStore(store).delete(id);
            req.onsuccess = () => res();
            req.onerror = () => rej(req.error);
          }),
      });
    };
    req.onerror = () => reject(req.error);
  });
}

/* ── Push Notifications ── */
self.addEventListener("push", (event) => {
  let data = { title: "Aménagement Monzon", body: "You have a new notification." };
  try {
    data = event.data ? event.data.json() : data;
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      tag: data.tag || "monzon-notification",
      data: data.url || "/",
      actions: [
        { action: "view", title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const match = clients.find((c) => c.url === url && "focus" in c);
        if (match) return match.focus();
        return self.clients.openWindow(url);
      })
  );
});

/* ── Update notification to clients ── */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
