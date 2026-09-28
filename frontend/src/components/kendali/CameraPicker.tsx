"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AREAS, type Area, type MapPoint } from "@/lib/dashboard/data";
import { STATUS_STYLE } from "@/components/peta/status";

const CAM_NOTE = { sehat: "", menurun: "kualitas menurun", mati: "tidak mengirim data" } as const;

export default function CameraPicker({
  cameras,
  slotIndex,
  shownIn,
  onPick,
  onClose,
}: {
  cameras: MapPoint[];
  slotIndex: number;
  /** id kamera → nomor slot (1-based) yang sedang menampilkannya. */
  shownIn: Map<string, number>;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<Area | "semua">("semua");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const match = cameras.filter(
      (c) =>
        (area === "semua" || c.area === area) &&
        (!q || `${c.name} ${c.camera} ${c.road} ${c.area}`.toLowerCase().includes(q)),
    );
    return AREAS.map((a) => ({ area: a, items: match.filter((c) => c.area === a) })).filter((g) => g.items.length);
  }, [cameras, area, q]);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="fixed inset-0 z-[1500] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Pilih kamera untuk layar ${slotIndex + 1}`}
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-t-xl bg-surface shadow-2xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div>
            <p className="font-semibold">Pilih kamera untuk layar {slotIndex + 1}</p>
            <p className="text-xs text-subtle">Grup video wall akan berubah menjadi Manual</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="rounded-md p-1.5 text-subtle hover:bg-raised hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 border-b border-line px-5 py-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari simpang, ruas, atau ID kamera…"
              className="h-10 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-3 text-sm outline-none focus:border-accent"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(["semua", ...AREAS] as const).map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  area === a ? "border-accent bg-accent/10 font-medium text-accent" : "border-line text-muted hover:border-accent/50 hover:text-accent"
                }`}
              >
                {a === "semua" ? "Semua" : a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {total === 0 && <p className="px-3 py-8 text-center text-sm text-subtle">Tidak ada kamera yang cocok.</p>}
          {groups.map((g) => (
            <div key={g.area} className="mb-2">
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                {g.area} · {g.items.length}
              </p>
              {g.items.map((c) => {
                const slot = shownIn.get(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => onPick(c.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent/10"
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${c.status === "mati" ? "border-2 bg-white" : ""}`}
                      style={c.status === "mati" ? { borderColor: STATUS_STYLE.mati.color } : { background: STATUS_STYLE[c.status].color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{c.name}</span>
                      <span className="block truncate text-[11px] text-subtle">
                        <span className="font-mono">{c.camera}</span>
                        {CAM_NOTE[c.camStatus] && ` · ${CAM_NOTE[c.camStatus]}`}
                        {c.status !== "mati" && ` · ${STATUS_STYLE[c.status].label.toLowerCase()} ${c.speed} km/j`}
                      </span>
                    </span>
                    {slot !== undefined && (
                      <span className="shrink-0 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">layar {slot}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
