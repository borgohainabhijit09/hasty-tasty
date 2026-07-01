"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Grid, 
  Users, 
  Briefcase, 
  MessageSquare, 
  BarChart2, 
  Settings, 
  LogOut,
  Truck,
  X
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Grid },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Bulk Orders (B2B)', href: '/admin/b2b', icon: Briefcase },
  { name: 'B2B Requests', href: '/admin/b2b-requests', icon: Briefcase },
  { name: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  { name: 'Reports', href: '/admin/reports', icon: BarChart2 },
  { name: 'Shipping', href: '/admin/shipping', icon: Truck },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

function ChevronDown(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

export default function AdminSidebar({ initials, userName, onClose }: { initials: string; userName: string; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 bg-[#21050A] text-white flex flex-col h-full flex-shrink-0 relative z-20">
      {/* Logo Area */}
      <div className="p-6 flex flex-col items-center justify-center border-b border-white/10 mb-4 relative">
        {onClose && (
          <button 
            type="button"
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 lg:hidden focus:outline-none transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
        <div className="relative w-24 h-12 mb-2">
           <Image src="/images/logo.png" alt="Hasty Tasty Logo" fill sizes="96px" className="object-contain" priority />
        </div>
        <p className="text-[#C89F5F] text-[10px] uppercase tracking-widest font-semibold mt-1">Taster's Pride</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          // Determine if link is active
          // For '/admin', it should be exactly '/admin'
          // For others like '/admin/products', it should start with that
          const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-[#3D141C] text-[#C89F5F]' 
                  : 'text-gray-400 hover:bg-[#3D141C]/50 hover:text-white'
                }`}
            >
              <Icon size={18} className={isActive ? "text-[#C89F5F]" : "text-gray-400"} />
              {link.name}
            </Link>
          );
        })}
        
        <div className="pt-6 mt-4 border-t border-white/10">
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-400 hover:bg-[#3D141C]/50 hover:text-white transition-all duration-200">
              <LogOut size={18} />
              Logout
            </button>
          </form>
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-white/10 bg-[#1A0307]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#C89F5F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{userName || 'Admin User'}</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </aside>
  );
}
