"use client";

import { AlertTriangle, Filter, Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function InsidenPage() {
  const [activeTab, setActiveTab] = useState("semua");
  const [toastMsg, setToastMsg] = useState("");

  const handleAction = (id: string, action: string) => {
    setToastMsg(`Kejadian ${id} berhasil di-${action}`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const incidents = [
    { id: "INC-2609-001", type: "Parkir Liar", loc: "Jl. Margonda Raya", time: "24 Sep 2026 10:12", status: "Baru", class: "Kendaraan Ringan", bukti: "Ada" },
    { id: "INC-2609-002", type: "Blokir Kotak Simpang", loc: "Simpang BCP", time: "24 Sep 2026 09:45", status: "Ditangani", class: "Truk", bukti: "Ada" },
    { id: "INC-2609-004", type: "Lawan Arah", loc: "Jl. Pemuda Depok", time: "24 Sep 2026 07:15", status: "Baru", class: "Sepeda Motor", bukti: "Ada" },
    { id: "INC-2609-005", type: "Parkir Liar", loc: "Jl. Ahmad Yani", time: "24 Sep 2026 06:40", status: "Selesai", class: "Kendaraan Ringan", bukti: "Tidak" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col relative">
      {/* Toast Notification Dummy */}
      {toastMsg && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg shadow-lg flex items-center animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Kejadian & Pelanggaran</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar riwayat deteksi kejadian dari modul Computer Vision</p>
        </div>
        
        <div className="flex space-x-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="bg-blue-600 border border-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Ekspor Laporan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="border-b border-slate-200 px-6 pt-4">
          <div className="flex space-x-6 text-sm font-medium text-slate-500">
            {["semua", "baru", "ditangani", "selesai"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 capitalize transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">ID Kejadian</th>
                <th className="px-6 py-4">Jenis & Kelas</th>
                <th className="px-6 py-4">Lokasi & Waktu</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Bukti</th>
                <th className="px-6 py-4 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.filter(i => activeTab === 'semua' || i.status.toLowerCase() === activeTab).map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{inc.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{inc.type}</div>
                    <div className="text-xs text-slate-500">{inc.class}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800">{inc.loc}</div>
                    <div className="text-xs text-slate-500">{inc.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      inc.status === 'Baru' ? 'bg-rose-100 text-rose-700' :
                      inc.status === 'Ditangani' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {inc.bukti === 'Ada' ? (
                      <span className="text-blue-600 hover:underline cursor-pointer font-medium">Lihat Dokumentasi</span>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {inc.status === 'Baru' ? (
                      <button onClick={() => handleAction(inc.id, 'tangani')} className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full transition-colors shadow-sm">
                        Terima & Tangani
                      </button>
                    ) : inc.status === 'Ditangani' ? (
                      <button onClick={() => handleAction(inc.id, 'selesaikan')} className="text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg w-full transition-colors shadow-sm">
                        Tandai Selesai
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {incidents.filter(i => activeTab === 'semua' || i.status.toLowerCase() === activeTab).length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center h-64">
              <AlertTriangle className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Tidak ada kejadian dengan status ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
