/**
 * Sumber video demo untuk video wall Ruang Kendali.
 *
 * Rencananya diisi 10 siaran CCTV publik Bali Tower (Jakarta) dalam format
 * HLS (.m3u8). Titik pantau Bodebek memakai siaran ini secara bergiliran
 * sebagai tampilan demo sampai kamera Bodebek sendiri terhubung ke VMS.
 *
 * Server Bali Tower (cctv-stream.balitower.co.id) mengizinkan pemutaran dari
 * browser (CORS terbuka). Contoh isian:
 *   { label: "Bundaran Senayan", url: "https://cctv-stream.balitower.co.id/<nama-stream>/index.m3u8" },
 *
 * Selama daftar ini kosong, kotak kamera menampilkan "Sumber video belum diatur".
 */
export interface DemoStream {
  label: string;
  url: string;
}

export const DEMO_STREAMS: DemoStream[] = [];

/** Siaran demo untuk kamera ke-n (bergiliran), atau null jika belum ada sumber. */
export function demoStreamFor(index: number): DemoStream | null {
  return DEMO_STREAMS.length ? DEMO_STREAMS[index % DEMO_STREAMS.length] : null;
}
