"use client";

import { CheckCircle2, Video, XCircle, Grid, LayoutGrid, Maximize, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function KendaliPage() {
  const [gridSize, setGridSize] = useState(4);
  const [toastMsg, setToastMsg] = useState("");

  const handleAction = (id: string, action: string) => {
    setToastMsg(`Skenario DSS ${id} berhasil di-${action}`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const dssList = [
    { id: "DSS-001", title: "Kepadatan Simpang BCP", trigger: "Derajat Kejenuhan (DJ) > 1.15", impact: "Antrean terurai dalam 15 menit, DJ turun ke 0.85", action: "Alihkan 30% arus ke Jl. Kemakmuran", status: "pending" },
    { id: "DSS-002", title: "Blokir Kotak Simpang UI", trigger: "Kendaraan berhenti di tengah simpang", impact: "Mencegah efek domino kemacetan Margonda", action: "Perpanjang lampu hijau arah Jakarta 10 detik", status: "pending" },
    { id: "DSS-003", title: "Antrean Pemda Cibinong", trigger: "Antrean melampaui 100m", impact: "Waktu tempuh koridor membaik 12%", action: "Aktifkan Skenario Koordinasi Hijau (Green Wave)", status: "pending" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col relative">
      {/* Toast */}
      {toastMsg && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg shadow-lg flex items-center animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operator Ruang Kendali</h1>
          <p className="text-sm text-slate-500 mt-1">Pemantauan matriks video skala besar dan penanganan DSS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Kolom Kiri: Video Wall Matrix (Scalable for 100+ cameras) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-[calc(100vh-140px)]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center">
              <Video className="w-5 h-5 mr-2 text-slate-400" />
              Video Wall Matrix (112 Kamera Terhubung)
            </h2>
            <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button onClick={() => setGridSize(1)} className={`p-1.5 rounded ${gridSize === 1 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <Maximize className="w-4 h-4" />
              </button>
              <button onClick={() => setGridSize(4)} className={`p-1.5 rounded ${gridSize === 4 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setGridSize(9)} className={`p-1.5 rounded ${gridSize === 9 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
              <select className="text-xs bg-transparent font-medium text-slate-700 outline-none cursor-pointer">
                <option>Grup: Bodebek (Prioritas)</option>
                <option>Grup: Depok (Margonda)</option>
                <option>Grup: Bekasi (A. Yani)</option>
                <option>Semua Kamera (Paging)</option>
              </select>
            </div>
          </div>

          <div className={`flex-1 grid gap-2 overflow-hidden ${
            gridSize === 1 ? 'grid-cols-1' : gridSize === 4 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {Array.from({ length: gridSize }).map((_, idx) => (
              <div key={idx} className="bg-slate-900 rounded-lg relative overflow-hidden group border border-slate-800 shadow-inner">
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                  <Video className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-[10px] text-slate-400">Stream Signal...</span>
                </div>
                {/* Mock Bounding Box for first cam only to show CV active */}
                {idx === 0 && (
                  <div className="absolute top-[30%] left-[40%] w-[15%] h-[25%] border-2 border-emerald-500 bg-emerald-500/10 rounded"></div>
                )}
                <div className="absolute top-2 left-2 flex items-center space-x-2">
                  <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    CAM-BDBK-{101 + idx}
                  </span>
                  <span className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-pulse"></span>
                    CV ON
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
            <span>Menampilkan hal 1 dari {Math.ceil(112/gridSize)}</span>
            <div className="flex space-x-1">
              <button className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">Prev</button>
              <button className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">Next</button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: DSS Recommendations List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-slate-100 bg-blue-50/50 rounded-t-xl">
            <h2 className="text-base font-bold text-blue-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
              Skenario Rekayasa DSS
            </h2>
            <p className="text-xs text-blue-700 mt-1">
              Sistem mendeteksi 3 anomali yang membutuhkan intervensi segera.
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-slate-50/50">
            {dssList.map((dss) => (
              <div key={dss.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 relative overflow-hidden transition-all hover:border-blue-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h3 className="font-bold text-slate-800 text-sm mb-2">{dss.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="bg-rose-50 border border-rose-100 rounded p-2 text-xs">
                    <span className="text-rose-700 font-semibold block mb-0.5">Pemicu:</span>
                    <span className="text-rose-900">{dss.trigger}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded p-2 text-xs">
                    <span className="text-emerald-700 font-semibold block mb-0.5">Perkiraan Dampak:</span>
                    <span className="text-emerald-900">{dss.impact}</span>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded p-2 text-xs">
                    <span className="text-slate-600 font-semibold block mb-0.5">Usulan Aksi:</span>
                    <span className="text-slate-900 font-medium">{dss.action}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAction(dss.id, 'terima')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Terima & Jalankan
                  </button>
                  <button 
                    onClick={() => handleAction(dss.id, 'tolak')}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
