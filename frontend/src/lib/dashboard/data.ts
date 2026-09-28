/**
 * Data simulasi Dashboard Pimpinan (Bogor, Depok, Bekasi).
 *
 * Angka tidak ditulis tangan satu per satu, melainkan dibangkitkan secara
 * deterministik dari model lalu lintas sederhana agar konsisten antar kartu:
 *   volume ruas  = kapasitas × beban jam puncak × profil jam × faktor hari
 *   kecepatan    = kecepatan arus bebas ÷ (1 + beban³)   (mirip kurva BPR)
 * Faktor hari memperhitungkan akhir pekan, Car Free Day, Ramadan, mudik
 * Lebaran, libur nasional, libur sekolah, dan musim hujan.
 *
 * Ganti modul ini dengan panggilan API saat backend tersedia; bentuk
 * `DashboardData` sudah disiapkan sebagai kontrak untuk UI.
 */

import { TITIK } from "./titik";

export type RegionId = "bodebek" | "bogor" | "depok" | "bekasi";
export type PeriodId = "harian" | "mingguan" | "bulanan" | "tahunan";
type SubRegion = Exclude<RegionId, "bodebek">;
export type Area = "Kota Bogor" | "Kab. Bogor" | "Kota Depok" | "Kota Bekasi" | "Kab. Bekasi";

export const REGIONS: { id: RegionId; label: string }[] = [
  { id: "bodebek", label: "Seluruh Bodebek" },
  { id: "bogor", label: "Bogor" },
  { id: "depok", label: "Depok" },
  { id: "bekasi", label: "Bekasi" },
];

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "harian", label: "Harian" },
  { id: "mingguan", label: "Mingguan" },
  { id: "bulanan", label: "Bulanan" },
  { id: "tahunan", label: "Tahunan" },
];

export const VEHICLE_CLASSES = [
  { key: "motor", label: "Sepeda Motor", color: "#ee7a3e" },
  { key: "mobil", label: "Mobil", color: "#5b8def" },
  { key: "angkot", label: "Mikrolet/Angkot", color: "#e3b534" },
  { key: "busKecil", label: "Bus Kecil", color: "#4fb286" },
  { key: "busBesar", label: "Bus Besar", color: "#a77be0" },
  { key: "trukRingan", label: "Truk Ringan", color: "#b39580" },
  { key: "trukBerat", label: "Truk Berat", color: "#e05252" },
] as const;

export type VehicleKey = (typeof VEHICLE_CLASSES)[number]["key"];
type ClassMix = Record<VehicleKey, number>;

/** Batas status beban jalan (volume ÷ kapasitas). */
export const LOAD_PADAT = 0.7;
export const LOAD_MACET = 1.0;

// ---------------------------------------------------------------------------
// Konfigurasi wilayah & ruas
// ---------------------------------------------------------------------------

interface RegionConfig {
  label: string;
  titik: number;
  /** Komposisi kelas kendaraan dasar (persen). */
  share: ClassMix;
  availability: number;
  /** Seberapa padat titik pantau dibanding ruas utamanya (0,5 = jauh lebih longgar). */
  density: number;
}

const REGION: Record<SubRegion, RegionConfig> = {
  bogor: {
    label: "Bogor",
    titik: 30,
    share: { motor: 66, mobil: 22, angkot: 6.5, busKecil: 1.2, busBesar: 0.8, trukRingan: 2.4, trukBerat: 1.1 },
    availability: 96.1,
    density: 0.52,
  },
  depok: {
    label: "Depok",
    titik: 22,
    share: { motor: 71, mobil: 21.5, angkot: 3.8, busKecil: 0.9, busBesar: 0.4, trukRingan: 1.8, trukBerat: 0.6 },
    availability: 96.9,
    density: 0.64,
  },
  bekasi: {
    label: "Bekasi",
    titik: 30,
    share: { motor: 64, mobil: 23.5, angkot: 2.6, busKecil: 0.9, busBesar: 1.0, trukRingan: 4.4, trukBerat: 3.6 },
    availability: 95.7,
    density: 0.5,
  },
};

interface Ruas {
  id: string;
  name: string;
  short: string;
  region: SubRegion;
  area: Area;
  /** Kapasitas, kendaraan per jam (dua arah). */
  cap: number;
  /** Beban pada jam puncak hari kerja biasa. */
  peak: number;
  /** Kecepatan arus bebas, km/jam. */
  ff: number;
  /** Pengali volume saat akhir pekan / hari libur. */
  weekend: number;
  /** Ruas dipakai Car Free Day Minggu pagi. */
  cfd?: boolean;
}

const RUAS: Ruas[] = [
  // Bogor
  { id: "puncak", name: "Jl. Raya Puncak (Gadog–Cisarua)", short: "Raya Puncak", region: "bogor", area: "Kab. Bogor", cap: 2600, peak: 0.78, ff: 38, weekend: 1.62 },
  { id: "jakbog", name: "Jl. Raya Jakarta–Bogor (Cibinong)", short: "Raya Jakarta–Bogor", region: "bogor", area: "Kab. Bogor", cap: 5200, peak: 1.06, ff: 45, weekend: 0.85 },
  { id: "soleis", name: "Jl. KH Sholeh Iskandar", short: "Sholeh Iskandar", region: "bogor", area: "Kota Bogor", cap: 4400, peak: 1.12, ff: 42, weekend: 0.9 },
  { id: "pajajaran", name: "Jl. Raya Pajajaran", short: "Raya Pajajaran", region: "bogor", area: "Kota Bogor", cap: 4800, peak: 1.08, ff: 38, weekend: 1.0 },
  { id: "tajur", name: "Jl. Raya Tajur", short: "Raya Tajur", region: "bogor", area: "Kota Bogor", cap: 3200, peak: 1.02, ff: 36, weekend: 1.15 },
  { id: "mayoroking", name: "Jl. Mayor Oking (Cibinong)", short: "Mayor Oking", region: "bogor", area: "Kab. Bogor", cap: 2800, peak: 0.96, ff: 34, weekend: 0.85 },
  { id: "parung", name: "Jl. Raya Parung", short: "Raya Parung", region: "bogor", area: "Kab. Bogor", cap: 3000, peak: 1.0, ff: 40, weekend: 0.95 },
  { id: "dramaga", name: "Jl. Raya Dramaga", short: "Raya Dramaga", region: "bogor", area: "Kab. Bogor", cap: 2700, peak: 0.93, ff: 36, weekend: 0.9 },
  // Depok
  { id: "margonda", name: "Jl. Margonda Raya", short: "Margonda Raya", region: "depok", area: "Kota Depok", cap: 6200, peak: 1.18, ff: 40, weekend: 1.0 },
  { id: "juandadpk", name: "Jl. Ir. H. Juanda (Depok)", short: "Juanda Depok", region: "depok", area: "Kota Depok", cap: 4200, peak: 1.04, ff: 45, weekend: 0.95 },
  { id: "sawangan", name: "Jl. Raya Sawangan", short: "Raya Sawangan", region: "depok", area: "Kota Depok", cap: 2800, peak: 1.1, ff: 34, weekend: 0.95 },
  { id: "raybogor", name: "Jl. Raya Bogor (Cimanggis)", short: "Raya Bogor", region: "depok", area: "Kota Depok", cap: 4600, peak: 1.07, ff: 38, weekend: 0.85 },
  { id: "siliwangi", name: "Jl. Siliwangi", short: "Siliwangi", region: "depok", area: "Kota Depok", cap: 2600, peak: 0.97, ff: 32, weekend: 0.95 },
  { id: "tole", name: "Jl. Tole Iskandar", short: "Tole Iskandar", region: "depok", area: "Kota Depok", cap: 2400, peak: 0.94, ff: 34, weekend: 0.9 },
  { id: "cinere", name: "Jl. Raya Cinere", short: "Raya Cinere", region: "depok", area: "Kota Depok", cap: 2600, peak: 1.03, ff: 32, weekend: 1.0 },
  { id: "nusantara", name: "Jl. Nusantara Raya", short: "Nusantara Raya", region: "depok", area: "Kota Depok", cap: 2200, peak: 0.86, ff: 34, weekend: 0.95 },
  // Bekasi
  { id: "ayani", name: "Jl. Jend. Ahmad Yani (Bekasi)", short: "Ahmad Yani", region: "bekasi", area: "Kota Bekasi", cap: 5600, peak: 1.09, ff: 44, weekend: 0.95, cfd: true },
  { id: "kalimalang", name: "Jl. KH Noer Ali (Kalimalang)", short: "Kalimalang", region: "bekasi", area: "Kota Bekasi", cap: 5000, peak: 1.15, ff: 42, weekend: 0.9 },
  { id: "sudirmanbks", name: "Jl. Jend. Sudirman (Bulak Kapal)", short: "Sudirman Bekasi", region: "bekasi", area: "Kota Bekasi", cap: 4400, peak: 1.06, ff: 38, weekend: 0.95, cfd: true },
  { id: "narogong", name: "Jl. Raya Narogong", short: "Raya Narogong", region: "bekasi", area: "Kota Bekasi", cap: 3400, peak: 1.01, ff: 40, weekend: 0.85 },
  { id: "chairil", name: "Jl. Chairil Anwar", short: "Chairil Anwar", region: "bekasi", area: "Kota Bekasi", cap: 3000, peak: 0.98, ff: 36, weekend: 1.0 },
  { id: "juandabks", name: "Jl. Ir. H. Juanda (Bekasi)", short: "Juanda Bekasi", region: "bekasi", area: "Kota Bekasi", cap: 3400, peak: 1.04, ff: 34, weekend: 1.0 },
  { id: "tambun", name: "Jl. Sultan Hasanudin (Tambun)", short: "Sultan Hasanudin", region: "bekasi", area: "Kab. Bekasi", cap: 3600, peak: 1.08, ff: 38, weekend: 0.95 },
  { id: "cikarang", name: "Jl. Raya Cikarang–Cibarusah", short: "Cikarang–Cibarusah", region: "bekasi", area: "Kab. Bekasi", cap: 3800, peak: 1.03, ff: 44, weekend: 0.75 },
];

const ruasOf = (reg: SubRegion) => RUAS.filter((r) => r.region === reg);

/** Pengali agar ruas sampel mewakili seluruh titik pantau di wilayahnya. */
const regionScale = (reg: SubRegion) => (REGION[reg].titik / ruasOf(reg).length) * 0.55;

// ---------------------------------------------------------------------------
// Profil waktu
// ---------------------------------------------------------------------------

type ProfileKey = "weekday" | "fri" | "sat" | "sun" | "ramadan";

/** Bobot volume per jam 00–23. */
const PROFILES: Record<ProfileKey, number[]> = {
  weekday: [1.2, 0.8, 0.6, 0.6, 1.2, 3.0, 5.8, 7.0, 6.2, 5.0, 4.6, 4.6, 4.7, 4.6, 4.7, 5.2, 6.2, 7.1, 6.6, 5.2, 4.2, 3.3, 2.4, 1.6],
  // Jumatan menurunkan arus siang, arus pulang lebih panjang.
  fri: [1.3, 0.8, 0.6, 0.6, 1.2, 3.0, 5.7, 6.9, 6.1, 5.0, 4.7, 4.3, 4.0, 4.9, 5.0, 5.6, 6.7, 7.6, 7.4, 6.2, 5.2, 4.3, 3.3, 2.2],
  sat: [1.8, 1.2, 0.8, 0.7, 1.0, 2.0, 3.4, 4.3, 4.9, 5.4, 5.8, 5.9, 5.8, 5.6, 5.5, 5.7, 6.0, 6.2, 6.1, 5.7, 5.1, 4.5, 3.6, 2.6],
  sun: [2.0, 1.3, 0.9, 0.7, 0.9, 1.6, 2.2, 2.9, 3.6, 4.6, 5.3, 5.5, 5.4, 5.2, 5.1, 5.3, 5.6, 5.9, 5.6, 4.9, 4.1, 3.2, 2.3, 1.5],
  // Sahur pukul 03, arus pulang maju ke 15–17, lengang saat berbuka.
  ramadan: [1.6, 1.0, 0.9, 1.8, 1.9, 2.6, 5.4, 6.8, 6.0, 4.8, 4.3, 4.3, 4.4, 4.5, 4.9, 6.0, 7.4, 7.0, 3.4, 3.6, 5.0, 4.6, 3.2, 2.2],
};
const PEAK_REF = Math.max(...PROFILES.weekday);

const HOLIDAYS = new Set([
  "2025-12-25", "2025-12-26", "2026-01-01", "2026-01-16", "2026-02-17", "2026-03-18", "2026-03-19",
  "2026-04-03", "2026-05-01", "2026-05-14", "2026-05-27", "2026-05-31", "2026-06-01", "2026-06-16",
  "2026-08-17", "2026-08-25",
]);

/** Pengali kecepatan rata-rata akibat hujan, per bulan Jan–Des. */
const RAIN_SPEED = [0.9, 0.9, 0.94, 0.96, 1, 1, 1, 1, 1, 0.97, 0.95, 0.93];
const RAIN_CHANCE = [0.45, 0.45, 0.35, 0.3, 0.15, 0.1, 0.08, 0.06, 0.1, 0.25, 0.35, 0.4];

// ---------------------------------------------------------------------------
// Utilitas tanggal & acak deterministik
// ---------------------------------------------------------------------------

const DAY = 86_400_000;
const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const parts = (t: number) => {
  const d = new Date(t);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay() };
};
const dayRange = (start: number, n: number) => Array.from({ length: n }, (_, i) => start + i * DAY);

/** Tanggal acuan "hari ini" untuk data simulasi. */
export const TODAY = utc(2026, 9, 28);

export const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const pad = (n: number) => String(n).padStart(2, "0");
const hourLabel = (h: number) => `${pad(h)}.00`;

export function rand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let t = (h + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ---------------------------------------------------------------------------
// Model harian
// ---------------------------------------------------------------------------

interface DayContext {
  profile: ProfileKey;
  vol: number;
  speed: number;
  weekend: boolean;
  wd: number;
}

function dayContext(t: number): DayContext {
  const { m, wd } = parts(t);
  const k = iso(t);
  const between = (a: string, b: string) => k >= a && k <= b;

  let profile: ProfileKey = wd === 0 ? "sun" : wd === 6 ? "sat" : wd === 5 ? "fri" : "weekday";
  let weekend = wd === 0 || wd === 6;
  let vol = 1;
  let speed = RAIN_SPEED[m - 1];

  if (between("2026-02-19", "2026-03-19") && !weekend) profile = "ramadan";

  if (between("2026-03-20", "2026-03-24")) {
    // Idulfitri: sebagian besar warga Bodebek mudik, jalan kota lengang.
    profile = "sun";
    weekend = true;
    vol *= 0.55;
  } else if (between("2026-03-14", "2026-03-29")) {
    vol *= 0.8;
  } else if (HOLIDAYS.has(k)) {
    profile = "sun";
    weekend = true;
    vol *= 0.8;
  }

  if (between("2025-12-24", "2026-01-02")) vol *= 0.88;
  if (between("2026-06-27", "2026-07-12") && !weekend) vol *= 0.93; // libur sekolah

  vol *= 1 + 0.0026 * ((t - TODAY) / (30.4 * DAY)); // tren pertumbuhan ±3%/tahun

  if (rand(`hujan|${k}`) < RAIN_CHANCE[m - 1]) {
    speed *= 0.87;
    vol *= 0.97;
  }
  return { profile, vol, speed, weekend, wd };
}

function classShares(reg: SubRegion, h: number, weekend: boolean): ClassMix {
  const base = REGION[reg].share;
  const night = h >= 22 || h <= 4;
  const commute = (h >= 6 && h <= 8) || (h >= 16 && h <= 18);
  // Truk dibatasi jam sibuk di banyak ruas perkotaan, jadi bergeser ke malam.
  const mod: ClassMix = {
    motor: commute ? 1.06 : night ? 0.85 : 1,
    mobil: weekend ? 1.15 : 1,
    angkot: night ? 0.25 : h >= 5 && h <= 19 ? 1.08 : 0.8,
    busKecil: night ? 0.5 : 1,
    busBesar: night ? 1.3 : 1,
    trukRingan: (weekend ? 0.7 : 1) * (night ? 1.6 : commute ? 0.7 : 1),
    trukBerat: (weekend ? 0.6 : 1) * (night ? 2.8 : commute ? 0.45 : 1),
  };
  const raw = Object.fromEntries(VEHICLE_CLASSES.map(({ key }) => [key, base[key] * mod[key]])) as ClassMix;
  const sum = Object.values(raw).reduce((a, b) => a + b, 0);
  for (const { key } of VEHICLE_CLASSES) raw[key] /= sum;
  return raw;
}

interface RuasDay {
  ruas: Ruas;
  vol: number[];
  load: number[];
  speed: number[];
}

interface DayAgg {
  t: number;
  vol: number[];
  speedNum: number[];
  loadSum: number[];
  n: number;
  classes: ClassMix[];
  ruas: RuasDay[];
}

const emptyMix = (): ClassMix => ({ motor: 0, mobil: 0, angkot: 0, busKecil: 0, busBesar: 0, trukRingan: 0, trukBerat: 0 });
const zeros = () => new Array<number>(24).fill(0);

const regionDayCache = new Map<string, DayAgg>();

function regionDay(reg: SubRegion, t: number): DayAgg {
  const cacheKey = `${reg}|${t}`;
  const cached = regionDayCache.get(cacheKey);
  if (cached) return cached;

  const ctx = dayContext(t);
  const prof = PROFILES[ctx.profile];
  const scale = regionScale(reg);
  const day: DayAgg = { t, vol: zeros(), speedNum: zeros(), loadSum: zeros(), n: 0, classes: [], ruas: [] };

  for (const r of ruasOf(reg)) {
    const dayNoise = 1 + (rand(`${r.id}|${t}`) - 0.5) * 0.08;
    const rd: RuasDay = { ruas: r, vol: [], load: [], speed: [] };
    for (let h = 0; h < 24; h++) {
      let x = ((r.peak * prof[h]) / PEAK_REF) * ctx.vol * dayNoise * (1 + (rand(`${r.id}|${t}|${h}`) - 0.5) * 0.06);
      if (ctx.weekend) x *= r.weekend;
      if (r.cfd && ctx.wd === 0 && h >= 6 && h <= 9) x *= 0.25;
      const speed = (r.ff * ctx.speed) / (1 + x ** 3);
      rd.load.push(x);
      rd.vol.push(x * r.cap);
      rd.speed.push(speed);
      day.vol[h] += x * r.cap * scale;
      day.speedNum[h] += x * r.cap * scale * speed;
      day.loadSum[h] += x;
    }
    day.n++;
    day.ruas.push(rd);
  }
  for (let h = 0; h < 24; h++) {
    const shares = classShares(reg, h, ctx.weekend);
    const mix = emptyMix();
    for (const { key } of VEHICLE_CLASSES) mix[key] = day.vol[h] * shares[key];
    day.classes.push(mix);
  }
  regionDayCache.set(cacheKey, day);
  return day;
}

function dayAgg(regs: SubRegion[], t: number): DayAgg {
  const days = regs.map((r) => regionDay(r, t));
  if (days.length === 1) return days[0];
  const out: DayAgg = { t, vol: zeros(), speedNum: zeros(), loadSum: zeros(), n: 0, classes: [], ruas: [] };
  for (let h = 0; h < 24; h++) {
    const mix = emptyMix();
    for (const d of days) {
      out.vol[h] += d.vol[h];
      out.speedNum[h] += d.speedNum[h];
      out.loadSum[h] += d.loadSum[h];
      for (const { key } of VEHICLE_CLASSES) mix[key] += d.classes[h][key];
    }
    out.classes.push(mix);
  }
  for (const d of days) {
    out.n += d.n;
    out.ruas.push(...d.ruas);
  }
  return out;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const round1 = (n: number) => Math.round(n * 10) / 10;

interface Totals {
  days: DayAgg[];
  vol: number;
  speed: number;
  classes: ClassMix;
  /** Rata-rata beban jam tersibuk harian per ruas. */
  ruasPeak: Map<string, number>;
  ruasVol: Map<string, number>;
  ruasSpeed: Map<string, number>;
}

function totals(regs: SubRegion[], dates: number[]): Totals {
  const days = dates.map((t) => dayAgg(regs, t));
  const classes = emptyMix();
  let vol = 0;
  let speedNum = 0;
  const peak = new Map<string, number>();
  const rVol = new Map<string, number>();
  const rSpeedNum = new Map<string, number>();
  for (const d of days) {
    vol += sum(d.vol);
    speedNum += sum(d.speedNum);
    for (const mix of d.classes) for (const { key } of VEHICLE_CLASSES) classes[key] += mix[key];
    for (const rd of d.ruas) {
      const id = rd.ruas.id;
      peak.set(id, (peak.get(id) ?? 0) + Math.max(...rd.load) / days.length);
      rVol.set(id, (rVol.get(id) ?? 0) + sum(rd.vol));
      rSpeedNum.set(id, (rSpeedNum.get(id) ?? 0) + sum(rd.vol.map((v, h) => v * rd.speed[h])));
    }
  }
  const ruasSpeed = new Map([...rVol].map(([id, v]) => [id, rSpeedNum.get(id)! / v]));
  return { days, vol, speed: speedNum / vol, classes, ruasPeak: peak, ruasVol: rVol, ruasSpeed };
}

type TitikStatus = "lancar" | "padat" | "macet" | "mati";

/** Beban & kecepatan tiap persimpangan pantau pada jam tersibuknya. */
function titikStates(regs: SubRegion[], ruasPeak: Map<string, number>, loadFactor = 1) {
  const ruasById = new Map(RUAS.map((r) => [r.id, r]));
  return TITIK.filter((t) => regs.includes(t.region)).map((t) => {
    const r = ruasById.get(t.ruasId)!;
    const load = ruasPeak.get(r.id)! * (REGION[t.region].density + rand(`titik|${t.id}`) * 0.6) * loadFactor;
    const status: TitikStatus =
      t.camStatus === "mati" ? "mati" : load > LOAD_MACET ? "macet" : load >= LOAD_PADAT ? "padat" : "lancar";
    return { t, ruas: r, load, speed: (r.ff * 0.97) / (1 + load ** 3), status };
  });
}

function titikStatus(regs: SubRegion[], ruasPeak: Map<string, number>, loadFactor = 1) {
  const out: Record<TitikStatus, number> = { lancar: 0, padat: 0, macet: 0, mati: 0 };
  for (const s of titikStates(regs, ruasPeak, loadFactor)) out[s.status]++;
  return out;
}

function cameraCounts(regs: SubRegion[]) {
  const out = { sehat: 0, menurun: 0, mati: 0 };
  for (const t of TITIK) if (regs.includes(t.region)) out[t.camStatus]++;
  return out;
}

// ---------------------------------------------------------------------------
// Data statis: pelanggaran, kamera, notifikasi
// ---------------------------------------------------------------------------

const VIOLATION_SPOTS: { region: SubRegion; name: string; type: string; perDay: number }[] = [
  { region: "bogor", name: "Stasiun Bogor, Jl. Kapten Muslihat", type: "Angkot ngetem", perDay: 164 },
  { region: "bogor", name: "Pasar Anyar, Jl. Dewi Sartika", type: "Parkir liar", perDay: 142 },
  { region: "bogor", name: "Terminal Baranangsiang", type: "Angkot ngetem", perDay: 131 },
  { region: "bogor", name: "Simpang Pemda Cibinong", type: "Menerobos lampu merah", perDay: 118 },
  { region: "bogor", name: "Simpang Ciawi", type: "Lawan arah", perDay: 97 },
  { region: "bogor", name: "Pasar Cibinong, Jl. Mayor Oking", type: "Parkir liar", perDay: 88 },
  { region: "depok", name: "Terminal Depok, Jl. Margonda Raya", type: "Angkot ngetem", perDay: 188 },
  { region: "depok", name: "Pasar Kemirimuka, Jl. Margonda Raya", type: "Parkir liar", perDay: 139 },
  { region: "depok", name: "Simpang Juanda–Margonda", type: "Berhenti di kotak kuning", perDay: 126 },
  { region: "depok", name: "Stasiun Depok Baru", type: "Parkir liar", perDay: 121 },
  { region: "depok", name: "Pasar Cisalak, Jl. Raya Bogor", type: "Parkir liar", perDay: 109 },
  { region: "depok", name: "Simpang Parung Bingung, Sawangan", type: "Lawan arah", perDay: 94 },
  { region: "bekasi", name: "Stasiun Bekasi, Jl. Ir. H. Juanda", type: "Angkot ngetem", perDay: 176 },
  { region: "bekasi", name: "Terminal Induk Bekasi", type: "Angkot ngetem", perDay: 152 },
  { region: "bekasi", name: "Pasar Baru Bekasi", type: "Parkir liar", perDay: 139 },
  { region: "bekasi", name: "Simpang Tambun", type: "Lawan arah", perDay: 128 },
  { region: "bekasi", name: "Simpang Summarecon, Jl. Ahmad Yani", type: "Menerobos lampu merah", perDay: 117 },
  { region: "bekasi", name: "Pasar Cikarang", type: "Parkir liar", perDay: 101 },
];

const PROBLEM_CAMERAS: { region: SubRegion; id: string; location: string; per30: number; issue: string }[] = [
  { region: "bogor", id: "CAM-BGR-022", location: "Jl. Raya Tajur", per30: 12, issue: "gambar buram" },
  { region: "bogor", id: "CAM-BGR-007", location: "Jl. Raya Puncak", per30: 10, issue: "tertutup kabut" },
  { region: "bogor", id: "CAM-BGR-015", location: "Jl. Raya Parung", per30: 7, issue: "koneksi putus" },
  { region: "bogor", id: "CAM-BGR-003", location: "Jl. Raya Pajajaran", per30: 5, issue: "listrik padam" },
  { region: "bogor", id: "CAM-BGR-028", location: "Jl. Raya Dramaga", per30: 4, issue: "koneksi putus" },
  { region: "depok", id: "CAM-DPK-009", location: "Jl. Raya Cinere", per30: 9, issue: "koneksi putus" },
  { region: "depok", id: "CAM-DPK-014", location: "Jl. Raya Sawangan", per30: 8, issue: "gambar buram" },
  { region: "depok", id: "CAM-DPK-002", location: "Jl. Margonda Raya", per30: 6, issue: "posisi bergeser" },
  { region: "depok", id: "CAM-DPK-019", location: "Jl. Tole Iskandar", per30: 4, issue: "koneksi putus" },
  { region: "depok", id: "CAM-DPK-011", location: "Jl. Juanda", per30: 3, issue: "listrik padam" },
  { region: "bekasi", id: "CAM-BKS-017", location: "Jl. Raya Narogong", per30: 11, issue: "koneksi putus" },
  { region: "bekasi", id: "CAM-BKS-024", location: "Jl. Raya Cikarang–Cibarusah", per30: 9, issue: "debu tebal" },
  { region: "bekasi", id: "CAM-BKS-005", location: "Jl. KH Noer Ali", per30: 7, issue: "koneksi putus" },
  { region: "bekasi", id: "CAM-BKS-012", location: "Jl. Chairil Anwar", per30: 5, issue: "gambar buram" },
  { region: "bekasi", id: "CAM-BKS-029", location: "Jl. Sultan Hasanudin", per30: 4, issue: "listrik padam" },
];

export type NotificationTone = "critical" | "warning" | "info";

export interface DashboardNotification {
  id: string;
  region: SubRegion;
  category: string;
  tone: NotificationTone;
  minutesAgo: number;
  title: string;
  location?: string;
  detail: string;
  /** Tampilkan tombol menuju rekomendasi rekayasa lalu lintas. */
  hasRecommendation?: boolean;
}

const NOTIFICATIONS: DashboardNotification[] = [
  { id: "n1", region: "bekasi", category: "Kepadatan", tone: "critical", minutesAgo: 12, title: "Kalimalang arah Jakarta melebihi kapasitas", location: "Jl. KH Noer Ali, depan BCP", detail: "kecepatan 11 km/j · beban 118% · 4 periode berturut-turut", hasRecommendation: true },
  { id: "n2", region: "bogor", category: "Kepadatan", tone: "critical", minutesAgo: 9, title: "Simpang Pemda Cibinong melebihi kapasitas", location: "Jl. Raya Jakarta–Bogor", detail: "kecepatan 14 km/j · beban 109% · 3 periode berturut-turut", hasRecommendation: true },
  { id: "n3", region: "bekasi", category: "Penurunan mendadak", tone: "critical", minutesAgo: 3, title: "Kecepatan Jl. Jend. Sudirman turun 61%", location: "Bulak Kapal arah Tambun", detail: "31 → 12 km/j dalam 10 mnt · kemungkinan kendaraan mogok", hasRecommendation: true },
  { id: "n4", region: "depok", category: "Kepadatan", tone: "critical", minutesAgo: 25, title: "Jl. Raya Sawangan melebihi kapasitas", location: "Simpang Parung Bingung", detail: "kecepatan 13 km/j · beban 112%", hasRecommendation: true },
  { id: "n5", region: "depok", category: "Antrean", tone: "warning", minutesAgo: 7, title: "Antrean mendekati simpang sebelumnya", location: "Simpang Juanda–Margonda, pendekat barat", detail: "118 m dari 137 m ruang antre · 86% terisi" },
  { id: "n6", region: "depok", category: "Angkutan umum", tone: "warning", minutesAgo: 18, title: "Angkot ngetem di zona larangan berhenti", location: "Terminal Depok, sisi timur Margonda", detail: "6 kejadian / 30 mnt · 41 kendaraan terpaksa pindah lajur" },
  { id: "n7", region: "bogor", category: "Angkutan umum", tone: "warning", minutesAgo: 31, title: "Angkot ngetem di depan Stasiun Bogor", location: "Jl. Kapten Muslihat", detail: "9 kejadian / 30 mnt · lajur kiri tertutup" },
  { id: "n8", region: "bekasi", category: "CCTV mati", tone: "warning", minutesAgo: 42, title: "CAM-BKS-017 tidak mengirim data", location: "Jl. Raya Narogong", detail: "gangguan ke-11 dalam 30 hari · tim lapangan dijadwalkan" },
  { id: "n9", region: "bogor", category: "Kualitas kamera", tone: "warning", minutesAgo: 55, title: "CAM-BGR-022 gambar buram", location: "Jl. Raya Tajur", detail: "data tetap masuk namun ditandai kurang andal" },
  { id: "n10", region: "depok", category: "CCTV mati", tone: "warning", minutesAgo: 64, title: "CAM-DPK-009 tidak mengirim data", location: "Jl. Raya Cinere", detail: "gangguan ke-9 dalam 30 hari" },
  { id: "n11", region: "bekasi", category: "Pola tidak biasa", tone: "info", minutesAgo: 70, title: "Truk di Cikarang–Cibarusah 23% di atas rata-rata", location: "Kawasan industri Jababeka", detail: "antisipasi saat jam pulang kerja pabrik 16.00–17.00" },
  { id: "n12", region: "bogor", category: "Pola tidak biasa", tone: "info", minutesAgo: 118, title: "Arus ke Puncak 17% di atas rata-rata hari Senin", location: "Jl. Raya Puncak arah Cisarua", detail: "rombongan wisata, siapkan opsi satu arah sore nanti" },
];

// ---------------------------------------------------------------------------
// Kontrak data untuk UI
// ---------------------------------------------------------------------------

export type SeriesPoint = { label: string; speed: number; total: number } & ClassMix;

export interface HeatmapCell {
  /** Beban dalam persen kapasitas; null jika tidak ada data. */
  value: number | null;
  /** Teks di dalam sel (dipakai tampilan kalender). */
  text?: string;
  tip: string;
  highlight?: boolean;
}

export interface HeatmapData {
  layout: "grid" | "calendar";
  title: string;
  subtitle: string;
  rows: string[];
  cols: string[];
  /** Label kolom yang ditampilkan; string kosong berarti disembunyikan. */
  colTicks: string[];
  cells: HeatmapCell[][];
  note: string;
}

export interface DashboardData {
  regionLabel: string;
  periodLabel: string;
  compareLabel: string;
  kpi: {
    speed: number;
    speedDelta: number;
    volume: number;
    volumeDeltaPct: number;
    volumeCaption: string;
    camerasActive: number;
    camerasTotal: number;
    availability: number;
    macet: number;
    macetDelta: number;
    titikTotal: number;
  };
  composition: { key: VehicleKey; label: string; color: string; volume: number; share: number }[];
  status: { lancar: number; padat: number; macet: number; mati: number; caption: string };
  cameraHealth: { sehat: number; menurun: number; mati: number };
  series: SeriesPoint[];
  seriesMeta: {
    volumeTitle: string;
    volumeUnit: string;
    speedTitle: string;
    ticks: string[];
    speedMarks: { label: string; speed: number }[];
  };
  scatter: { points: { x: number; y: number; label: string }[]; xUnit: string; caption: string };
  topCongested: { name: string; area: string; load: number }[];
  topVolume: { name: string; area: string; volume: number }[];
  topViolations: { name: string; type: string; count: number }[];
  violationCaption: string;
  topCameras: { id: string; location: string; issue: string; count: number }[];
  cameraCaption: string;
  heatmap: HeatmapData;
  speedByArea: { title: string; items: { name: string; speed: number }[]; average: number; averageLabel: string };
  notifications: DashboardNotification[];
}

// ---------------------------------------------------------------------------
// Periode
// ---------------------------------------------------------------------------

interface PeriodSpec {
  dates: number[];
  compare: number[] | null;
  label: string;
  compareLabel: string;
  volumeCaption: string;
  availabilityShift: number;
}

function periodSpec(period: PeriodId): PeriodSpec {
  switch (period) {
    case "harian": {
      const p = parts(TODAY);
      return {
        dates: [TODAY],
        compare: [TODAY - 7 * DAY],
        label: `${DAYS[p.wd]}, ${p.d} ${MONTHS[p.m - 1]} ${p.y}`,
        compareLabel: `${DAYS[p.wd]} lalu`,
        volumeCaption: "kendaraan hari ini",
        availabilityShift: 0.2,
      };
    }
    case "mingguan":
      return {
        dates: dayRange(utc(2026, 9, 21), 7),
        compare: dayRange(utc(2026, 9, 14), 7),
        label: "21–27 September 2026",
        compareLabel: "minggu sebelumnya",
        volumeCaption: "kendaraan dalam 7 hari",
        availabilityShift: 0.5,
      };
    case "bulanan":
      return {
        dates: dayRange(utc(2026, 9, 1), 28),
        compare: dayRange(utc(2026, 8, 1), 28),
        label: "1–28 September 2026",
        compareLabel: "periode sama Agustus",
        volumeCaption: "kendaraan bulan ini",
        availabilityShift: 0,
      };
    case "tahunan": {
      const start = utc(2025, 10, 1);
      return {
        dates: dayRange(start, (TODAY - start) / DAY + 1),
        compare: null,
        label: "Oktober 2025 – September 2026",
        compareLabel: "12 bulan sebelumnya",
        volumeCaption: "kendaraan dalam 12 bulan",
        availabilityShift: -0.7,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Perakitan data dashboard
// ---------------------------------------------------------------------------

const pct = (load: number) => Math.round(load * 100);

function toPoint(label: string, vol: number, speedNum: number, classes: ClassMix): SeriesPoint {
  return { label, total: vol, speed: round1(speedNum / vol), ...classes };
}

function addMix(a: ClassMix, b: ClassMix) {
  for (const { key } of VEHICLE_CLASSES) a[key] += b[key];
}

function buildSeries(period: PeriodId, days: DayAgg[]): { series: SeriesPoint[]; ticks: string[] } {
  if (period === "harian") {
    const d = days[0];
    const series = d.vol.map((v, h) => toPoint(pad(h), v, d.speedNum[h], d.classes[h]));
    return { series, ticks: ["00", "03", "06", "09", "12", "15", "18", "21"] };
  }
  if (period === "mingguan") {
    const series: SeriesPoint[] = [];
    const ticks: string[] = [];
    for (const d of days) {
      const name = DAYS_SHORT[parts(d.t).wd];
      for (let h = 0; h < 24; h++) series.push(toPoint(`${name} ${pad(h)}`, d.vol[h], d.speedNum[h], d.classes[h]));
      ticks.push(`${name} 12`);
    }
    return { series, ticks };
  }
  if (period === "bulanan") {
    const series = days.map((d) => {
      const mix = emptyMix();
      d.classes.forEach((c) => addMix(mix, c));
      return toPoint(String(parts(d.t).d), sum(d.vol), sum(d.speedNum), mix);
    });
    return { series, ticks: series.filter((_, i) => i % 3 === 0).map((s) => s.label) };
  }
  // Tahunan: rata-rata volume harian per bulan supaya bulan bisa dibandingkan.
  const byMonth = new Map<string, { n: number; vol: number; speedNum: number; mix: ClassMix }>();
  for (const d of days) {
    const { m } = parts(d.t);
    const key = MONTHS_SHORT[m - 1];
    const acc = byMonth.get(key) ?? { n: 0, vol: 0, speedNum: 0, mix: emptyMix() };
    acc.n++;
    acc.vol += sum(d.vol);
    acc.speedNum += sum(d.speedNum);
    d.classes.forEach((c) => addMix(acc.mix, c));
    byMonth.set(key, acc);
  }
  const series = [...byMonth].map(([label, a]) => {
    const mix = emptyMix();
    for (const { key } of VEHICLE_CLASSES) mix[key] = a.mix[key] / a.n;
    return toPoint(label, a.vol / a.n, a.speedNum / a.n, mix);
  });
  return { series, ticks: series.map((s) => s.label) };
}

function speedMarks(period: PeriodId, series: SeriesPoint[]) {
  const minIn = (from: number, to: number) =>
    series.slice(from, to).reduce((best, p) => (p.speed < best.speed ? p : best));
  if (period === "harian") {
    return [minIn(5, 12), minIn(14, 22)].map((p) => ({ label: p.label, speed: p.speed }));
  }
  const p = minIn(0, series.length);
  return [{ label: p.label, speed: p.speed }];
}

function buildHeatmap(period: PeriodId, days: DayAgg[], topRuasIds: string[]): HeatmapData {
  const hours = Array.from({ length: 24 }, (_, h) => pad(h));
  const hourTicks = hours.map((h, i) => (i % 3 === 0 ? h : ""));
  const loadAt = (d: DayAgg, h: number) => d.loadSum[h] / d.n;

  const describePeak = (cells: HeatmapCell[][], rows: string[], cols: string[], fmt: (r: string, c: string) => string) => {
    let best = { v: -1, r: 0, c: 0 };
    cells.forEach((row, r) => row.forEach((cell, c) => {
      if (cell.value !== null && cell.value > best.v) best = { v: cell.value, r, c };
    }));
    return `Terpadat: ${fmt(rows[best.r], cols[best.c])}, beban ${best.v}% dari kapasitas`;
  };

  if (period === "harian") {
    const d = days[0];
    const byId = new Map(d.ruas.map((rd) => [rd.ruas.id, rd]));
    const list = topRuasIds.map((id) => byId.get(id)!);
    const rows = list.map((rd) => rd.ruas.short);
    const cells = list.map((rd) =>
      rd.load.map((l, h) => ({ value: pct(l), tip: `${rd.ruas.name} · ${hourLabel(h)} · beban ${pct(l)}%` })),
    );
    return {
      layout: "grid",
      title: "Pola kepadatan ruas per jam",
      subtitle: "Beban jalan tiap ruas utama hari ini",
      rows,
      cols: hours,
      colTicks: hourTicks,
      cells,
      note: describePeak(cells, rows, hours, (r, c) => `${r} pukul ${c}.00`),
    };
  }

  if (period === "mingguan") {
    const rows = days.map((d) => DAYS_SHORT[parts(d.t).wd]);
    const cells = days.map((d) =>
      hours.map((_, h) => {
        const v = pct(loadAt(d, h));
        const p = parts(d.t);
        return { value: v, tip: `${DAYS[p.wd]} ${p.d} Sep · ${hourLabel(h)} · beban ${v}%` };
      }),
    );
    return {
      layout: "grid",
      title: "Pola kepadatan hari terhadap jam",
      subtitle: "Beban jalan rata-rata semua ruas, 21–27 September 2026",
      rows,
      cols: hours,
      colTicks: hourTicks,
      cells,
      note: describePeak(cells, days.map((d) => DAYS[parts(d.t).wd]), hours, (r, c) => `${r} pukul ${c}.00`),
    };
  }

  if (period === "bulanan") {
    // Kalender September 2026, minggu dimulai Senin.
    const first = utc(2026, 9, 1);
    const offset = (parts(first).wd + 6) % 7;
    const byDate = new Map(days.map((d) => [parts(d.t).d, d]));
    const busiestLoad = (d: DayAgg) => pct(Math.max(...d.loadSum) / d.n);
    const cells: HeatmapCell[][] = [];
    const weeks = Math.ceil((offset + 30) / 7);
    let best = { v: -1, label: "" };
    for (let w = 0; w < weeks; w++) {
      const row: HeatmapCell[] = [];
      for (let c = 0; c < 7; c++) {
        const date = w * 7 + c - offset + 1;
        if (date < 1 || date > 30) {
          row.push({ value: null, tip: "" });
          continue;
        }
        const d = byDate.get(date);
        const dayName = DAYS[(c + 1) % 7];
        if (!d) {
          row.push({ value: null, text: String(date), tip: `${dayName} ${date} Sep · belum ada data` });
          continue;
        }
        const v = busiestLoad(d);
        if (v > best.v) best = { v, label: `${dayName} ${date} September` };
        row.push({ value: v, text: String(date), tip: `${dayName} ${date} Sep · beban jam tersibuk ${v}%`, highlight: d.t === TODAY });
      }
      cells.push(row);
    }
    return {
      layout: "calendar",
      title: "Kalender kepadatan",
      subtitle: "Beban jalan pada jam tersibuk tiap hari, September 2026",
      rows: Array.from({ length: weeks }, (_, i) => `M${i + 1}`),
      cols: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
      colTicks: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
      cells,
      note: `Hari terpadat: ${best.label}, beban ${best.v}% dari kapasitas. Akhir pekan cenderung lebih lengang.`,
    };
  }

  // Tahunan: bulan × jam.
  const byMonth = new Map<string, DayAgg[]>();
  for (const d of days) {
    const { m, y } = parts(d.t);
    const key = `${MONTHS_SHORT[m - 1]} ${String(y).slice(2)}`;
    byMonth.set(key, [...(byMonth.get(key) ?? []), d]);
  }
  const rows = [...byMonth.keys()];
  const cells = [...byMonth].map(([month, list]) =>
    hours.map((_, h) => {
      const v = pct(sum(list.map((d) => loadAt(d, h))) / list.length);
      return { value: v, tip: `${month} · ${hourLabel(h)} · beban rata-rata ${v}%` };
    }),
  );
  return {
    layout: "grid",
    title: "Pola kepadatan bulan terhadap jam",
    subtitle: "Beban jalan rata-rata per jam, Oktober 2025 – September 2026",
    rows,
    cols: hours,
    colTicks: hourTicks,
    cells,
    note: "Maret paling lengang karena mudik Lebaran; saat Ramadan puncak sore maju ke pukul 16.00 dan lengang saat berbuka.",
  };
}

export function getDashboardData(region: RegionId, period: PeriodId): DashboardData {
  const regs: SubRegion[] = region === "bodebek" ? ["bogor", "depok", "bekasi"] : [region];
  const spec = periodSpec(period);
  const cur = totals(regs, spec.dates);
  const prev = spec.compare ? totals(regs, spec.compare) : null;

  const regionLabel = REGIONS.find((r) => r.id === region)!.label;
  const titikTotal = sum(regs.map((r) => REGION[r].titik));

  // KPI
  const prevVol = prev ? prev.vol : cur.vol / 1.031;
  const prevSpeed = prev ? prev.speed : cur.speed + 0.7;
  const status = titikStatus(regs, cur.ruasPeak);
  const prevStatus = titikStatus(regs, prev ? prev.ruasPeak : cur.ruasPeak, prev ? 1 : 1 / 1.03);
  const cams = cameraCounts(regs);
  const availability =
    sum(regs.map((r) => (REGION[r].availability + spec.availabilityShift) * REGION[r].titik)) / titikTotal;

  // Komposisi
  const composition = VEHICLE_CLASSES.map(({ key, label, color }) => ({
    key,
    label,
    color,
    volume: cur.classes[key],
    share: (cur.classes[key] / cur.vol) * 100,
  }));

  // Seri waktu
  const { series, ticks } = buildSeries(period, cur.days);
  const unitPer = period === "harian" || period === "mingguan" ? "jam" : "hari";
  const seriesTitles: Record<PeriodId, [string, string]> = {
    harian: ["Volume kendaraan per jam", "Kecepatan rata-rata per jam"],
    mingguan: ["Volume kendaraan per jam, 7 hari", "Kecepatan rata-rata per jam, 7 hari"],
    bulanan: ["Volume kendaraan per hari", "Kecepatan rata-rata per hari"],
    tahunan: ["Rata-rata volume harian tiap bulan", "Kecepatan rata-rata tiap bulan"],
  };

  // Sebaran volume–kecepatan
  const points =
    period === "tahunan"
      ? cur.days.map((d) => {
          const p = parts(d.t);
          return { x: sum(d.vol) / 1000, y: round1(sum(d.speedNum) / sum(d.vol)), label: `${p.d} ${MONTHS_SHORT[p.m - 1]} ${p.y}` };
        })
      : cur.days.flatMap((d) => {
          const p = parts(d.t);
          const prefix = period === "harian" ? "" : period === "mingguan" ? `${DAYS_SHORT[p.wd]} ` : `${p.d} Sep, `;
          return d.vol.map((v, h) => ({ x: v / 1000, y: round1(d.speedNum[h] / v), label: `${prefix}${hourLabel(h)}` }));
        });

  // Peringkat ruas
  const ruasList = RUAS.filter((r) => regs.includes(r.region));
  const byPeak = [...ruasList].sort((a, b) => cur.ruasPeak.get(b.id)! - cur.ruasPeak.get(a.id)!);
  const topCongested = byPeak.slice(0, 5).map((r) => ({ name: r.name, area: r.area, load: pct(cur.ruasPeak.get(r.id)!) }));
  const topVolume = [...ruasList]
    .sort((a, b) => cur.ruasVol.get(b.id)! - cur.ruasVol.get(a.id)!)
    .slice(0, 5)
    .map((r) => ({ name: r.name, area: r.area, volume: cur.ruasVol.get(r.id)! }));

  const nDays = spec.dates.length;
  const topViolations = VIOLATION_SPOTS.filter((v) => regs.includes(v.region))
    .map((v) => ({
      name: v.name,
      type: v.type,
      count: Math.round(v.perDay * nDays * (0.88 + rand(`langgar|${v.name}|${period}`) * 0.24)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const cameraFactor = period === "tahunan" ? 11.6 : 1;
  const topCameras = PROBLEM_CAMERAS.filter((c) => regs.includes(c.region))
    .map((c) => ({
      id: c.id,
      location: c.location,
      issue: c.issue,
      count: Math.round(c.per30 * cameraFactor * (period === "tahunan" ? 0.85 + rand(`kam|${c.id}`) * 0.3 : 1)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Kecepatan per wilayah
  const speedOf = (ids: string[]) => {
    const v = sum(ids.map((id) => cur.ruasVol.get(id)!));
    return sum(ids.map((id) => cur.ruasVol.get(id)! * cur.ruasSpeed.get(id)!)) / v;
  };
  const speedByArea =
    region === "bodebek"
      ? {
          title: "Kecepatan per kota & kabupaten",
          items: (["Kota Bogor", "Kab. Bogor", "Kota Depok", "Kota Bekasi", "Kab. Bekasi"] as Area[])
            .map((area) => ({ name: area, speed: round1(speedOf(ruasList.filter((r) => r.area === area).map((r) => r.id))) }))
            .sort((a, b) => b.speed - a.speed),
          average: round1(cur.speed),
          averageLabel: `rata-rata Bodebek ${round1(cur.speed).toLocaleString("id-ID")} km/j`,
        }
      : {
          title: "Kecepatan per ruas",
          items: ruasList
            .map((r) => ({ name: r.short, speed: round1(cur.ruasSpeed.get(r.id)!) }))
            .sort((a, b) => b.speed - a.speed),
          average: round1(cur.speed),
          averageLabel: `rata-rata ${regionLabel} ${round1(cur.speed).toLocaleString("id-ID")} km/j`,
        };

  const toneRank: Record<NotificationTone, number> = { critical: 0, warning: 1, info: 2 };
  const notifications = NOTIFICATIONS.filter((n) => regs.includes(n.region)).sort(
    (a, b) => toneRank[a.tone] - toneRank[b.tone] || a.minutesAgo - b.minutesAgo,
  );

  return {
    regionLabel,
    periodLabel: spec.label,
    compareLabel: spec.compareLabel,
    kpi: {
      speed: round1(cur.speed),
      speedDelta: round1(cur.speed - prevSpeed),
      volume: cur.vol,
      volumeDeltaPct: round1(((cur.vol - prevVol) / prevVol) * 100),
      volumeCaption: spec.volumeCaption,
      camerasActive: cams.sehat + cams.menurun,
      camerasTotal: titikTotal,
      availability: round1(availability),
      macet: status.macet,
      macetDelta: status.macet - prevStatus.macet,
      titikTotal,
    },
    composition,
    status: {
      ...status,
      caption:
        period === "harian"
          ? "Status tiap titik pantau pada jam tersibuknya hari ini."
          : "Status tiap titik pantau pada jam tersibuk, dirata-rata selama periode.",
    },
    cameraHealth: cams,
    series,
    seriesMeta: {
      volumeTitle: seriesTitles[period][0],
      volumeUnit: `ribu kend/${unitPer}`,
      speedTitle: seriesTitles[period][1],
      ticks,
      speedMarks: speedMarks(period, series),
    },
    scatter: {
      points,
      xUnit: period === "tahunan" ? "ribu kend/hari" : "ribu kend/jam",
      caption:
        period === "tahunan"
          ? "Tiap titik mewakili satu hari. Hari lebih ramai cenderung lebih lambat."
          : "Tiap titik mewakili satu jam. Makin ramai jalan, makin turun kecepatannya.",
    },
    topCongested,
    topVolume,
    topViolations,
    violationCaption: period === "harian" ? "jumlah kejadian hari ini" : `jumlah kejadian selama ${nDays} hari`,
    topCameras,
    cameraCaption: period === "tahunan" ? "jumlah gangguan dalam 12 bulan" : "jumlah gangguan dalam 30 hari terakhir",
    heatmap: buildHeatmap(period, cur.days, byPeak.slice(0, 10).map((r) => r.id)),
    speedByArea,
    notifications,
  };
}

// ---------------------------------------------------------------------------
// Peta titik pantau
// ---------------------------------------------------------------------------

export interface MapPoint {
  id: string;
  name: string;
  road: string;
  area: Area;
  region: SubRegion;
  lat: number;
  lon: number;
  camera: string;
  camStatus: "sehat" | "menurun" | "mati";
  offlineFor?: string;
  status: TitikStatus;
  /** Beban jalan pada jam tersibuk, persen kapasitas. */
  load: number;
  /** Kecepatan pada jam tersibuk, km/jam. */
  speed: number;
}

export interface MapData {
  regionLabel: string;
  periodLabel: string;
  statusCaption: string;
  points: MapPoint[];
  summary: Record<TitikStatus, number> & { total: number };
  critical: MapPoint[];
  offline: MapPoint[];
}

export function getMapData(region: RegionId, period: PeriodId): MapData {
  const regs: SubRegion[] = region === "bodebek" ? ["bogor", "depok", "bekasi"] : [region];
  const spec = periodSpec(period);
  const cur = totals(regs, spec.dates);

  const points: MapPoint[] = titikStates(regs, cur.ruasPeak).map(({ t, ruas, load, speed, status }) => ({
    id: t.id,
    name: t.name,
    road: ruas.name,
    area: ruas.area,
    region: t.region,
    lat: t.lat,
    lon: t.lon,
    camera: t.camera,
    camStatus: t.camStatus,
    offlineFor: t.offlineFor,
    status,
    load: pct(load),
    speed: Math.round(speed),
  }));

  const summary = { lancar: 0, padat: 0, macet: 0, mati: 0, total: points.length };
  for (const p of points) summary[p.status]++;

  return {
    regionLabel: REGIONS.find((r) => r.id === region)!.label,
    periodLabel: spec.label,
    statusCaption:
      period === "harian"
        ? "Status dan kecepatan diambil pada jam tersibuk tiap titik hari ini."
        : "Status dan kecepatan pada jam tersibuk tiap titik, dirata-rata selama periode.",
    points,
    summary,
    critical: points
      .filter((p) => p.status !== "mati")
      .sort((a, b) => a.speed - b.speed || b.load - a.load)
      .slice(0, 5),
    offline: points.filter((p) => p.status === "mati"),
  };
}

/** Info ruas untuk modul lain (insiden, ruang kendali). */
export function ruasInfo(id: string): { name: string; short: string; area: Area; region: SubRegion } {
  const r = RUAS.find((x) => x.id === id);
  if (!r) throw new Error(`Ruas tidak dikenal: ${id}`);
  return { name: r.name, short: r.short, area: r.area, region: r.region };
}

export const AREAS: Area[] = ["Kota Bogor", "Kab. Bogor", "Kota Depok", "Kota Bekasi", "Kab. Bekasi"];
