"use client";

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function AdminLayoutClient({
  initials,
  userName,
  children,
}: {
  initials: string;
  userName: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar automatically when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-[#F7F5F0] overflow-hidden font-sans w-full">
      {/* Sidebar - Hidden on mobile/tablet, transition slide-in based on state */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <AdminSidebar initials={initials} userName={userName} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Backdrop overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#21050A]/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between bg-[#21050A] text-white py-3 px-4 border-b border-white/10 z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="relative w-16 h-8">
              <Image src="/images/logo.png" alt="Hasty Tasty Logo" fill sizes="64px" className="object-contain" priority />
            </div>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-[#C89F5F] flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
        </header>

        {/* Content Scrolling Container */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
