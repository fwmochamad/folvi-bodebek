"use client";

import dynamic from 'next/dynamic';
import { Filter, MapPin, Layers, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-100 rounded-lg animate-pulse text-slate-500">Memuat Peta...</div>
});

export default function PetaKondisiPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Peta Kondisi Jaringan</h1>
          <p className="text-sm text-slate-500 mt-1">Pemantauan wilayah operasional Bodebek secara spasial</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            Perbarui
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Kolom Kiri: Panel Filter & Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6 flex flex-col h-[calc(100vh-140px)]">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center mb-3">
              <Filter className="w-4 h-4 mr-2 text-slate-500" />
              Filter Tampilan
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                <span>Status Kinerja Ruas (Warna)</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                <span>Titik CCTV Bermasalah</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                <span>Lokasi Insiden Aktif</span>
              </label>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 flex items-center mb-3">
              <MapPin className="w-4 h-4 mr-2 text-slate-500" />
              Lokasi Perhatian Khusus
            </h3>
            <div className="space-y-3">
              {[
                { name: "Simpang UI Margonda", status: "Kritis", dj: "1.12", desc: "Antrean melimpah" },
                { name: "Simpang Cibinong", status: "Kritis", dj: "1.05", desc: "Volume tinggi" },
                { name: "Simpang Juanda", status: "Waspada", dj: "0.88", desc: "Mulai padat" }
              ].map((loc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-slate-800">{loc.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${loc.status === 'Kritis' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {loc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{loc.desc} • DJ: <span className="font-medium text-slate-700">{loc.dj}</span></p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> Lancar</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span> Padat</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span> Macet</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Peta Spasial */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-1 h-[calc(100vh-140px)] flex flex-col relative z-0">
          <div className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-md border border-slate-200 flex flex-col space-y-2">
            <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="Ganti Base Map">
              <Layers className="w-5 h-5" />
            </button>
          </div>
          <Map center={[-6.3882, 106.8294]} zoom={12} />
        </div>
      </div>
    </div>
  );
}
