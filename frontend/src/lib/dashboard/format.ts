const formatters = new Map<number, Intl.NumberFormat>();

/** Format angka gaya Indonesia: koma desimal, titik ribuan. */
export function fmt(n: number, digits = 0) {
  let f = formatters.get(digits);
  if (!f) {
    f = new Intl.NumberFormat("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    formatters.set(digits, f);
  }
  return f.format(n);
}

/** Pecah jumlah besar menjadi angka + satuan, mis. 2.365.406 → { value: "2,37", unit: "juta" }. */
export function splitCount(n: number): { value: string; unit: string } {
  if (n >= 1e9) return { value: fmt(n / 1e9, 2), unit: "miliar" };
  if (n >= 1e6) return { value: fmt(n / 1e6, n >= 1e8 ? 0 : n >= 1e7 ? 1 : 2), unit: "juta" };
  if (n >= 1e3) return { value: fmt(n / 1e3, n >= 1e5 ? 0 : 1), unit: "rb" };
  return { value: fmt(n), unit: "" };
}

export function fmtCount(n: number) {
  const { value, unit } = splitCount(n);
  return unit ? `${value} ${unit}` : value;
}

export function fmtSigned(n: number, digits = 0) {
  return `${n > 0 ? "+" : n < 0 ? "−" : "±"}${fmt(Math.abs(n), digits)}`;
}

/** Kategori beban jalan (persen dari kapasitas). */
export function loadStatus(pct: number): { label: string; tone: "ok" | "warn" | "bad" } {
  if (pct > 100) return { label: "Macet", tone: "bad" };
  if (pct >= 70) return { label: "Padat", tone: "warn" };
  return { label: "Lancar", tone: "ok" };
}

export const toneText = { ok: "text-ok", warn: "text-warn", bad: "text-bad", info: "text-info", neutral: "text-muted" } as const;

const LOAD_STOPS: [number, [number, number, number]][] = [
  [0, [232, 245, 238]],
  [40, [184, 226, 202]],
  [62, [112, 192, 150]],
  [74, [244, 204, 112]],
  [88, [238, 150, 78]],
  [100, [224, 94, 72]],
  [115, [196, 52, 58]],
];

/** Sel heatmap yang cukup gelap memakai teks putih. */
export const loadNeedsLightText = (pct: number) => pct >= 92;

/** Warna heatmap untuk beban jalan dalam persen. */
export function loadColor(pct: number) {
  const v = Math.max(LOAD_STOPS[0][0], Math.min(pct, LOAD_STOPS[LOAD_STOPS.length - 1][0]));
  for (let i = 1; i < LOAD_STOPS.length; i++) {
    const [p1, c1] = LOAD_STOPS[i];
    const [p0, c0] = LOAD_STOPS[i - 1];
    if (v <= p1) {
      const t = (v - p0) / (p1 - p0);
      const c = c0.map((ch, k) => Math.round(ch + (c1[k] - ch) * t));
      return `rgb(${c[0]} ${c[1]} ${c[2]})`;
    }
  }
  return "rgb(226 72 72)";
}

export const LOAD_GRADIENT = `linear-gradient(to right, ${LOAD_STOPS.map(([p, c]) => `rgb(${c.join(" ")}) ${(p / 115) * 100}%`).join(", ")})`;
