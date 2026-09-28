"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { getMapData, type MapPoint, type PeriodId, type RegionId } from "@/lib/dashboard/data";
import { fmt } from "@/lib/dashboard/format";
import { FilterBar, Panel } from "@/components/dashboard/ui";
import { STATUS_STYLE } from "@/components/peta/status";

// Leaflet membutuhkan `window`, jadi peta hanya dirender di browser.
const TitikMap = dynamic(() => import("@/components/peta/TitikMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full animate-pulse items-center justify-center bg-raised text-sm text-subtle">
      Memuat peta…
    </div>
  ),
});

const ORDER: MapPoint["status"][] = ["lancar", "padat", "macet", "mati"];

export default function PetaKondisiPage() {
  const [region, setRegion] = useState<RegionId>("bodebek");
  const [period, setPeriod] = useState<PeriodId>("harian");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const data = useMemo(() => getMapData(region, period), [region, period]);
  const { summary } = data;

  const changeRegion = (r: RegionId) => {
    setSelectedId(null);
    setRegion(r);
  };
  const toggle = (id: string) => setSelectedId((cur) => (cur === id ? null : id));

  return (
    <div className="-m-6 min-h-[calc(100%+3rem)] bg-canvas p-4 text-ink sm:p-6 lg:p-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight sm:text-3xl">
            Peta Lalu Lintas dan Ketersediaan CCTV
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {summary.total} titik pantau {region === "bodebek" ? "Bodebek" : data.regionLabel} · persimpangan utama ·{" "}
            {data.periodLabel} · diperbarui 5 menit lalu
          </p>
        </div>
        <FilterBar region={region} period={period} onRegion={changeRegion} onPeriod={setPeriod} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Peta */}
        <section className="relative h-[520px] overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(22,27,46,0.04),0_4px_16px_-8px_rgba(22,27,46,0.08)] xl:h-[calc(100vh-12rem)] xl:min-h-[560px]">
          <TitikMap points={data.points} fitKey={region} selectedId={selectedId} onSelect={toggle} />
          <div className="pointer-events-none absolute bottom-4 left-4 z-[500] flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg border border-line bg-surface/95 px-3.5 py-2.5 text-xs text-muted shadow-sm backdrop-blur">
            {ORDER.map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${s === "mati" ? "border-2 bg-white" : ""}`}
                  style={s === "mati" ? { borderColor: STATUS_STYLE[s].color } : { background: STATUS_STYLE[s].color }}
                />
                {STATUS_STYLE[s].label}
              </span>
            ))}
          </div>
        </section>

        {/* Panel samping */}
        <div className="flex flex-col gap-5">
          <Panel title={`Ringkasan ${summary.total} titik`}>
            <ul className="space-y-4">
              {ORDER.map((s) => {
                const share = (summary[s] / summary.total) * 100;
                return (
                  <li key={s}>
                    <div className="mb-1.5 flex items-center gap-2.5 text-[13px]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_STYLE[s].color }} />
                      <span className="flex-1">{STATUS_STYLE[s].label}</span>
                      <span className={`font-display text-xl font-bold tabular-nums ${s === "macet" ? "text-bad" : ""}`}>
                        {summary[s]}
                      </span>
                      <span className="w-12 text-right font-mono text-xs text-subtle">{fmt(share, 1)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-raised">
                      <div className="h-full rounded-full" style={{ width: `${share}%`, background: STATUS_STYLE[s].color }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-subtle">
              Ambang beban jalan: lancar di bawah 70% kapasitas, padat 70–100%, macet di atas 100%. {data.statusCaption}
            </p>
          </Panel>

          <Panel title="Titik paling kritis" className="flex-1">
            <ul className="divide-y divide-line">
              {data.critical.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => toggle(p.id)}
                    className={`-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-accent/10 ${
                      selectedId === p.id ? "bg-accent/10" : ""
                    }`}
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_STYLE[p.status].color }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{p.name}</span>
                      <span className="block truncate text-[11px] text-faint">beban {p.load}% kapasitas</span>
                    </span>
                    <span className="font-mono text-[13px] tabular-nums" style={{ color: STATUS_STYLE[p.status].color }}>
                      {fmt(p.speed)} km/j
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="mb-2 mt-6 text-[15px] font-semibold">Kamera tidak mengirim data</h3>
            <ul className="divide-y divide-line">
              {data.offline.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => toggle(p.id)}
                    className={`-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-accent/10 ${
                      selectedId === p.id ? "bg-accent/10" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[13px]">{p.camera}</span>
                      <span className="block truncate text-[11px] text-faint">{p.name}</span>
                    </span>
                    <span className="font-mono text-xs text-subtle">{p.offlineFor}</span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-4 rounded-lg bg-raised px-3.5 py-3 text-[11px] leading-relaxed text-subtle">
              Titik dengan kamera mati tetap ditampilkan di peta dengan tanda silang, bukan dihilangkan, supaya lubang
              cakupan terlihat dan tidak dikira lancar. Klik titik di daftar atau di peta untuk melihat detailnya.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
