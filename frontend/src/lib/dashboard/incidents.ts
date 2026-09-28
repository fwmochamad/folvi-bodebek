/**
 * Katalog kejadian & pelanggaran hasil deteksi Computer Vision (simulasi).
 *
 * Tiap baris adalah satu kejadian yang sudah digabung per lokasi (deteksi
 * berulang dalam 30 menit di simpang yang sama dihitung satu kejadian),
 * dibangkitkan deterministik untuk 7 hari terakhir di 82 titik pantau.
 */

import { DAYS, MONTHS, TODAY, rand, ruasInfo, type Area } from "./data";
import { TITIK } from "./titik";

export type IncidentStatus = "Baru" | "Ditangani" | "Selesai";
export type IncidentCategory = "Pelanggaran" | "Insiden";
export type Evidence = "Foto + klip" | "Foto" | "Tidak ada";

export interface Incident {
  id: string;
  type: string;
  category: IncidentCategory;
  vehicle: string;
  kota: Area;
  location: string;
  road: string;
  camera: string;
  /** Awal hari (UTC ms) untuk filter. */
  day: number;
  /** Jam kejadian, format "HH.MM". */
  time: string;
  /** Urutan waktu, menit sejak awal minggu data. */
  order: number;
  /** Jumlah deteksi yang digabung menjadi kejadian ini. */
  detections: number;
  status: IncidentStatus;
  evidence: Evidence;
}

const DAY = 86_400_000;
/** Waktu data terakhir hari ini (menit sejak 00.00). */
const NOW_MINUTES = 17 * 60 + 40;
export const INCIDENT_UPDATED = "17.40";

type HourProfile = "komuter" | "siang" | "malam" | "rata";

const HOUR_WEIGHT: Record<HourProfile, number[]> = {
  komuter: [0.2, 0.1, 0.1, 0.1, 0.3, 1.2, 3, 3.4, 2.6, 1.4, 1, 1, 1, 1, 1.1, 1.6, 2.8, 3.4, 3, 1.8, 1, 0.7, 0.4, 0.3],
  siang: [0.1, 0.1, 0.05, 0.05, 0.1, 0.3, 0.8, 1.2, 1.8, 2.4, 2.8, 3, 3, 2.8, 2.6, 2.6, 2.6, 2.4, 2.2, 2, 1.6, 1, 0.5, 0.2],
  malam: [2, 1.8, 1.5, 1.2, 1.2, 1.2, 1, 0.8, 0.8, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1.2, 1.5, 1.8, 2, 2.2, 2.2],
  rata: [0.4, 0.3, 0.3, 0.3, 0.5, 0.8, 1.2, 1.4, 1.3, 1.1, 1, 1, 1, 1, 1, 1.1, 1.3, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6, 0.5],
};

interface TypeSpec {
  type: string;
  category: IncidentCategory;
  weight: Record<"bogor" | "depok" | "bekasi", number>;
  hours: HourProfile;
  vehicles: [string, number][];
  /** Rentang jumlah deteksi yang digabung. */
  detections: [number, number];
}

const TYPES: TypeSpec[] = [
  { type: "Angkot ngetem", category: "Pelanggaran", weight: { bogor: 1.5, depok: 1.3, bekasi: 0.8 }, hours: "komuter", vehicles: [["Mikrolet/Angkot", 1]], detections: [4, 16] },
  { type: "Parkir liar", category: "Pelanggaran", weight: { bogor: 1.2, depok: 1.2, bekasi: 1.2 }, hours: "siang", vehicles: [["Mobil", 0.45], ["Sepeda Motor", 0.35], ["Truk Ringan", 0.2]], detections: [3, 12] },
  { type: "Lawan arah", category: "Pelanggaran", weight: { bogor: 0.8, depok: 1.1, bekasi: 1 }, hours: "komuter", vehicles: [["Sepeda Motor", 0.85], ["Mobil", 0.15]], detections: [3, 18] },
  { type: "Menerobos lampu merah", category: "Pelanggaran", weight: { bogor: 0.9, depok: 0.9, bekasi: 1 }, hours: "malam", vehicles: [["Sepeda Motor", 0.7], ["Mobil", 0.2], ["Truk Ringan", 0.05], ["Bus Kecil", 0.05]], detections: [2, 14] },
  { type: "Berhenti di kotak kuning", category: "Pelanggaran", weight: { bogor: 0.6, depok: 0.7, bekasi: 0.8 }, hours: "komuter", vehicles: [["Mobil", 0.4], ["Truk Berat", 0.2], ["Mikrolet/Angkot", 0.15], ["Truk Ringan", 0.15], ["Bus Besar", 0.1]], detections: [2, 9] },
  { type: "Truk melintas jam larangan", category: "Pelanggaran", weight: { bogor: 0.4, depok: 0.15, bekasi: 0.9 }, hours: "komuter", vehicles: [["Truk Berat", 0.7], ["Truk Ringan", 0.3]], detections: [1, 6] },
  { type: "Kendaraan mogok", category: "Insiden", weight: { bogor: 0.25, depok: 0.25, bekasi: 0.3 }, hours: "rata", vehicles: [["Truk Berat", 0.35], ["Mobil", 0.3], ["Truk Ringan", 0.2], ["Bus Besar", 0.15]], detections: [1, 1] },
  { type: "Kecelakaan ringan", category: "Insiden", weight: { bogor: 0.12, depok: 0.12, bekasi: 0.14 }, hours: "rata", vehicles: [["Sepeda Motor", 0.6], ["Mobil", 0.4]], detections: [1, 1] },
];

export const INCIDENT_TYPES = TYPES.map((t) => t.type);

function pickWeighted<T>(items: [T, number][], r: number): T {
  const total = items.reduce((a, [, w]) => a + w, 0);
  let x = r * total;
  for (const [item, w] of items) {
    x -= w;
    if (x <= 0) return item;
  }
  return items[items.length - 1][0];
}

/** Jumlah kejadian per hari (0 = Minggu). */
const PER_DAY = [21, 34, 33, 34, 35, 38, 27];

const pad = (n: number) => String(n).padStart(2, "0");

export function dayLabel(t: number) {
  const d = new Date(t);
  const base = `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`;
  if (t === TODAY) return `Hari ini · ${base}`;
  if (t === TODAY - DAY) return `Kemarin · ${base}`;
  return base;
}

export const INCIDENT_DAYS = Array.from({ length: 7 }, (_, i) => TODAY - i * DAY);

function statusFor(minutesAgo: number, r: number): IncidentStatus {
  if (minutesAgo < 45) return r < 0.8 ? "Baru" : "Ditangani";
  if (minutesAgo < 180) return r < 0.1 ? "Baru" : r < 0.65 ? "Ditangani" : "Selesai";
  if (minutesAgo < 24 * 60) return r < 0.15 ? "Ditangani" : "Selesai";
  return r < 0.03 ? "Ditangani" : "Selesai";
}

let cache: Incident[] | null = null;

export function getIncidents(): Incident[] {
  if (cache) return cache;
  const out: Incident[] = [];
  const titik = TITIK.map((t) => ({ t, ruas: ruasInfo(t.ruasId) }));

  for (const day of INCIDENT_DAYS) {
    const wd = new Date(day).getUTCDay();
    const dayIncidents: Incident[] = [];
    for (let i = 0; i < PER_DAY[wd]; i++) {
      const seed = `inc|${day}|${i}`;
      const { t, ruas } = titik[Math.floor(rand(`${seed}|titik`) * titik.length)];
      const spec = pickWeighted(TYPES.map((s) => [s, s.weight[t.region]] as [TypeSpec, number]), rand(`${seed}|jenis`));
      const hour = pickWeighted(HOUR_WEIGHT[spec.hours].map((w, h) => [h, w] as [number, number]), rand(`${seed}|jam`));
      if (spec.type === "Truk melintas jam larangan" && !((hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 20))) continue;
      const minute = Math.floor(rand(`${seed}|menit`) * 60);
      const minuteOfDay = hour * 60 + minute;
      if (day === TODAY && minuteOfDay > NOW_MINUTES) continue;
      // Kamera yang sedang mati tidak menghasilkan kejadian hari ini.
      if (day === TODAY && t.camStatus === "mati") continue;

      const minutesAgo = (TODAY - day) / 60000 + NOW_MINUTES - minuteOfDay;
      const [lo, hi] = spec.detections;
      dayIncidents.push({
        id: "",
        type: spec.type,
        category: spec.category,
        vehicle: pickWeighted(spec.vehicles, rand(`${seed}|kelas`)),
        kota: ruas.area,
        location: t.name,
        road: ruas.name,
        camera: t.camera,
        day,
        time: `${pad(hour)}.${pad(minute)}`,
        order: (day - INCIDENT_DAYS[6]) / 60000 + minuteOfDay,
        detections: lo + Math.floor(rand(`${seed}|deteksi`) * (hi - lo + 1)),
        status: statusFor(minutesAgo, rand(`${seed}|status`)),
        evidence: t.camStatus === "menurun" ? "Foto" : rand(`${seed}|bukti`) < 0.04 ? "Tidak ada" : "Foto + klip",
      });
    }
    dayIncidents.sort((a, b) => a.order - b.order);
    const d = new Date(day);
    const stamp = `${String(d.getUTCFullYear()).slice(2)}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
    dayIncidents.forEach((inc, i) => (inc.id = `INC-${stamp}-${String(i + 1).padStart(3, "0")}`));
    out.push(...dayIncidents);
  }
  cache = out.sort((a, b) => b.order - a.order);
  return cache;
}
