"use client";

import dynamic from "next/dynamic";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  MonitorPlay,
  RefreshCw,
  Square,
  Video,
  VideoOff,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AREAS, getMapData, type Area, type MapPoint } from "@/lib/dashboard/data";
import { demoStreamFor } from "@/lib/cctv/streams";
import { STATUS_STYLE } from "@/components/peta/status";
import CameraPicker from "@/components/kendali/CameraPicker";
import { useToast } from "@/components/dashboard/ui";

// hls.js hanya berjalan di browser.
const HlsPlayer = dynamic(() => import("@/components/kendali/HlsPlayer"), { ssr: false });

type Layout = 1 | 4 | 9 | 16;
type GroupId = "prioritas" | "semua" | "bermasalah" | "manual" | `area:${Area}`;

const LAYOUTS: { n: Layout; icon: typeof Square; label: string }[] = [
  { n: 1, icon: Square, label: "1 layar" },
  { n: 4, icon: Grid2x2, label: "4 layar" },
  { n: 9, icon: Grid3x3, label: "9 layar" },
  { n: 16, icon: LayoutGrid, label: "16 layar" },
];

const WALL_COLS: Record<Layout, string> = {
  1: "grid-cols-1",
  4: "grid-cols-1 @lg:grid-cols-2",
  9: "grid-cols-2 @2xl:grid-cols-3",
  16: "grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4",
};

const SEVERITY: Record<MapPoint["status"], number> = { macet: 0, padat: 1, lancar: 2, mati: 3 };
const bySeverity = (a: MapPoint, b: MapPoint) => SEVERITY[a.status] - SEVERITY[b.status] || b.load - a.load;

interface Dss {
  id: string;
  title: string;
  location: string;
  trigger: string;
  impact: string;
  action: string;
}

const DSS_LIST: Dss[] = [
  {
    id: "DSS-001",
    title: "Kalimalang arah Jakarta melebihi kapasitas",
    location: "Simpang Kalimalang – Pemuda Patriot",
    trigger: "Beban jalan 118% selama 4 periode berturut-turut",
    impact: "Antrean terurai ±15 menit, beban turun ke ±90%",
    action: "Tambah hijau 10 detik arah barat dan alihkan sebagian arus ke Jl. Jend. Ahmad Yani",
  },
  {
    id: "DSS-002",
    title: "Simpang Pemda Cibinong melebihi kapasitas",
    location: "Simpang Raya Bogor – Tegar Beriman",
    trigger: "Beban jalan 109%, antrean mendekati 140 m",
    impact: "Waktu tempuh koridor Cibinong membaik ±12%",
    action: "Aktifkan koordinasi lampu hijau (green wave) Jl. Raya Bogor arah Cibinong",
  },
  {
    id: "DSS-003",
    title: "Kecepatan Jl. Jend. Sudirman turun mendadak",
    location: "Simpang Sudirman – Pemuda Raya",
    trigger: "Kecepatan turun 61% (31 → 12 km/j) dalam 10 menit",
    impact: "Mencegah antrean merambat ke Bulak Kapal",
    action: "Kirim petugas ke lokasi untuk memeriksa kendaraan mogok",
  },
];

export default function KendaliPage() {
  const cameras = useMemo(() => getMapData("bodebek", "harian").points, []);
  const byId = useMemo(() => new Map(cameras.map((c, i) => [c.id, { cam: c, index: i }])), [cameras]);

  const [layout, setLayout] = useState<Layout>(4);
  const [group, setGroup] = useState<GroupId>("prioritas");
  const [page, setPage] = useState(0);
  const [manualSlots, setManualSlots] = useState<(string | null)[] | null>(null);
  const [picking, setPicking] = useState<number | null>(null);
  const [dssState, setDssState] = useState<Record<string, "diterima" | "ditolak">>({});
  const toast = useToast();

  const groupList = useMemo(() => {
    if (group === "semua") return cameras;
    if (group === "bermasalah") return cameras.filter((c) => c.camStatus !== "sehat");
    if (group.startsWith("area:")) return cameras.filter((c) => c.area === group.slice(5)).sort(bySeverity);
    return cameras.filter((c) => c.status !== "mati").sort(bySeverity);
  }, [cameras, group]);

  const pages = Math.max(1, Math.ceil(groupList.length / layout));
  const current = Math.min(page, pages - 1);
  const slots: (string | null)[] =
    group === "manual" && manualSlots
      ? manualSlots
      : Array.from({ length: layout }, (_, i) => groupList[current * layout + i]?.id ?? null);

  const shownIn = new Map(slots.flatMap((id, i) => (id ? [[id, i + 1] as [string, number]] : [])));

  // Mengubah satu layar secara manual mengalihkan grup menjadi Manual.
  const setSlot = (index: number, id: string | null) => {
    const next = [...slots];
    next[index] = id;
    setManualSlots(next);
    setGroup("manual");
  };

  const changeLayout = (n: Layout) => {
    setLayout(n);
    setPage(0);
    if (group === "manual") setManualSlots(Array.from({ length: n }, (_, i) => slots[i] ?? null));
  };

  const changeGroup = (g: GroupId) => {
    setGroup(g);
    setPage(0);
    if (g !== "manual") setManualSlots(null);
  };

  const showOnWall = (dss: Dss) => {
    const cam = cameras.find((c) => c.name === dss.location);
    if (!cam) return;
    setSlot(0, cam.id);
    toast.show(`${cam.camera} ditampilkan di layar 1`);
  };

  const decideDss = (dss: Dss, decision: "diterima" | "ditolak") => {
    setDssState((s) => ({ ...s, [dss.id]: decision }));
    toast.show(`${dss.id} ${decision === "diterima" ? "diterima dan dijalankan" : "ditolak"}`);
  };

  const camCounts = cameras.reduce(
    (acc, c) => ({ ...acc, [c.camStatus]: acc[c.camStatus] + 1 }),
    { sehat: 0, menurun: 0, mati: 0 },
  );
  const pendingDss = DSS_LIST.filter((d) => !dssState[d.id]).length;

  return (
    <div className="-m-6 min-h-[calc(100%+3rem)] bg-canvas p-4 text-ink sm:p-6 lg:p-8">
      {toast.node}

      <div className="mb-6">
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight sm:text-3xl">Operator Ruang Kendali</h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>{cameras.length} kamera terhubung ke VMS</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ok" />{camCounts.sehat} sehat</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-caution" />{camCounts.menurun} kualitas menurun</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-bad" />{camCounts.mati} tidak mengirim data</span>
        </p>
      </div>

      <div className="@container">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 @6xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Video wall */}
          <section className="@container rounded-xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(22,27,46,0.04),0_4px_16px_-8px_rgba(22,27,46,0.08)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                <Video className="h-5 w-5 text-subtle" />
                Video wall
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <div role="radiogroup" aria-label="Tata letak" className="flex rounded-lg border border-line-strong p-0.5">
                  {LAYOUTS.map(({ n, icon: Icon, label }) => (
                    <button
                      key={n}
                      role="radio"
                      aria-checked={layout === n}
                      aria-label={label}
                      title={label}
                      onClick={() => changeLayout(n)}
                      className={`rounded-md p-1.5 transition-colors ${
                        layout === n ? "bg-accent text-white" : "text-subtle hover:bg-accent/10 hover:text-accent"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                <label className="relative">
                  <span className="sr-only">Grup kamera</span>
                  <select
                    value={group}
                    onChange={(e) => changeGroup(e.target.value as GroupId)}
                    className="h-9 cursor-pointer appearance-none rounded-lg border border-line-strong bg-surface pl-3 pr-8 text-sm outline-none hover:border-accent/50 focus-visible:border-accent"
                  >
                    {group === "manual" && <option value="manual">Grup: Manual</option>}
                    <option value="prioritas">Grup: Prioritas (terpadat)</option>
                    <option value="semua">Grup: Semua kamera ({cameras.length})</option>
                    <optgroup label="Per kota / kabupaten">
                      {AREAS.map((a) => (
                        <option key={a} value={`area:${a}`}>
                          Grup: {a} ({cameras.filter((c) => c.area === a).length})
                        </option>
                      ))}
                    </optgroup>
                    <option value="bermasalah">Grup: Kamera bermasalah ({camCounts.menurun + camCounts.mati})</option>
                  </select>
                  <ChevronDownIcon />
                </label>
                <button
                  onClick={() => {
                    setManualSlots(Array.from({ length: layout }, () => null));
                    setGroup("manual");
                  }}
                  title="Kosongkan semua layar"
                  aria-label="Kosongkan semua layar"
                  className="rounded-lg border border-line-strong p-2 text-subtle transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <Eraser className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className={`grid gap-2 ${WALL_COLS[layout]}`}>
              {slots.map((id, i) => {
                const entry = id ? byId.get(id) : undefined;
                return (
                  <Tile
                    key={`${i}-${id ?? "kosong"}`}
                    slot={i}
                    cam={entry?.cam}
                    streamIndex={entry?.index ?? 0}
                    compact={layout >= 9}
                    onPick={() => setPicking(i)}
                    onRemove={() => setSlot(i, null)}
                  />
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-subtle">
              {group === "manual" ? (
                <span>Mode manual · klik layar untuk mengganti kamera, pilih grup untuk kembali otomatis</span>
              ) : (
                <span>
                  Halaman {current + 1} dari {pages} · {groupList.length} kamera di grup ini
                </span>
              )}
              {group !== "manual" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(current - 1)}
                    disabled={current === 0}
                    aria-label="Halaman sebelumnya"
                    className="rounded-md border border-line p-1.5 hover:border-accent/50 hover:text-accent disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(current + 1)}
                    disabled={current >= pages - 1}
                    aria-label="Halaman berikutnya"
                    className="rounded-md border border-line p-1.5 hover:border-accent/50 hover:text-accent disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Rekomendasi DSS */}
          <aside className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(22,27,46,0.04),0_4px_16px_-8px_rgba(22,27,46,0.08)]">
            <div className="border-b border-line bg-accent/[0.06] px-5 py-4">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                <AlertCircle className="h-5 w-5 text-accent" />
                Skenario rekayasa DSS
              </h2>
              <p className="mt-1 text-xs text-muted">
                {pendingDss > 0 ? `${pendingDss} anomali membutuhkan keputusan operator.` : "Semua rekomendasi sudah diputuskan."}
              </p>
            </div>
            <div className="grid flex-1 content-start gap-3 p-3 @3xl:grid-cols-2 @6xl:grid-cols-1">
              {DSS_LIST.map((dss) => {
                const decision = dssState[dss.id];
                return (
                  <div
                    key={dss.id}
                    className={`relative overflow-hidden rounded-lg border border-line p-4 transition-opacity ${decision === "ditolak" ? "opacity-55" : ""}`}
                  >
                    <div className={`absolute inset-y-0 left-0 w-1 ${decision === "diterima" ? "bg-ok" : decision === "ditolak" ? "bg-faint" : "bg-accent"}`} />
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug">{dss.title}</p>
                      <span className="shrink-0 font-mono text-[10px] text-faint">{dss.id}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-subtle">{dss.location}</p>
                    <dl className="mt-3 space-y-2 text-xs">
                      <div className="rounded-md bg-bad/[0.07] px-2.5 py-2">
                        <dt className="font-semibold text-bad">Pemicu</dt>
                        <dd className="mt-0.5 text-ink">{dss.trigger}</dd>
                      </div>
                      <div className="rounded-md bg-ok/[0.08] px-2.5 py-2">
                        <dt className="font-semibold text-ok">Perkiraan dampak</dt>
                        <dd className="mt-0.5 text-ink">{dss.impact}</dd>
                      </div>
                      <div className="rounded-md bg-raised px-2.5 py-2">
                        <dt className="font-semibold text-muted">Usulan aksi</dt>
                        <dd className="mt-0.5 font-medium text-ink">{dss.action}</dd>
                      </div>
                    </dl>
                    <button
                      onClick={() => showOnWall(dss)}
                      className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                    >
                      <MonitorPlay className="h-3.5 w-3.5" />
                      Tampilkan kamera di layar 1
                    </button>
                    {decision ? (
                      <p className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${decision === "diterima" ? "text-ok" : "text-subtle"}`}>
                        {decision === "diterima" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {decision === "diterima" ? "Diterima · sedang dijalankan" : "Ditolak operator"}
                      </p>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => decideDss(dss, "diterima")}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-accent py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/90"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Terima &amp; jalankan
                        </button>
                        <button
                          onClick={() => decideDss(dss, "ditolak")}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-line-strong py-2 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-accent"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>

      {picking !== null && (
        <CameraPicker
          cameras={cameras}
          slotIndex={picking}
          shownIn={shownIn}
          onClose={() => setPicking(null)}
          onPick={(id) => {
            setSlot(picking, id);
            setPicking(null);
          }}
        />
      )}
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Tile({
  slot,
  cam,
  streamIndex,
  compact,
  onPick,
  onRemove,
}: {
  slot: number;
  cam: MapPoint | undefined;
  streamIndex: number;
  compact: boolean;
  onPick: () => void;
  onRemove: () => void;
}) {
  if (!cam) {
    return (
      <div className="relative flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-strong bg-raised text-subtle">
        <VideoOff className={compact ? "h-5 w-5" : "h-7 w-7"} />
        <span className="font-mono text-[11px] uppercase tracking-wider">No stream signal</span>
        <button
          onClick={onPick}
          className="rounded-md border border-line-strong bg-surface px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          Pilih kamera
        </button>
        <span className="absolute left-2 top-2 font-mono text-[10px] text-faint">Layar {slot + 1}</span>
      </div>
    );
  }

  const stream = cam.status === "mati" ? null : demoStreamFor(streamIndex);
  const style = STATUS_STYLE[cam.status];

  return (
    <div className="group relative aspect-video overflow-hidden rounded-lg bg-[#0e1220] text-white">
      {cam.status === "mati" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-white/60">
          <VideoOff className="h-6 w-6" />
          <span className="font-mono uppercase tracking-wider">No stream signal</span>
          <span className="text-white/45">Kamera tidak mengirim data · {cam.offlineFor}</span>
        </div>
      ) : stream ? (
        <HlsPlayer src={stream.url} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[repeating-linear-gradient(135deg,#121729_0_12px,#0e1220_12px_24px)] text-xs text-white/55">
          <Video className="h-6 w-6" />
          Sumber video belum diatur
        </div>
      )}

      {/* Info kamera */}
      <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px]">{cam.camera}</span>
        {cam.status !== "mati" && !compact && (
          <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: `${style.color}33`, color: "#fff", boxShadow: `inset 0 0 0 1px ${style.color}` }}>
            {style.label} · {cam.speed} km/j
          </span>
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-6">
        <p className={`truncate font-medium ${compact ? "text-[11px]" : "text-xs"}`}>{cam.name}</p>
        {!compact && <p className="truncate text-[10px] text-white/60">{cam.area} · {cam.road}</p>}
      </div>

      {/* Kontrol: selalu tampil di layar sentuh, muncul saat hover di desktop */}
      <div className="absolute right-2 top-2 flex gap-1 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <button onClick={onPick} aria-label={`Ganti kamera layar ${slot + 1}`} title="Ganti kamera" className="rounded bg-black/60 p-1.5 hover:bg-accent">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        <button onClick={onRemove} aria-label={`Hapus kamera dari layar ${slot + 1}`} title="Hapus dari layar" className="rounded bg-black/60 p-1.5 hover:bg-bad">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
