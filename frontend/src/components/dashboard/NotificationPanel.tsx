"use client";

import Link from "next/link";
import { useState } from "react";
import type { DashboardNotification, NotificationTone } from "@/lib/dashboard/data";

const TONE: Record<NotificationTone, { bar: string; label: string; card: string }> = {
  critical: { bar: "border-t-bad", label: "text-bad", card: "bg-bad/[0.07]" },
  warning: { bar: "border-t-warn", label: "text-warn", card: "bg-raised" },
  info: { bar: "border-t-info", label: "text-info", card: "bg-raised" },
};

const NEW_WITHIN_MINUTES = 30;

function ago(minutes: number) {
  return minutes < 60 ? `${minutes} mnt` : `${Math.floor(minutes / 60)} jam`;
}

export default function NotificationPanel({ items, className = "" }: { items: DashboardNotification[]; className?: string }) {
  const [read, setRead] = useState<Set<string>>(new Set());
  const newCount = items.filter((n) => n.minutesAgo <= NEW_WITHIN_MINUTES && !read.has(n.id)).length;

  return (
    <aside className={`flex flex-col rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(22,27,46,0.04),0_4px_16px_-8px_rgba(22,27,46,0.08)] ${className}`}>
      <header className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-ink">Notifikasi</h2>
          {newCount > 0 && (
            <span className="rounded-full bg-bad px-2.5 py-0.5 font-mono text-[11px] font-medium text-white">{newCount} baru</span>
          )}
        </div>
        <p className="mt-1 text-xs text-subtle">Digabung per lokasi, diurutkan dari yang paling mendesak</p>
      </header>

      <ul className="-mr-2 grid max-h-[480px] flex-1 content-start gap-3 overflow-y-auto pr-2 md:grid-cols-2 2xl:max-h-none 2xl:grid-cols-1">
        {items.map((n) => {
          const tone = TONE[n.tone];
          const isRead = read.has(n.id);
          return (
            <li
              key={n.id}
              className={`rounded-lg border-t-2 px-4 py-3 transition-opacity ${tone.bar} ${tone.card} ${isRead ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${tone.label}`}>{n.category}</span>
                <span className="font-mono text-[11px] text-faint">{ago(n.minutesAgo)}</span>
              </div>
              <p className="mt-1.5 text-[13px] font-semibold leading-snug text-ink">{n.title}</p>
              {n.location && <p className={`mt-1 text-xs ${n.tone === "info" ? "text-muted" : tone.label} opacity-90`}>{n.location}</p>}
              <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">{n.detail}</p>
              {(n.hasRecommendation || !isRead) && (
                <div className="mt-3 flex gap-2">
                  {n.hasRecommendation && (
                    <Link
                      href="/kendali"
                      className="rounded-md bg-bad px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-bad/85"
                    >
                      Lihat rekomendasi
                    </Link>
                  )}
                  {!isRead && (
                    <button
                      onClick={() => setRead((prev) => new Set(prev).add(n.id))}
                      className="rounded-md border border-line-strong px-3 py-1.5 text-xs text-muted transition-colors hover:border-faint hover:text-ink"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-faint">
        Notifikasi yang berulang di lokasi yang sama digabung menjadi satu agar tidak menumpuk. Notifikasi informasi
        direkap dalam laporan harian.
      </p>
    </aside>
  );
}
