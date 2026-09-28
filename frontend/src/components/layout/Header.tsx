"use client";

import { useState } from "react";
import { Bell, ChevronDown, User, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const roles = [
  { name: "Pimpinan Direktorat", path: "/" },
  { name: "Operator Ruang Kendali", path: "/kendali" },
  { name: "Dinas Perhubungan Daerah", path: "/peta" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [lastRole, setLastRole] = useState(roles[0].name);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Nama peran mengikuti rute aktif; di halaman lain tetap peran terakhir yang dipilih.
  const role = roles.find((r) => (r.path === "/" ? pathname === "/" : pathname.startsWith(r.path)))?.name ?? lastRole;

  const handleRoleChange = (selectedRole: { name: string; path: string }) => {
    setLastRole(selectedRole.name);
    setShowRoleMenu(false);
    router.push(selectedRole.path);
  };

  return (
    <header className="h-16 bg-surface border-b border-line flex items-center justify-between px-4 md:px-6 z-10 relative">
      <button className="md:hidden p-2 text-muted hover:bg-raised rounded-lg" aria-label="Buka menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center space-x-2 md:space-x-4">
        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 text-xs md:text-sm font-medium text-muted hover:text-accent hover:border-accent/40 bg-surface px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg border border-line transition-colors"
          >
            <span className="hidden sm:inline">{role}</span>
            <span className="sm:hidden">Role</span>
            <ChevronDown className="h-4 w-4 text-subtle" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-line py-1 z-50">
              {roles.map((r) => (
                <button
                  key={r.name}
                  onClick={() => handleRoleChange(r)}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    role === r.name ? "bg-accent/15 text-accent font-medium" : "text-muted hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-subtle hover:text-ink transition-colors rounded-full hover:bg-raised" aria-label="Notifikasi">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-bad border-2 border-surface"></span>
        </button>

        <div className="h-8 w-px bg-line mx-2"></div>

        {/* User Profile */}
        <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-raised transition-colors" aria-label="Profil pengguna">
          <div className="h-8 w-8 rounded-full bg-accent/15 text-accent flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
