"use client";

import { useState } from "react";
import type { HeatmapCell, HeatmapData } from "@/lib/dashboard/data";
import { LOAD_GRADIENT, loadColor, loadNeedsLightText, loadStatus } from "@/lib/dashboard/format";
import { Panel } from "./ui";

const SCALE_MAX = 115;

function Legend() {
  return (
    <div className="flex items-center gap-2.5 text-[11px] text-subtle">
      <span>Lancar</span>
      <div className="relative">
        <div className="h-2.5 w-40 rounded-sm" style={{ background: LOAD_GRADIENT }} />
        {[70, 100].map((p) => (
          <span
            key={p}
            className="absolute top-3 -translate-x-1/2 font-mono text-[10px] text-faint"
            style={{ left: `${(p / SCALE_MAX) * 100}%` }}
          >
            {p}%
          </span>
        ))}
      </div>
      <span>Macet</span>
    </div>
  );
}

export default function CongestionHeatmap({ data }: { data: HeatmapData }) {
  const [hover, setHover] = useState<HeatmapCell | null>(null);
  const readout = hover?.value != null ? `${hover.tip} · ${loadStatus(hover.value).label}` : hover?.tip || data.note;

  const cellProps = (cell: HeatmapCell) => ({
    title: cell.tip || undefined,
    onMouseEnter: () => setHover(cell),
    onMouseLeave: () => setHover(null),
  });

  return (
    <Panel title={data.title} subtitle={data.subtitle} className="flex flex-col">
      {data.layout === "calendar" ? (
        <div className="grid grid-cols-7 gap-1.5">
          {data.cols.map((c) => (
            <div key={c} className="pb-1 text-center text-[11px] text-subtle">
              {c}
            </div>
          ))}
          {data.cells.flat().map((cell, i) =>
            cell.text === undefined ? (
              <div key={i} />
            ) : (
              <div
                key={i}
                {...cellProps(cell)}
                className={`flex h-14 flex-col justify-between rounded-md p-1.5 transition-transform hover:scale-[1.04] ${
                  cell.value === null ? "border border-dashed border-line-strong" : ""
                } ${cell.highlight ? "ring-2 ring-ink" : ""}`}
                style={{ background: cell.value === null ? "transparent" : loadColor(cell.value) }}
              >
                <span
                  className={`text-xs font-semibold ${
                    cell.value === null ? "text-faint" : loadNeedsLightText(cell.value) ? "text-white" : "text-ink"
                  }`}
                >
                  {cell.text}
                </span>
                {cell.value !== null && (
                  <span className={`self-end font-mono text-[11px] ${loadNeedsLightText(cell.value) ? "text-white/90" : "text-ink/75"}`}>
                    {cell.value}%
                  </span>
                )}
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1">
          <div
            className="grid min-w-[560px] gap-[3px]"
            style={{ gridTemplateColumns: `auto repeat(${data.cols.length}, minmax(0, 1fr))` }}
          >
            {data.rows.map((row, r) => (
              <div key={row} className="contents">
                <div className="truncate pr-2 text-[11px] leading-5 text-muted" title={row}>
                  {row}
                </div>
                {data.cells[r].map((cell, c) => (
                  <div
                    key={c}
                    {...cellProps(cell)}
                    className="h-5 rounded-[3px] transition-[outline] hover:outline hover:outline-2 hover:outline-ink"
                    style={{ background: cell.value === null ? "transparent" : loadColor(cell.value) }}
                  />
                ))}
              </div>
            ))}
            <div />
            {data.colTicks.map((t, i) => (
              <div key={i} className="pt-1 font-mono text-[10px] text-faint">
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-start justify-between gap-x-6 gap-y-3 pt-5">
        <Legend />
        <p className="min-h-4 max-w-xl text-right text-[11px] leading-relaxed text-subtle" aria-live="polite">
          {readout}
        </p>
      </div>
    </Panel>
  );
}
