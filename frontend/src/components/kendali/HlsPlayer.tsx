"use client";

import Hls from "hls.js";
import { Loader2, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const RETRY_MS = 15_000;

function HlsVideo({ src, onFatal }: { src: string; onFatal: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"connecting" | "live" | "error">("connecting");

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let hls: Hls | null = null;
    const fail = () => {
      setState("error");
      onFatal();
    };
    const onPlaying = () => setState("live");
    // Rekaman diputar berulang dari titik acak agar kamera yang berbagi rekaman tidak tampil serempak.
    const seekRandom = () => {
      if (Number.isFinite(video.duration)) video.currentTime = Math.random() * video.duration;
    };
    video.addEventListener("playing", onPlaying);

    if (!/\.m3u8(\?|$)/i.test(src)) {
      video.loop = true;
      video.addEventListener("loadedmetadata", seekRandom, { once: true });
      video.addEventListener("error", fail);
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls({ liveSyncDurationCount: 3, maxBufferLength: 10, backBufferLength: 10 });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) fail();
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src; // Safari memutar HLS secara native.
      video.addEventListener("error", fail);
    } else {
      queueMicrotask(fail);
    }
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("loadedmetadata", seekRandom);
      video.removeEventListener("error", fail);
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, onFatal]);

  return (
    <>
      <video ref={ref} muted autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
      {state === "connecting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-white/60">
          <Loader2 className="h-6 w-6 animate-spin" />
          Menyambungkan…
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-xs text-white/70">
          <WifiOff className="h-6 w-6" />
          Sinyal terputus · mencoba lagi
        </div>
      )}
      {state === "live" && (
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white transition-opacity sm:group-hover:opacity-0">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bad" />
          LIVE
        </span>
      )}
    </>
  );
}

/** Pemutar CCTV: siaran HLS (.m3u8) atau berkas video biasa, dengan status sambung dan percobaan ulang otomatis. */
export default function HlsPlayer({ src }: { src: string }) {
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onFatal = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAttempt((a) => a + 1), RETRY_MS);
  }, []);

  return <HlsVideo key={`${src}#${attempt}`} src={src} onFatal={onFatal} />;
}
