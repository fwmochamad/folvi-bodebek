/**
 * 82 titik pantau CCTV di persimpangan utama Bogor, Depok, dan Bekasi.
 *
 * Koordinat diambil dari simpul persimpangan OpenStreetMap (Overpass API,
 * data © kontributor OpenStreetMap, lisensi ODbL) di sepanjang ruas yang
 * dipantau. Status kamera adalah kondisi simulasi saat ini.
 */

export interface Titik {
  id: string;
  name: string;
  ruasId: string;
  region: "bogor" | "depok" | "bekasi";
  lat: number;
  lon: number;
  camera: string;
  camStatus: "sehat" | "menurun" | "mati";
  /** Lama kamera tidak mengirim data. */
  offlineFor?: string;
}

export const TITIK: Titik[] = [
  { id: "bgr-01", name: "Simpang Raya Puncak – Raya Golf Gunung Geulis", ruasId: "puncak", region: "bogor", lat: -6.65235, lon: 106.86919, camera: "CAM-BGR-001", camStatus: "sehat" },
  { id: "bgr-02", name: "Simpang Raya Puncak – Babakan", ruasId: "puncak", region: "bogor", lat: -6.68355, lon: 106.94925, camera: "CAM-BGR-002", camStatus: "sehat" },
  { id: "bgr-03", name: "Simpang Pajajaran – Achmad Sobana", ruasId: "pajajaran", region: "bogor", lat: -6.58079, lon: 106.80672, camera: "CAM-BGR-003", camStatus: "sehat" },
  { id: "bgr-04", name: "Simpang Raya Puncak – Taman Safari", ruasId: "puncak", region: "bogor", lat: -6.68739, lon: 106.94015, camera: "CAM-BGR-004", camStatus: "sehat" },
  { id: "bgr-05", name: "Simpang Raya Bogor – Alternatif GOR Pemda", ruasId: "jakbog", region: "bogor", lat: -6.5183, lon: 106.83611, camera: "CAM-BGR-005", camStatus: "sehat" },
  { id: "bgr-06", name: "Simpang Raya Bogor – Tegar Beriman", ruasId: "jakbog", region: "bogor", lat: -6.4851, lon: 106.84374, camera: "CAM-BGR-006", camStatus: "sehat" },
  { id: "bgr-07", name: "Simpang Raya Puncak – Jend. Hoegeng Iman Santoso", ruasId: "puncak", region: "bogor", lat: -6.65545, lon: 106.85908, camera: "CAM-BGR-007", camStatus: "menurun" },
  { id: "bgr-08", name: "Simpang Raya Bogor – Raya Mayor Oking", ruasId: "jakbog", region: "bogor", lat: -6.46544, lon: 106.85552, camera: "CAM-BGR-008", camStatus: "sehat" },
  { id: "bgr-09", name: "Simpang Raya Bogor – KS Tubun (selatan)", ruasId: "jakbog", region: "bogor", lat: -6.5603, lon: 106.81309, camera: "CAM-BGR-009", camStatus: "sehat" },
  { id: "bgr-10", name: "Simpang Raya Bogor – KS Tubun (utara)", ruasId: "jakbog", region: "bogor", lat: -6.54724, lon: 106.82387, camera: "CAM-BGR-010", camStatus: "sehat" },
  { id: "bgr-11", name: "Simpang Raya Bogor – Raya Cikaret", ruasId: "jakbog", region: "bogor", lat: -6.47796, lon: 106.84498, camera: "CAM-BGR-011", camStatus: "sehat" },
  { id: "bgr-12", name: "Simpang Sholeh Iskandar – Raya Semplak", ruasId: "soleis", region: "bogor", lat: -6.52353, lon: 106.76165, camera: "CAM-BGR-012", camStatus: "sehat" },
  { id: "bgr-13", name: "Simpang Sholeh Iskandar – KH R. Abdullah Bin Nuh", ruasId: "soleis", region: "bogor", lat: -6.55614, lon: 106.77889, camera: "CAM-BGR-013", camStatus: "sehat" },
  { id: "bgr-14", name: "Simpang Sholeh Iskandar – Raya Cilebut", ruasId: "soleis", region: "bogor", lat: -6.5616, lon: 106.80201, camera: "CAM-BGR-014", camStatus: "sehat" },
  { id: "bgr-15", name: "Simpang Raya Parung – Kemang–Ciseeng", ruasId: "parung", region: "bogor", lat: -6.47574, lon: 106.72917, camera: "CAM-BGR-015", camStatus: "mati", offlineFor: "3 jam" },
  { id: "bgr-16", name: "Simpang Sholeh Iskandar – Kayumanis", ruasId: "soleis", region: "bogor", lat: -6.53728, lon: 106.76986, camera: "CAM-BGR-016", camStatus: "sehat" },
  { id: "bgr-17", name: "Simpang Pajajaran – Achmad Adnawijaya", ruasId: "pajajaran", region: "bogor", lat: -6.56891, lon: 106.80916, camera: "CAM-BGR-017", camStatus: "sehat" },
  { id: "bgr-18", name: "Simpang Pajajaran – Jalak Harupat", ruasId: "pajajaran", region: "bogor", lat: -6.59575, lon: 106.80428, camera: "CAM-BGR-018", camStatus: "mati", offlineFor: "2 jam" },
  { id: "bgr-19", name: "Simpang Pajajaran – RSA Kartadjumena", ruasId: "pajajaran", region: "bogor", lat: -6.60767, lon: 106.80981, camera: "CAM-BGR-019", camStatus: "sehat" },
  { id: "bgr-20", name: "Simpang Pajajaran – Sukasari 1", ruasId: "pajajaran", region: "bogor", lat: -6.61875, lon: 106.81553, camera: "CAM-BGR-020", camStatus: "sehat" },
  { id: "bgr-21", name: "Simpang Tajur – Raya Bogor–Sukabumi", ruasId: "tajur", region: "bogor", lat: -6.64366, lon: 106.83888, camera: "CAM-BGR-021", camStatus: "sehat" },
  { id: "bgr-22", name: "Simpang Tajur – Jend. Hoegeng Iman Santoso", ruasId: "tajur", region: "bogor", lat: -6.65584, lon: 106.84717, camera: "CAM-BGR-022", camStatus: "menurun" },
  { id: "bgr-23", name: "Simpang Mayor Oking – Lingkar Puspanegara", ruasId: "mayoroking", region: "bogor", lat: -6.48628, lon: 106.87633, camera: "CAM-BGR-023", camStatus: "sehat" },
  { id: "bgr-24", name: "Simpang Mayor Oking – H.A. Ashari", ruasId: "mayoroking", region: "bogor", lat: -6.47946, lon: 106.86337, camera: "CAM-BGR-024", camStatus: "sehat" },
  { id: "bgr-25", name: "Simpang Mayor Oking – Lanbau", ruasId: "mayoroking", region: "bogor", lat: -6.48426, lon: 106.87067, camera: "CAM-BGR-025", camStatus: "mati", offlineFor: "25 mnt" },
  { id: "bgr-26", name: "Simpang Raya Parung – H. Mawi", ruasId: "parung", region: "bogor", lat: -6.42179, lon: 106.73277, camera: "CAM-BGR-026", camStatus: "sehat" },
  { id: "bgr-27", name: "Simpang Raya Parung – Arco Raya", ruasId: "parung", region: "bogor", lat: -6.44784, lon: 106.73194, camera: "CAM-BGR-027", camStatus: "sehat" },
  { id: "bgr-28", name: "Simpang Dramaga – KH R. Abdullah Bin Nuh", ruasId: "dramaga", region: "bogor", lat: -6.57348, lon: 106.75138, camera: "CAM-BGR-028", camStatus: "sehat" },
  { id: "bgr-29", name: "Simpang Dramaga – Kereteg–Petir (timur)", ruasId: "dramaga", region: "bogor", lat: -6.60594, lon: 106.74229, camera: "CAM-BGR-029", camStatus: "mati", offlineFor: "5 jam" },
  { id: "bgr-30", name: "Simpang Dramaga – Kereteg–Petir (barat)", ruasId: "dramaga", region: "bogor", lat: -6.6118, lon: 106.72818, camera: "CAM-BGR-030", camStatus: "sehat" },
  { id: "dpk-01", name: "Simpang Margonda – Ir. H. Juanda", ruasId: "margonda", region: "depok", lat: -6.37678, lon: 106.83186, camera: "CAM-DPK-001", camStatus: "sehat" },
  { id: "dpk-02", name: "Simpang Margonda – Arif Rahman Hakim", ruasId: "margonda", region: "depok", lat: -6.3902, lon: 106.82564, camera: "CAM-DPK-002", camStatus: "sehat" },
  { id: "dpk-03", name: "Simpang Margonda – Kartini", ruasId: "margonda", region: "depok", lat: -6.3991, lon: 106.81977, camera: "CAM-DPK-003", camStatus: "sehat" },
  { id: "dpk-04", name: "Simpang Juanda – Sakub", ruasId: "juandadpk", region: "depok", lat: -6.37904, lon: 106.8475, camera: "CAM-DPK-004", camStatus: "sehat" },
  { id: "dpk-05", name: "Simpang Juanda – Mohammed Yusuf", ruasId: "juandadpk", region: "depok", lat: -6.37959, lon: 106.8418, camera: "CAM-DPK-005", camStatus: "sehat" },
  { id: "dpk-06", name: "Simpang Raya Sawangan – Sawangan Raya (timur)", ruasId: "sawangan", region: "depok", lat: -6.39476, lon: 106.80259, camera: "CAM-DPK-006", camStatus: "sehat" },
  { id: "dpk-07", name: "Simpang Raya Bogor – Komjen Pol. M. Jasin", ruasId: "raybogor", region: "depok", lat: -6.35773, lon: 106.85936, camera: "CAM-DPK-007", camStatus: "sehat" },
  { id: "dpk-08", name: "Simpang Raya Bogor – Tole Iskandar", ruasId: "raybogor", region: "depok", lat: -6.41055, lon: 106.86149, camera: "CAM-DPK-008", camStatus: "sehat" },
  { id: "dpk-09", name: "Simpang Cinere – Punak Raya", ruasId: "cinere", region: "depok", lat: -6.32194, lon: 106.78378, camera: "CAM-DPK-009", camStatus: "mati", offlineFor: "1 jam" },
  { id: "dpk-10", name: "Simpang Raya Bogor – Radar Auri", ruasId: "raybogor", region: "depok", lat: -6.37229, lon: 106.86221, camera: "CAM-DPK-010", camStatus: "sehat" },
  { id: "dpk-11", name: "Simpang Juanda – Raya Bogor", ruasId: "juandadpk", region: "depok", lat: -6.382, lon: 106.86698, camera: "CAM-DPK-011", camStatus: "sehat" },
  { id: "dpk-12", name: "Simpang Raya Bogor – Mekar Sari", ruasId: "raybogor", region: "depok", lat: -6.36602, lon: 106.8595, camera: "CAM-DPK-012", camStatus: "sehat" },
  { id: "dpk-13", name: "Simpang Raya Bogor – Cilodong Raya", ruasId: "raybogor", region: "depok", lat: -6.43601, lon: 106.85282, camera: "CAM-DPK-013", camStatus: "mati", offlineFor: "4 jam" },
  { id: "dpk-14", name: "Simpang Raya Sawangan – Sawangan Raya (barat)", ruasId: "sawangan", region: "depok", lat: -6.39452, lon: 106.79393, camera: "CAM-DPK-014", camStatus: "menurun" },
  { id: "dpk-15", name: "Simpang Raya Bogor – Nangka", ruasId: "raybogor", region: "depok", lat: -6.39807, lon: 106.86482, camera: "CAM-DPK-015", camStatus: "sehat" },
  { id: "dpk-16", name: "Simpang Siliwangi – Tole Iskandar", ruasId: "siliwangi", region: "depok", lat: -6.40094, lon: 106.83117, camera: "CAM-DPK-016", camStatus: "sehat" },
  { id: "dpk-17", name: "Simpang Tole Iskandar – H. Dimun Raya", ruasId: "tole", region: "depok", lat: -6.40658, lon: 106.85209, camera: "CAM-DPK-017", camStatus: "sehat" },
  { id: "dpk-18", name: "Simpang Cinere – Anggrek", ruasId: "cinere", region: "depok", lat: -6.34517, lon: 106.77779, camera: "CAM-DPK-018", camStatus: "sehat" },
  { id: "dpk-19", name: "Simpang Tole Iskandar – Kemakmuran Raya", ruasId: "tole", region: "depok", lat: -6.40346, lon: 106.83682, camera: "CAM-DPK-019", camStatus: "mati", offlineFor: "18 mnt" },
  { id: "dpk-20", name: "Simpang Cinere – Bukit Cinere", ruasId: "cinere", region: "depok", lat: -6.33333, lon: 106.78289, camera: "CAM-DPK-020", camStatus: "sehat" },
  { id: "dpk-21", name: "Simpang Nusantara – Teratai Raya", ruasId: "nusantara", region: "depok", lat: -6.38888, lon: 106.81427, camera: "CAM-DPK-021", camStatus: "sehat" },
  { id: "dpk-22", name: "Simpang Nusantara – Salak", ruasId: "nusantara", region: "depok", lat: -6.39904, lon: 106.81349, camera: "CAM-DPK-022", camStatus: "mati", offlineFor: "9 jam" },
  { id: "bks-01", name: "Simpang Ahmad Yani – Siliwangi", ruasId: "ayani", region: "bekasi", lat: -6.25937, lon: 106.9949, camera: "CAM-BKS-001", camStatus: "sehat" },
  { id: "bks-02", name: "Simpang Ahmad Yani – Jend. Sudirman", ruasId: "ayani", region: "bekasi", lat: -6.23366, lon: 106.99319, camera: "CAM-BKS-002", camStatus: "sehat" },
  { id: "bks-03", name: "Simpang Ahmad Yani – Bulevar Selatan", ruasId: "ayani", region: "bekasi", lat: -6.22712, lon: 107.00355, camera: "CAM-BKS-003", camStatus: "sehat" },
  { id: "bks-04", name: "Simpang Ahmad Yani – Pekayon Raya", ruasId: "ayani", region: "bekasi", lat: -6.25628, lon: 106.99084, camera: "CAM-BKS-004", camStatus: "sehat" },
  { id: "bks-05", name: "Simpang Kalimalang – Pemuda Patriot", ruasId: "kalimalang", region: "bekasi", lat: -6.24927, lon: 106.96342, camera: "CAM-BKS-005", camStatus: "menurun" },
  { id: "bks-06", name: "Simpang Kalimalang – Pengairan", ruasId: "kalimalang", region: "bekasi", lat: -6.24945, lon: 106.99564, camera: "CAM-BKS-006", camStatus: "sehat" },
  { id: "bks-07", name: "Simpang Kalimalang – Caman Raya", ruasId: "kalimalang", region: "bekasi", lat: -6.24961, lon: 106.95313, camera: "CAM-BKS-007", camStatus: "sehat" },
  { id: "bks-08", name: "Simpang Kalimalang – Chandrabaga", ruasId: "kalimalang", region: "bekasi", lat: -6.24806, lon: 106.97863, camera: "CAM-BKS-008", camStatus: "sehat" },
  { id: "bks-09", name: "Simpang Kalimalang – Tawes Raya", ruasId: "kalimalang", region: "bekasi", lat: -6.24747, lon: 106.99059, camera: "CAM-BKS-009", camStatus: "sehat" },
  { id: "bks-10", name: "Simpang Sudirman – Pemuda Raya", ruasId: "sudirmanbks", region: "bekasi", lat: -6.22611, lon: 106.97994, camera: "CAM-BKS-010", camStatus: "sehat" },
  { id: "bks-11", name: "Simpang Sudirman – Nangka Raya", ruasId: "sudirmanbks", region: "bekasi", lat: -6.22919, lon: 106.9841, camera: "CAM-BKS-011", camStatus: "sehat" },
  { id: "bks-12", name: "Simpang Chairil Anwar – H. Mulyadi Joyomartono", ruasId: "chairil", region: "bekasi", lat: -6.26085, lon: 107.01899, camera: "CAM-BKS-012", camStatus: "menurun" },
  { id: "bks-13", name: "Simpang Narogong – Layang Cipendawa (selatan)", ruasId: "narogong", region: "bekasi", lat: -6.30124, lon: 106.98381, camera: "CAM-BKS-013", camStatus: "sehat" },
  { id: "bks-14", name: "Simpang Narogong – Pangkalan 1", ruasId: "narogong", region: "bekasi", lat: -6.32204, lon: 106.98469, camera: "CAM-BKS-014", camStatus: "mati", offlineFor: "2 jam" },
  { id: "bks-15", name: "Simpang Narogong – Sawo", ruasId: "narogong", region: "bekasi", lat: -6.31076, lon: 106.98511, camera: "CAM-BKS-015", camStatus: "sehat" },
  { id: "bks-16", name: "Simpang Narogong – Layang Cipendawa (utara)", ruasId: "narogong", region: "bekasi", lat: -6.29447, lon: 106.98463, camera: "CAM-BKS-016", camStatus: "sehat" },
  { id: "bks-17", name: "Simpang Narogong – Siliwangi", ruasId: "narogong", region: "bekasi", lat: -6.2782, lon: 106.99168, camera: "CAM-BKS-017", camStatus: "mati", offlineFor: "42 mnt" },
  { id: "bks-18", name: "Simpang Chairil Anwar – Mayor Madmuin Hasibuan", ruasId: "chairil", region: "bekasi", lat: -6.25547, lon: 107.00393, camera: "CAM-BKS-018", camStatus: "sehat" },
  { id: "bks-19", name: "Simpang Chairil Anwar – Sersan Aswan", ruasId: "chairil", region: "bekasi", lat: -6.25892, lon: 107.01324, camera: "CAM-BKS-019", camStatus: "mati", offlineFor: "35 mnt" },
  { id: "bks-20", name: "Simpang Juanda – Terowongan Bulak Kapal", ruasId: "juandabks", region: "bekasi", lat: -6.24835, lon: 107.02139, camera: "CAM-BKS-020", camStatus: "sehat" },
  { id: "bks-21", name: "Simpang Juanda – RA. Kartini", ruasId: "juandabks", region: "bekasi", lat: -6.24325, lon: 107.00545, camera: "CAM-BKS-021", camStatus: "sehat" },
  { id: "bks-22", name: "Simpang Juanda – Diponegoro", ruasId: "juandabks", region: "bekasi", lat: -6.25172, lon: 107.03003, camera: "CAM-BKS-022", camStatus: "sehat" },
  { id: "bks-23", name: "Simpang Sultan Hasanudin – Raya Teuku Umar", ruasId: "tambun", region: "bekasi", lat: -6.26722, lon: 107.07959, camera: "CAM-BKS-023", camStatus: "mati", offlineFor: "6 jam" },
  { id: "bks-24", name: "Simpang Cikarang–Cibarusah – Raya Industri", ruasId: "cikarang", region: "bekasi", lat: -6.339, lon: 107.12012, camera: "CAM-BKS-024", camStatus: "menurun" },
  { id: "bks-25", name: "Simpang Sultan Hasanudin – KH Abu Bakar", ruasId: "tambun", region: "bekasi", lat: -6.26161, lon: 107.05907, camera: "CAM-BKS-025", camStatus: "sehat" },
  { id: "bks-26", name: "Simpang Sultan Hasanudin – K. H. Masud", ruasId: "tambun", region: "bekasi", lat: -6.26395, lon: 107.06763, camera: "CAM-BKS-026", camStatus: "sehat" },
  { id: "bks-27", name: "Simpang Cikarang–Cibarusah – Mohammad Husni Thamrin", ruasId: "cikarang", region: "bekasi", lat: -6.32576, lon: 107.12606, camera: "CAM-BKS-027", camStatus: "sehat" },
  { id: "bks-28", name: "Simpang Cikarang–Cibarusah – Raya Lemahabang", ruasId: "cikarang", region: "bekasi", lat: -6.28943, lon: 107.15268, camera: "CAM-BKS-028", camStatus: "sehat" },
  { id: "bks-29", name: "Simpang Sultan Hasanudin – Diponegoro", ruasId: "tambun", region: "bekasi", lat: -6.2591, lon: 107.05112, camera: "CAM-BKS-029", camStatus: "sehat" },
  { id: "bks-30", name: "Simpang Cikarang–Cibarusah – Inspeksi Kalimalang", ruasId: "cikarang", region: "bekasi", lat: -6.30189, lon: 107.14483, camera: "CAM-BKS-030", camStatus: "sehat" },
];
