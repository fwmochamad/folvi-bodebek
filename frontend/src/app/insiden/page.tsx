"use client";

import { AlertTriangle, Camera, ChevronLeft, ChevronRight, Download, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AREAS } from "@/lib/dashboard/data";
import {
  INCIDENT_DAYS,
  INCIDENT_TYPES,
  INCIDENT_UPDATED,
  dayLabel,
  getIncidents,
  type Incident,
  type IncidentStatus,
} from "@/lib/dashboard/incidents";
import { SelectField, useToast } from "@/components/dashboard/ui";

const PAGE_SIZE = 15;
const TABS: ("Semua" | IncidentStatus)[] = ["Semua", "Baru", "Ditangani", "Selesai"];

const STATUS_BADGE: Record<IncidentStatus, string> = {
  Baru: "bg-bad/10 text-bad",
  Ditangani: "bg-warn/15 text-warn",
  Selesai: "bg-ok/10 text-ok",
};

const shortDay = (t: number) => dayLabel(t).replace(/^(Hari ini|Kemarin) · /, "");

function toCsv(rows: Incident[], statusOf: (i: Incident) => IncidentStatus) {
  const head = ["ID", "Jenis", "Kategori", "Kelas kendaraan", "Kota", "Lokasi", "Ruas", "Tanggal", "Jam", "Deteksi", "Status", "Bukti", "Kamera"];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.id, r.type, r.category, r.vehicle, r.kota, r.location, r.road, shortDay(r.day), r.time, r.detections, statusOf(r), r.evidence, r.camera]
      .map(esc)
      .join(","),
  );
  return [head.map(esc).join(","), ...lines].join("\n");
}

export default function InsidenPage() {
  const all = useMemo(() => getIncidents(), []);
  const [kota, setKota] = useState("semua");
  const [hari, setHari] = useState("7hari");
  const [jenis, setJenis] = useState("semua");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Semua");
  const [page, setPage] = useState(0);
  const [overrides, setOverrides] = useState<Record<string, IncidentStatus>>({});
  const [detail, setDetail] = useState<Incident | null>(null);
  const toast = useToast();

  const statusOf = (i: Incident) => overrides[i.id] ?? i.status;

  // Filter kota/hari/jenis lebih dulu, lalu hitung jumlah per status untuk tab.
  const filtered = useMemo(
    () =>
      all.filter(
        (i) =>
          (kota === "semua" || i.kota === kota) &&
          (hari === "7hari" || i.day === Number(hari)) &&
          (jenis === "semua" || i.type === jenis),
      ),
    [all, kota, hari, jenis],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = { Semua: filtered.length, Baru: 0, Ditangani: 0, Selesai: 0 };
    for (const i of filtered) c[overrides[i.id] ?? i.status]++;
    return c;
  }, [filtered, overrides]);
  const rows = tab === "Semua" ? filtered : filtered.filter((i) => statusOf(i) === tab);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const filterActive = kota !== "semua" || hari !== "7hari" || jenis !== "semua";
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(0);
  };

  const act = (inc: Incident, next: IncidentStatus) => {
    setOverrides((o) => ({ ...o, [inc.id]: next }));
    toast.show(`${inc.id} ${next === "Ditangani" ? "diterima dan sedang ditangani" : "ditandai selesai"}`);
  };

  const exportCsv = () => {
    const blob = new Blob(["﻿" + toCsv(rows, statusOf)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kejadian-pelanggaran-${hari === "7hari" ? "7-hari" : shortDay(Number(hari)).replace(/[^\w]+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show(`${rows.length} kejadian diekspor ke CSV`);
  };

  return (
    <div className="-m-6 min-h-[calc(100%+3rem)] bg-canvas p-4 text-ink sm:p-6 lg:p-8">
      {toast.node}

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight sm:text-3xl">
            Katalog Kejadian &amp; Pelanggaran
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Deteksi Computer Vision dari 82 titik pantau Bodebek · data sampai pukul {INCIDENT_UPDATED} hari ini
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Ekspor CSV
        </button>
      </div>

      {/* Filter */}
      <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(22,27,46,0.04)] sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        <SelectField
          label="Kota / kabupaten"
          value={kota}
          onChange={resetPage(setKota)}
          options={[{ value: "semua", label: "Semua kota" }, ...AREAS.map((a) => ({ value: a, label: a }))]}
        />
        <SelectField
          label="Hari"
          value={hari}
          onChange={resetPage(setHari)}
          options={[{ value: "7hari", label: "7 hari terakhir" }, ...INCIDENT_DAYS.map((d) => ({ value: String(d), label: dayLabel(d) }))]}
        />
        <SelectField
          label="Jenis kejadian"
          value={jenis}
          onChange={resetPage(setJenis)}
          options={[{ value: "semua", label: "Semua jenis" }, ...INCIDENT_TYPES.map((t) => ({ value: t, label: t }))]}
        />
        <button
          onClick={() => {
            setKota("semua");
            setHari("7hari");
            setJenis("semua");
            setPage(0);
          }}
          disabled={!filterActive}
          className="flex h-10 items-center justify-center gap-2 self-end rounded-lg border border-line-strong px-4 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" />
          Atur ulang
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(22,27,46,0.04),0_4px_16px_-8px_rgba(22,27,46,0.08)]">
        {/* Tab status */}
        <div className="flex gap-6 overflow-x-auto border-b border-line px-5 pt-4 text-sm">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(0);
              }}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 transition-colors ${
                tab === t ? "border-accent font-semibold text-accent" : "border-transparent text-muted hover:text-accent"
              }`}
            >
              {t}
              <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${tab === t ? "bg-accent/10" : "bg-raised"}`}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-raised text-[10px] font-semibold uppercase tracking-[0.08em] text-subtle">
              <tr>
                <th className="px-4 py-3">ID Kejadian</th>
                <th className="px-4 py-3">Jenis &amp; Kelas</th>
                <th className="px-4 py-3">Kota</th>
                <th className="px-4 py-3">Lokasi &amp; Waktu</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bukti</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((inc) => {
                const status = statusOf(inc);
                return (
                  <tr key={inc.id} className="align-top transition-colors hover:bg-accent/[0.04]">
                    <td className="px-4 py-3.5">
                      <p className="whitespace-nowrap font-mono text-[13px] font-medium">{inc.id}</p>
                      <p className="mt-0.5 text-[11px] text-faint">{inc.camera}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="flex items-center gap-2 font-medium">
                        {inc.type}
                        {inc.category === "Insiden" && (
                          <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-info">Insiden</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-subtle">
                        {inc.vehicle}
                        {inc.detections > 1 && ` · ${inc.detections} deteksi / 30 mnt`}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-muted">{inc.kota}</td>
                    <td className="px-4 py-3.5">
                      <p className="max-w-[240px] truncate" title={inc.location}>
                        {inc.location}
                      </p>
                      <p className="mt-0.5 text-xs text-subtle">
                        {shortDay(inc.day)} · {inc.time}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[status]}`}>{status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {inc.evidence === "Tidak ada" ? (
                        <span className="text-faint">Tidak ada</span>
                      ) : (
                        <button onClick={() => setDetail(inc)} className="whitespace-nowrap font-medium text-accent hover:underline">
                          {inc.evidence === "Foto" ? "Foto" : "Foto & klip"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {status === "Baru" ? (
                        <button
                          onClick={() => act(inc, "Ditangani")}
                          className="w-full whitespace-nowrap rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/90"
                        >
                          Terima &amp; tangani
                        </button>
                      ) : status === "Ditangani" ? (
                        <button
                          onClick={() => act(inc, "Selesai")}
                          className="w-full whitespace-nowrap rounded-lg border border-ok/40 px-3 py-2 text-xs font-semibold text-ok transition-colors hover:bg-ok/10"
                        >
                          Tandai selesai
                        </button>
                      ) : (
                        <span className="text-xs italic text-faint">Selesai</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <AlertTriangle className="h-8 w-8 text-faint" />
            <p className="font-medium text-muted">Tidak ada kejadian yang cocok dengan filter ini.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-subtle">
            <span>
              Menampilkan {current * PAGE_SIZE + 1}–{Math.min(rows.length, (current + 1) * PAGE_SIZE)} dari {rows.length} kejadian
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(current - 1)}
                disabled={current === 0}
                aria-label="Halaman sebelumnya"
                className="rounded-md border border-line p-1.5 hover:border-accent/50 hover:text-accent disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-mono">
                {current + 1} / {pages}
              </span>
              <button
                onClick={() => setPage(current + 1)}
                disabled={current >= pages - 1}
                aria-label="Halaman berikutnya"
                className="rounded-md border border-line p-1.5 hover:border-accent/50 hover:text-accent disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {detail && <EvidenceModal incident={detail} status={statusOf(detail)} onClose={() => setDetail(null)} />}
    </div>
  );
}

function EvidenceModal({ incident: i, status, onClose }: { incident: Incident; status: IncidentStatus; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Bukti ${i.id}`}
        className="w-full max-w-lg overflow-hidden rounded-xl bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <div>
            <p className="font-mono text-sm font-semibold">{i.id}</p>
            <p className="text-xs text-subtle">{i.type}</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="rounded-md p-1.5 text-subtle hover:bg-raised hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative flex aspect-video items-center justify-center bg-ink text-white/60">
          <div className="flex flex-col items-center gap-2 text-xs">
            <Camera className="h-8 w-8" />
            Cuplikan {i.evidence === "Foto" ? "foto" : "foto & klip 10 detik"} tersimpan di server VMS
          </div>
          <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 font-mono text-[11px] text-white">
            {i.camera} · {shortDay(i.day)} {i.time}
          </span>
          <span className="absolute right-3 top-3 rounded border border-accent/60 bg-accent/20 px-2 py-0.5 text-[11px] text-white">
            {i.vehicle}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 text-sm">
          <div>
            <dt className="text-xs text-subtle">Lokasi</dt>
            <dd>{i.location}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Kota</dt>
            <dd>{i.kota}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Ruas</dt>
            <dd>{i.road}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Status</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Deteksi digabung</dt>
            <dd>{i.detections > 1 ? `${i.detections} deteksi dalam 30 menit` : "1 deteksi"}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Bukti</dt>
            <dd>{i.evidence === "Foto" ? "Foto (kamera kualitas menurun)" : i.evidence}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
