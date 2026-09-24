"use client";

import { Activity, BarChart3, Filter } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const TrafficTrendChart = dynamic(() => import('@/components/charts/TrafficTrendChart'), { ssr: false });
const VehicleCompositionChart = dynamic(() => import('@/components/charts/VehicleCompositionChart'), { ssr: false });

export default function AnalisisPage() {
  const [location, setLocation] = useState("Semua Lokasi");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analis Lalu Lintas</h1>
          <p className="text-sm text-slate-500 mt-1">Diagnosis masalah dan penyusunan rekayasa lalu lintas</p>
        </div>
        
        <div className="flex space-x-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter Waktu
          </button>
          <select 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 focus:outline-none cursor-pointer"
          >
            <option value="Semua Lokasi">Semua Lokasi</option>
            <option value="Jl. Margonda Raya">Jl. Margonda Raya</option>
            <option value="Simpang Pemda Cibinong">Simpang Pemda Cibinong</option>
            <option value="Simpang BCP Bekasi">Simpang BCP Bekasi</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* V-08 Profil 24 Jam */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-500" />
              Profil 24 Jam ({location})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">Titik temu garis (kecepatan) dan batang (volume) menunjukkan batas kapasitas terlampaui.</p>
          <TrafficTrendChart location={location} />
        </div>

        {/* V-10 Sebaran / Komposisi Lanjutan */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-emerald-500" />
              Komposisi 7 Kelas Kendaraan ({location})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">Analisis terperinci untuk jenis kendaraan melintas per jam.</p>
          <VehicleCompositionChart location={location} />
        </div>

        {/* V-15 Diagram Skematik Persimpangan */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800">
              Diagram Skematik Persimpangan - {location === 'Semua Lokasi' ? 'Ringkasan Rata-rata' : location} (V-15)
            </h2>
            <div className="flex space-x-2">
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 rounded">DJ &lt; 0.85</span>
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded">DJ &gt; 1.0</span>
            </div>
          </div>
          
          <div className="h-[400px] bg-slate-50 rounded-lg border border-slate-100 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50"></div>
            
            {/* Central Junction Square */}
            <div className="w-32 h-32 border-4 border-slate-300 relative z-10 bg-slate-50 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-400 text-center px-2">
                {location === 'Semua Lokasi' ? 'Simpang' : location}
              </span>
            </div>
            
            {/* Roads */}
            {/* North */}
            <div className="absolute top-0 w-32 h-[calc(50%-4rem)] border-x-4 border-slate-300 bg-slate-100 flex flex-col justify-end pb-4">
              <div className="w-full text-center">
                <div className="inline-block px-2 py-1 bg-white border border-rose-200 rounded shadow-sm text-center">
                  <p className="text-[10px] text-slate-500 font-medium">Pendekat Utara</p>
                  <p className="text-xs font-bold text-rose-600">DJ: {location === 'Semua Lokasi' ? '1.12' : '1.25'}</p>
                  <p className="text-[10px] text-slate-500">Antrean: {location === 'Semua Lokasi' ? '111m' : '145m'}</p>
                </div>
              </div>
            </div>
            
            {/* South */}
            <div className="absolute bottom-0 w-32 h-[calc(50%-4rem)] border-x-4 border-slate-300 bg-slate-100 flex flex-col justify-start pt-4">
              <div className="w-full text-center">
                <div className="inline-block px-2 py-1 bg-white border border-emerald-200 rounded shadow-sm text-center">
                  <p className="text-[10px] text-slate-500 font-medium">Pendekat Selatan</p>
                  <p className="text-xs font-bold text-emerald-600">DJ: {location === 'Semua Lokasi' ? '0.65' : '0.40'}</p>
                  <p className="text-[10px] text-slate-500">Antrean: {location === 'Semua Lokasi' ? '24m' : '10m'}</p>
                </div>
              </div>
            </div>

            {/* West */}
            <div className="absolute left-0 h-32 w-[calc(50%-4rem)] border-y-4 border-slate-300 bg-slate-100 flex items-center justify-end pr-4">
               <div className="inline-block px-2 py-1 bg-white border border-amber-200 rounded shadow-sm text-center">
                  <p className="text-[10px] text-slate-500 font-medium">Pendekat Barat</p>
                  <p className="text-xs font-bold text-amber-600">DJ: 0.88</p>
                  <p className="text-[10px] text-slate-500">Antrean: 56m</p>
                </div>
            </div>

            {/* East */}
            <div className="absolute right-0 h-32 w-[calc(50%-4rem)] border-y-4 border-slate-300 bg-slate-100 flex items-center justify-start pl-4">
               <div className="inline-block px-2 py-1 bg-white border border-emerald-200 rounded shadow-sm text-center">
                  <p className="text-[10px] text-slate-500 font-medium">Pendekat Timur</p>
                  <p className="text-xs font-bold text-emerald-600">DJ: 0.54</p>
                  <p className="text-[10px] text-slate-500">Antrean: 12m</p>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
