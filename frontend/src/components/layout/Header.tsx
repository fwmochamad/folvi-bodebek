"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, User, Search, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState("Pimpinan Direktorat");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  
  // Sync role dropdown text with current route for better UX
  useEffect(() => {
    if (pathname === '/') setRole("Pimpinan Direktorat");
    else if (pathname.includes('/analisis')) setRole("Analis Lalu Lintas");
    else if (pathname.includes('/kendali')) setRole("Operator Ruang Kendali");
    else if (pathname.includes('/peta')) setRole("Dinas Perhubungan Daerah");
  }, [pathname]);

  const roles = [
    { name: "Pimpinan Direktorat", path: "/" },
    { name: "Analis Lalu Lintas", path: "/analisis" },
    { name: "Operator Ruang Kendali", path: "/kendali" },
    { name: "Dinas Perhubungan Daerah", path: "/peta" }
  ];

  const handleRoleChange = (selectedRole: {name: string, path: string}) => {
    setRole(selectedRole.name);
    setShowRoleMenu(false);
    router.push(selectedRole.path);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-10 relative shadow-sm">
      <div className="flex items-center w-1/2 md:w-1/3">
        <button className="md:hidden mr-2 p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Cari lokasi simpang atau jalan..." 
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Role Switcher */}
        <div className="relative">
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 text-xs md:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            <span className="hidden sm:inline">{role}</span>
            <span className="sm:hidden">Role</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
              {roles.map(r => (
                <button
                  key={r.name}
                  onClick={() => handleRoleChange(r)}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    role === r.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        {/* User Profile */}
        <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-50 transition-colors">
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
