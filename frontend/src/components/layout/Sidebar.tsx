"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  AlertTriangle, 
  Video,
  Camera, 
  Settings 
} from "lucide-react";

const navItems = [
  { name: "Dashboard Eksekutif", href: "/", icon: LayoutDashboard },
  { name: "Peta Kondisi", href: "/peta", icon: Map },
  { name: "Analisis Arus", href: "/analisis", icon: BarChart3 },
  { name: "Insiden & Pelanggaran", href: "/insiden", icon: AlertTriangle },
  { name: "Ruang Kendali", href: "/kendali", icon: Video },
  { name: "Manajemen Kamera", href: "/kamera", icon: Camera },
  { name: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <span className="text-xl font-bold text-slate-800 tracking-tight">Folvi<span className="text-blue-600">Bodebek</span></span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status Sistem</p>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
            <span className="text-slate-700">Semua Layanan Normal</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
