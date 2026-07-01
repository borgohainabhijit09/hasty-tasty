"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, Package, Heart, LogOut, LayoutDashboard, ChevronRight, Phone, Mail } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { logout } from "@/app/(storefront)/login/actions";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/account", icon: LayoutDashboard },
    { name: "Orders", href: "/account/orders", icon: Package },
    { name: "Addresses", href: "/account/addresses", icon: MapPin },
    { name: "Account Details", href: "/account/details", icon: User },
  ];

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-[1260px] mx-auto px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#C89F5F] transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-[#C89F5F]">My Account</span>
        </div>

        <h1 className="font-heading text-4xl font-bold text-[#5c2a1c] mb-2">My Account</h1>
        <p className="text-gray-600 mb-10 text-sm">Manage your orders, addresses and account settings.</p>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Navigation */}
          <aside className="lg:w-1/4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm sticky top-28">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm transition-colors ${
                        isActive 
                          ? "bg-[#FAF8F5] text-[#3A1E14] font-bold" 
                          : "text-gray-500 font-medium hover:bg-gray-50 hover:text-[#3A1E14]"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-[#5c2a1c]" : "text-gray-400"} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-4">
                <button 
                  onClick={() => logout()}
                  className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-[#3A1E14] transition-colors"
                >
                  <LogOut size={18} className="text-gray-400" />
                  Logout
                </button>
              </div>
            </div>

            {/* Promo Card 2 */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#EAE2DB]/50 p-6 shadow-sm">
              <h3 className="font-bold text-[#5c2a1c] mb-4">Need Help?</h3>
              <p className="text-gray-500 text-xs mb-4">We are here for you</p>
              
              <div className="space-y-4 mb-5">
                <div className="flex items-start gap-3">
                  <Phone size={14} className="text-[#5c2a1c] mt-0.5" />
                  <div>
                    <p className="font-bold text-[#3A1E14] text-xs">+91 98644 02305</p>
                    <p className="text-[10px] text-gray-500">(9:00 AM - 7:00 PM)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-[#5c2a1c]" />
                  <a href="mailto:hastytastyglt@gmail.com" className="font-bold text-[#3A1E14] text-xs hover:underline">
                    hastytastyglt@gmail.com
                  </a>
                </div>
              </div>

              <Link href="/contact" className="inline-block border border-[#C89F5F] text-[#3A1E14] text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#C89F5F] hover:text-white transition-colors bg-white">
                Contact Us
              </Link>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:w-3/4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
