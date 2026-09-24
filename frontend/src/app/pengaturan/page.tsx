"use client";

import { Save, Server, Shield, Bell, Camera } from "lucide-react";
import { useState } from "react";

export default function PengaturanPage() {
  const [activeMenu, setActiveMenu] = useState("sistem");
  const [toastMsg, setToastMsg] = useState("");

  const handleSave = () => {
    setToastMsg("Pengaturan berhasil disimpan.");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const menus = [
    { id: "sistem", label: "Sistem & Analitik", icon: Server },
    { id: "notifikasi", label: "Notifikasi", icon: Bell },
    { id: "akses", label: "Hak Akses & Role", icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col relative">
      {/* Toast */}
      {toastMsg && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg shadow-lg flex items-center animate-in slide-in-from-top-4">
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-500 mt-1">Konfigurasi parameter analitik, integrasi, dan hak akses.</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleSave}
            className="bg-blue-600 border border-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 min-h-[500px]">
        {/* Menu Samping */}
        <div className="w-full md:w-64 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeMenu === menu.id 
                ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <menu.icon className={`w-5 h-5 mr-3 ${activeMenu === menu.id ? 'text-blue-600' : 'text-slate-400'}`} />
              {menu.label}
            </button>
          ))}
        </div>

        {/* Konten Pengaturan */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          {activeMenu === 'sistem' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Parameter Analitik Kendaraan</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ambang Batas Kecepatan (Kritis)</label>
                  <input type="number" defaultValue={20} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <p className="text-xs text-slate-500 mt-1">Nilai dalam km/jam. Sistem akan memberi peringatan jika rata-rata di bawah nilai ini.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ambang Derajat Kejenuhan (DJ)</label>
                  <input type="number" step="0.1" defaultValue={0.85} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <p className="text-xs text-slate-500 mt-1">Batas kondisi jalan dianggap mulai tidak ideal (Standar PKJI: 0.85).</p>
                </div>
              </div>
              
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">Konfigurasi Computer Vision</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-slate-700">Aktifkan deteksi pelat nomor (Hashing mode)</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-slate-700">Otomatis deteksi degradasi kualitas citra (V-02)</span>
                </label>
              </div>
            </div>
          )}

          {activeMenu === 'notifikasi' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Saluran Notifikasi</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-800">Telegram Bot</h3>
                    <p className="text-sm text-slate-500">Kirim peringatan kritis ke grup komando</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-800">Email Broadcast</h3>
                    <p className="text-sm text-slate-500">Laporan harian otomatis ke Pimpinan</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'akses' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Manajemen Pengguna</h2>
              <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nama / ID</th>
                    <th className="px-4 py-3 font-semibold">Peran</th>
                    <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3">Budi Santoso</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Operator</span></td>
                    <td className="px-4 py-3 text-right"><button className="text-blue-600 hover:underline">Edit</button></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Siti Aminah</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">Analis Lalu Lintas</span></td>
                    <td className="px-4 py-3 text-right"><button className="text-blue-600 hover:underline">Edit</button></td>
                  </tr>
                </tbody>
              </table>
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full">
                + Tambah Pengguna Baru
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
