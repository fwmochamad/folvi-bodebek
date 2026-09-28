"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { VEHICLE_CLASSES, type SeriesPoint } from "@/lib/dashboard/data";
import { fmt } from "@/lib/dashboard/format";

const COLOR = {
  grid: "#e7eaf0",
  axis: "#7a8194",
  card: "#ffffff",
  accent: "#dd6a2f",
  info: "#3d6fdc",
  bad: "#dc4848",
};

const tick = { fill: COLOR.axis, fontSize: 11, fontFamily: "var(--font-mono)" };

function TooltipBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-44 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg shadow-slate-900/10">
      <p className="mb-1.5 font-medium text-ink">{title}</p>
      {children}
    </div>
  );
}

function TooltipRow({ color, label, value }: { color?: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5 text-muted">
      {color && <span className="h-2 w-2 rounded-sm" style={{ background: color }} />}
      <span className="flex-1">{label}</span>
      <span className="font-mono tabular-nums text-ink">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Donut({
  data,
  center,
  size = 150,
}: {
  data: { name: string; value: number; color: string }[];
  center: ReactNode;
  size?: number;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={size * 0.32}
          outerRadius={size / 2}
          startAngle={90}
          endAngle={-270}
          stroke={COLOR.card}
          strokeWidth={2}
          isAnimationActive={false}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------

type LabelFormatter = (label: string) => string;

export function VolumeByClassChart({
  series,
  ticks,
  unit,
  formatLabel,
}: {
  series: SeriesPoint[];
  ticks: string[];
  unit: string;
  formatLabel: LabelFormatter;
}) {
  const data = series.map((p) => {
    const row: Record<string, number | string> = { label: p.label, total: p.total / 1000 };
    for (const { key } of VEHICLE_CLASSES) row[key] = p[key] / 1000;
    return row;
  });
  const digits = data.length > 0 && Math.max(...data.map((d) => Number(d.total))) >= 1000 ? 0 : 1;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
          <CartesianGrid stroke={COLOR.grid} vertical={false} />
          <XAxis dataKey="label" ticks={ticks} interval={0} tickFormatter={(v: string) => v.split(" ")[0]} tick={tick} axisLine={false} tickLine={false} dy={6} />
          <YAxis
            tick={tick}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => fmt(v)}
            label={{ value: unit, angle: -90, position: "insideLeft", fill: COLOR.axis, fontSize: 11, dx: -2, dy: 40 }}
          />
          <Tooltip
            cursor={{ stroke: COLOR.axis, strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as Record<string, number | string> | undefined;
              if (!active || !row) return null;
              return (
                <TooltipBox title={formatLabel(String(row.label))}>
                  {[...VEHICLE_CLASSES].reverse().map((c) => (
                    <TooltipRow key={c.key} color={c.color} label={c.label} value={fmt(Number(row[c.key]), digits)} />
                  ))}
                  <div className="mt-1 border-t border-line-strong pt-1">
                    <TooltipRow label={`Total (${unit})`} value={fmt(Number(row.total), digits)} />
                  </div>
                </TooltipBox>
              );
            }}
          />
          {VEHICLE_CLASSES.map((c) => (
            <Area
              key={c.key}
              type="monotone"
              dataKey={c.key}
              stackId="kelas"
              stroke={c.color}
              strokeWidth={1}
              fill={c.color}
              fillOpacity={0.88}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function SpeedChart({
  series,
  ticks,
  marks,
  formatLabel,
}: {
  series: SeriesPoint[];
  ticks: string[];
  marks: { label: string; speed: number }[];
  formatLabel: LabelFormatter;
}) {
  const max = Math.max(...series.map((p) => p.speed));
  const top = Math.ceil((max + 4) / 10) * 10;

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 12, right: 12, bottom: 0, left: 4 }}>
          <CartesianGrid stroke={COLOR.grid} vertical={false} />
          <XAxis dataKey="label" ticks={ticks} interval={0} tickFormatter={(v: string) => v.split(" ")[0]} tick={tick} axisLine={false} tickLine={false} dy={6} />
          <YAxis
            domain={[0, top]}
            tick={tick}
            axisLine={false}
            tickLine={false}
            width={44}
            label={{ value: "km/jam", angle: -90, position: "insideLeft", fill: COLOR.axis, fontSize: 11, dy: 24 }}
          />
          <Tooltip
            cursor={{ stroke: COLOR.axis, strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as SeriesPoint | undefined;
              if (!active || !p) return null;
              return (
                <TooltipBox title={formatLabel(p.label)}>
                  <TooltipRow color={COLOR.accent} label="Kecepatan" value={`${fmt(p.speed, 1)} km/j`} />
                </TooltipBox>
              );
            }}
          />
          <Line type="monotone" dataKey="speed" stroke={COLOR.accent} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          {marks.map((m) => (
            <ReferenceDot
              key={m.label}
              x={m.label}
              y={m.speed}
              r={4.5}
              fill={COLOR.bad}
              stroke={COLOR.card}
              strokeWidth={2}
              label={{ value: `${fmt(m.speed, 1)} km/j`, position: "bottom", fill: COLOR.bad, fontSize: 11, fontFamily: "var(--font-mono)", offset: 10 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function VolumeSpeedScatter({
  points,
  xUnit,
}: {
  points: { x: number; y: number; label: string }[];
  xUnit: string;
}) {
  const dense = points.length > 200;
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const zeroBased = minX < maxX * 0.4;

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 16, bottom: 14, left: 4 }}>
          <CartesianGrid stroke={COLOR.grid} vertical={false} />
          <XAxis
            type="number"
            dataKey="x"
            domain={zeroBased ? [0, "auto"] : ["auto", "auto"]}
            tick={tick}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => fmt(v)}
            label={{ value: xUnit, position: "insideBottomRight", fill: COLOR.axis, fontSize: 11, dy: 16 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, "auto"]}
            tick={tick}
            axisLine={false}
            tickLine={false}
            width={44}
            label={{ value: "km/jam", angle: -90, position: "insideLeft", fill: COLOR.axis, fontSize: 11, dy: 24 }}
          />
          <ZAxis range={dense ? [14, 14] : [42, 42]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: COLOR.axis }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as { x: number; y: number; label: string } | undefined;
              if (!active || !p) return null;
              return (
                <TooltipBox title={p.label}>
                  <TooltipRow label="Volume" value={`${fmt(p.x, 1)} ${xUnit}`} />
                  <TooltipRow label="Kecepatan" value={`${fmt(p.y, 1)} km/j`} />
                </TooltipBox>
              );
            }}
          />
          <Scatter data={points} fill={COLOR.info} fillOpacity={dense ? 0.55 : 0.85} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
