import type { MapPoint } from "@/lib/dashboard/data";

export const STATUS_STYLE: Record<MapPoint["status"], { color: string; label: string }> = {
  lancar: { color: "#2e9d6c", label: "Lancar" },
  padat: { color: "#e8a03a", label: "Padat" },
  macet: { color: "#dc4848", label: "Macet" },
  mati: { color: "#8f97a8", label: "CCTV mati" },
};
