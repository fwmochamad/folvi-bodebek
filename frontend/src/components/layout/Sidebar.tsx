"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  Video,
  Camera, 
  Settings 
} from "lucide-react";

const navItems = [
  { name: "Dashboard Eksekutif", href: "/", icon: LayoutDashboard },
  { name: "Peta Kondisi", href: "/peta", icon: Map },
  { name: "Insiden & Pelanggaran", href: "/insiden", icon: AlertTriangle },
  { name: "Ruang Kendali", href: "/kendali", icon: Video },
  { name: "Manajemen Kamera", href: "/kamera", icon: Camera },
  { name: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface border-r border-line h-screen hidden md:flex md:flex-col">
      <Link href="/" className="h-16 flex items-center gap-3 px-6 border-b border-line" aria-label="FOLVI, ke Dashboard Eksekutif">
        <Image src="/logo-folvi-mark.png" alt="" width={48} height={30} priority className="h-[30px] w-auto" />
        <span className="font-display text-[22px] font-bold leading-none tracking-[0.14em] bg-gradient-to-r from-[#1596b8] via-[#3b56c9] to-[#7b3fb5] bg-clip-text text-transparent">
          FOLVI
        </span>
      </Link>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`group flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? "bg-accent/15 text-accent font-medium" 
                  : "text-muted hover:bg-accent/10 hover:text-accent"
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? "text-accent" : "text-subtle group-hover:text-accent"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-line">
        <div className="bg-raised p-3 rounded-lg border border-line">
          <p className="text-xs text-subtle font-medium uppercase tracking-wider mb-1">Status Sistem</p>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 rounded-full bg-ok mr-2"></div>
            <span className="text-ink">Semua Layanan Normal</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
