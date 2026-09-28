"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { PERIODS, REGIONS, type PeriodId, type RegionId } from "@/lib/dashboard/data";
import { toneText } from "@/lib/dashboard/format";

export type Tone = keyof typeof toneText;

export function Panel({
  title,
  subtitle,
  className = "",
  children,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`@container rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(22,27,46,0.04),0_4px_16px_-8px_rgba(22,27,46,0.08)] ${className}`}>
      {title && (
        <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {subtitle && <p className="text-xs text-subtle">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  valueTone,
  note,
  noteTone = "neutral",
}: {
  label: string;
  value: string;
  unit: string;
  valueTone?: Tone;
  note: string;
  noteTone?: Tone;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-5 py-4 shadow-[0_1px_2px_rgba(22,27,46,0.04),0_4px_16px_-8px_rgba(22,27,46,0.08)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">{label}</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className={`font-display text-4xl font-bold tabular-nums tracking-tight ${valueTone ? toneText[valueTone] : "text-ink"}`}>
          {value}
        </span>
        <span className="text-sm text-muted">{unit}</span>
      </p>
      <p className={`mt-1.5 font-mono text-xs ${toneText[noteTone]}`}>{note}</p>
    </div>
  );
}

export function LegendRow({ color, label, value, sub }: { color: string; label: string; value: string; sub?: string }) {
  return (
    <li className="py-1">
      <div className="flex items-center gap-2.5 text-[13px]">
        <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />
        <span className="flex-1 text-ink">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted">{value}</span>
      </div>
      {sub && <p className="ml-5 text-[11px] text-faint">{sub}</p>}
    </li>
  );
}

export interface RankItem {
  key: string;
  primary: string;
  secondary?: string;
  value: string;
  valueTone?: Tone;
  marker?: string;
}

export function RankList({ title, items, footnote, numbered = true }: { title: string; items: RankItem[]; footnote: string; numbered?: boolean }) {
  return (
    <Panel title={title} className="flex flex-col">
      <ol className="flex-1 divide-y divide-line">
        {items.map((it, i) => (
          <li key={it.key} className="flex items-center gap-3 py-2.5">
            {numbered && <span className="w-3 font-mono text-xs text-faint">{i + 1}</span>}
            {it.marker && <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: it.marker }} />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] text-ink" title={it.primary}>
                {it.primary}
              </p>
              {it.secondary && <p className="truncate text-[11px] text-faint">{it.secondary}</p>}
            </div>
            <span className={`font-mono text-[13px] font-medium tabular-nums ${it.valueTone ? toneText[it.valueTone] : "text-muted"}`}>
              {it.value}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] leading-relaxed text-faint">{footnote}</p>
    </Panel>
  );
}

export function FilterBar({
  region,
  period,
  onRegion,
  onPeriod,
}: {
  region: RegionId;
  period: PeriodId;
  onRegion: (r: RegionId) => void;
  onPeriod: (p: PeriodId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-3 text-sm text-muted">
        <span>Daerah</span>
        <span className="relative">
          <select
            value={region}
            onChange={(e) => onRegion(e.target.value as RegionId)}
            className="h-10 w-48 cursor-pointer appearance-none rounded-lg border border-line-strong bg-surface pl-3.5 pr-9 text-sm text-ink outline-none transition-colors hover:border-accent/50 focus-visible:border-accent"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        </span>
      </label>

      <div role="radiogroup" aria-label="Periode waktu" className="flex overflow-x-auto rounded-lg border border-line-strong bg-surface p-0.5">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            role="radio"
            aria-checked={period === p.id}
            onClick={() => onPeriod(p.id)}
            className={`h-9 whitespace-nowrap rounded-md px-4 text-sm transition-colors ${
              period === p.id ? "bg-accent font-semibold text-white" : "text-muted hover:bg-accent/10 hover:text-accent"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({ height }: { height: number }) {
  return <div className="w-full animate-pulse rounded-lg bg-raised" style={{ height }} />;
}

/**
 * Baris grid yang menyesuaikan lebar kolomnya sendiri (container query), bukan
 * lebar jendela browser, sehingga tetap rapi di berbagai tingkat zoom dan saat
 * panel notifikasi ikut memakan ruang.
 */
export function Row({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className="@container">
      <div className={`grid grid-cols-[minmax(0,1fr)] gap-5 ${className}`}>{children}</div>
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs text-subtle ${className}`}>
      <span>{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-line-strong bg-surface pl-3.5 pr-9 text-sm text-ink outline-none transition-colors hover:border-accent/50 focus-visible:border-accent"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      </span>
    </label>
  );
}

/** Notifikasi singkat di pojok layar; timer dibersihkan saat komponen dilepas. */
export function useToast(duration = 3000) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const show = useCallback(
    (msg: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );
  const node = message ? (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[2000] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-ok/30 bg-surface px-4 py-2.5 text-sm text-ink shadow-lg shadow-slate-900/10"
    >
      <CheckCircle2 className="h-4 w-4 text-ok" />
      {message}
    </div>
  ) : null;
  return { show, node };
}
