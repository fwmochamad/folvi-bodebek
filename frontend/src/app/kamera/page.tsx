"use client";

import { Camera, Search, RefreshCw, Power, PowerOff, ShieldAlert, CheckCircle2, MoreHorizontal, Filter } from "lucide-react";
import { useState } from "react";

export default function KameraPage() {
  const [toastMsg, setToastMsg] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");

  const handleAction = (id: string, action: string) => {
    setToastMsg(`${action} pada kamera ${id} berhasil dikirim.`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const cameras = Array.from({ length: 15 }).map((_, i) => ({
    id: `CAM-BDBK-${100 + i}`,
    location: i < 5 ? "Jl. Margonda Raya" : i < 10 ? "Simpang Pemda Cibinong" : "Simpang BCP Bekasi",
    status: i === 4 ? "Offline" : i === 7 ? "Gangguan" : "Online",
    cvStatus: i === 4 ? "Mati" : i === 7 ? "Mati" : "Aktif",
    ip: `192.168.10.${100 + i}`,
    protocol: i % 3 === 0 ? "HLS" : i % 5 === 0 ? "WebRTC" : "RTSP"
  }));

  const filteredCameras = activeFilter === "Semua" 
    ? cameras 
    : cameras.filter(c => c.status === activeFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg shadow-lg flex items-center animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Kamera (VMS)</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola lebih dari 100+ integrasi CCTV dan status modul Computer Vision.</p>
        </div>
        
        <div className="flex space-x-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center shadow-sm transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Pindai Ulang
          </button>
          <button onClick={() => handleAction('Baru', 'Form Tambah Kamera')} className="bg-blue-600 border border-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm transition-colors">
            + Tambah Kamera
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Kamera", value: "112", icon: Camera, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Online (Streaming)", value: "107", icon: Power, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Offline / Terputus", value: "3", icon: PowerOff, color: "text-slate-600", bg: "bg-slate-100" },
          { label: "Gangguan Analitik", value: "2", icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Gangguan">Gangguan</option>
            </select>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari ID, Lokasi, atau IP..." 
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">ID & Lokasi</th>
                <th className="px-6 py-4">Jaringan & Protokol</th>
                <th className="px-6 py-4">Status Stream</th>
                <th className="px-6 py-4">Status Analitik CV</th>
                <th className="px-6 py-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCameras.map((cam) => (
                <tr key={cam.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 flex items-center">
                      <Camera className="w-4 h-4 mr-2 text-slate-400" />
                      {cam.id}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{cam.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-slate-700">{cam.ip}</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200">
                      {cam.protocol}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center text-xs font-semibold ${
                      cam.status === 'Online' ? 'text-emerald-600' : 
                      cam.status === 'Offline' ? 'text-slate-500' : 'text-rose-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        cam.status === 'Online' ? 'bg-emerald-500' : 
                        cam.status === 'Offline' ? 'bg-slate-400' : 'bg-rose-500'
                      }`}></span>
                      {cam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                      cam.cvStatus === 'Aktif' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {cam.cvStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center space-x-2">
                      <button 
                        onClick={() => handleAction(cam.id, 'Edit')}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded transition-colors"
                        title="Edit Kamera"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleAction(cam.id, 'Hapus')}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors mr-2"
                        title="Hapus Kamera"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>

                      <div className="w-px h-4 bg-slate-200 mx-1"></div>

                      <button 
                        onClick={() => handleAction(cam.id, 'Restart')}
                        className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors"
                      >
                        Restart
                      </button>
                      <button 
                        onClick={() => handleAction(cam.id, cam.cvStatus === 'Aktif' ? 'Matikan CV' : 'Hidupkan CV')}
                        disabled={cam.status !== 'Online'}
                        className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                          cam.status !== 'Online' 
                          ? 'text-slate-400 bg-slate-50 cursor-not-allowed opacity-50'
                          : cam.cvStatus === 'Aktif' 
                            ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' 
                            : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        {cam.cvStatus === 'Aktif' ? 'Matikan CV' : 'Hidupkan CV'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Menampilkan {filteredCameras.length} dari 112 kamera (dummy data pagination)
          </div>
        </div>
      </div>
    </div>
  );
}
