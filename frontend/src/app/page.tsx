"use client";

import { ArrowUpRight, ArrowDownRight, Activity, Camera, AlertTriangle, Video } from "lucide-react";
import dynamic from 'next/dynamic';

// Use dynamic imports for charts to prevent SSR issues with Recharts
const VehicleCompositionChart = dynamic(() => import('@/components/charts/VehicleCompositionChart'), { ssr: false });
const TrafficTrendChart = dynamic(() => import('@/components/charts/TrafficTrendChart'), { ssr: false });
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  const metrics = [
    { title: "Tingkat Pelayanan Jaringan", value: "C", trend: "Naik dari B", icon: Activity, up: false },
    { title: "Simpang Melewati Ambang", value: "14", label: "dari 62", trend: "Naik 3", icon: AlertTriangle, up: false },
    { title: "Kecepatan Rata-rata", value: "23,4", label: "km/j", trend: "Turun 1,8", icon: ArrowDownRight, up: false },
    { title: "Ketersediaan Kamera", value: "96,2%", trend: "Naik 0,7%", icon: Camera, up: true },
    { title: "Kejadian Belum Ditangani", value: "38", trend: "Turun 12", icon: Video, up: true },
    { title: "Konflik Serius", value: "71", trend: "Naik 9", icon: AlertTriangle, up: false },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Pimpinan</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan kondisi jaringan jalan terpadu Bodebek</p>
        </div>
        
        <div className="flex items-center space-x-3 text-sm">
          <span className="text-slate-500 flex items-center bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Live (Pembaruan terakhir: Baru saja)
          </span>
        </div>
      </div>

      {/* V-01 Kartu Indikator Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide line-clamp-2">{metric.title}</span>
              <div className={`p-2 rounded-lg ${metric.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <metric.icon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-slate-800">{metric.value}</span>
                {metric.label && <span className="text-sm font-medium text-slate-500">{metric.label}</span>}
              </div>
              <p className={`text-xs mt-1 font-medium ${metric.up ? 'text-emerald-600' : 'text-rose-600'} flex items-center`}>
                {metric.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {metric.trend}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Peta Placeholder V-02 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-1 flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl z-10">
            <h2 className="text-lg font-bold text-slate-800">Peta Kondisi Jaringan</h2>
            <div className="flex space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-md">Lancar</span>
              <span className="px-2 py-1 text-xs font-medium bg-amber-50 text-amber-600 rounded-md">Padat</span>
              <span className="px-2 py-1 text-xs font-medium bg-rose-50 text-rose-600 rounded-md">Macet</span>
            </div>
          </div>
          <div className="flex-1 bg-slate-50 rounded-b-lg flex items-center justify-center relative overflow-hidden z-0">
            <Map center={[-6.4500, 106.8500]} zoom={11} />
          </div>
        </div>
        
        {/* V-03 Tren & V-05 Komposisi */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4">Tren Tingkat Pelayanan (Kecepatan)</h2>
            <TrafficTrendChart />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4">Komposisi Kendaraan</h2>
            <VehicleCompositionChart />
          </div>
        </div>
      </div>
    </div>
  );
}

function MapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  )
}
