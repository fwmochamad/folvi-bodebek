/**
 * Sumber video demo untuk video wall Ruang Kendali.
 *
 * Tiga rekaman arus lalu lintas yang sudah dianotasi deteksi kendaraan
 * (bounding box per klasifikasi + garis hitung dan panel jumlah kendaraan).
 * Berkasnya ada di public/cctv/. Titik pantau Bodebek memakai rekaman ini
 * secara acak sebagai tampilan demo sampai kamera Bodebek sendiri terhubung
 * ke VMS.
 *
 * Sumber boleh berupa berkas video biasa (diputar berulang) atau siaran HLS
 * (.m3u8), misalnya:
 *   { label: "Bundaran Senayan", url: "https://cctv-stream.balitower.co.id/<nama-stream>/index.m3u8" },
 *
 * Selama daftar ini kosong, kotak kamera menampilkan "Sumber video belum diatur".
 */
export interface DemoStream {
  label: string;
  url: string;
}

export const DEMO_STREAMS: DemoStream[] = [
  { label: "Arus Lalin 1", url: "/cctv/arus-lalin-1.mp4" },
  { label: "Arus Lalin 2", url: "/cctv/arus-lalin-2.mp4" },
  { label: "Arus Lalin 3", url: "/cctv/arus-lalin-3.mp4" },
];

/**
 * Siaran demo untuk sebuah kamera, dipilih acak dari ID-nya (hash FNV-1a) agar
 * kamera yang sama selalu menampilkan rekaman yang sama. Null jika belum ada sumber.
 */
export function demoStreamFor(cameraId: string): DemoStream | null {
  if (!DEMO_STREAMS.length) return null;
  let h = 0x811c9dc5;
  for (let i = 0; i < cameraId.length; i++) h = Math.imul(h ^ cameraId.charCodeAt(i), 0x01000193);
  return DEMO_STREAMS[(h >>> 0) % DEMO_STREAMS.length];
}
