import { fmt } from "@/lib/dashboard/format";
import { Panel } from "./ui";

const LABEL_W = 132;

function barColor(speed: number) {
  if (speed >= 28) return "bg-ok";
  if (speed >= 24) return "bg-warn";
  return "bg-bad";
}

export default function SpeedByArea({
  title,
  items,
  average,
  averageLabel,
}: {
  title: string;
  items: { name: string; speed: number }[];
  average: number;
  averageLabel: string;
}) {
  const max = Math.ceil((Math.max(...items.map((i) => i.speed)) * 1.25) / 5) * 5;
  const avgPos = `calc(${LABEL_W}px + (100% - ${LABEL_W}px) * ${average / max})`;

  return (
    <Panel title={title} className="flex flex-col">
      <div className="relative flex flex-1 flex-col justify-around gap-2.5 pb-7">
        {items.map((it) => (
          <div key={it.name} className="flex items-center">
            <span className="shrink-0 truncate pr-3 text-[13px] text-muted" style={{ width: LABEL_W }} title={it.name}>
              {it.name}
            </span>
            <div className="flex flex-1 items-center">
              <div className={`h-6 rounded-[4px] ${barColor(it.speed)}`} style={{ width: `${(it.speed / max) * 100}%` }} />
              <span className="ml-2 font-mono text-xs tabular-nums text-ink">{fmt(it.speed, 1)}</span>
            </div>
          </div>
        ))}
        <div className="pointer-events-none absolute bottom-6 top-0 border-l border-dashed border-info" style={{ left: avgPos }} />
        <span
          className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap text-[11px] text-info"
          style={{ left: avgPos }}
        >
          {averageLabel}
        </span>
      </div>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-faint">
        <span><span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-ok" />≥ 28 km/j</span>
        <span><span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-warn" />24–28 km/j</span>
        <span><span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-bad" />&lt; 24 km/j</span>
      </p>
    </Panel>
  );
}
