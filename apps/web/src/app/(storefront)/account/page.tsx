"use client";

import Link from "next/link";
import { Package, MapPin, IndianRupee, ChevronRight, Crown, Home, Briefcase, User as UserIcon, Mail, Phone, Lock, PackageOpen, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AccountDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ orders: 0, addresses: 0, spent: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        // Fetch actual figures from DB
        const { data: orders } = await supabase.from('Order').select('id, totalAmount, status, createdAt').eq('userId', user.id).order('createdAt', { ascending: false });
        const { data: addresses } = await supabase.from('Address').select('*').eq('userId', user.id);
        
        const actualOrdersCount = orders?.length || 0;
        const actualAddressesCount = addresses?.length || 0;
        const actualTotalSpent = orders?.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0) || 0;
        
        setStats({
          orders: actualOrdersCount,
          addresses: actualAddressesCount,
          spent: actualTotalSpent
        });

        if (orders) setRecentOrders(orders.slice(0, 3)); // top 3
        if (addresses) setSavedAddresses(addresses.slice(0, 2)); // top 2
      }
    };
    
    fetchStats();
  }, []);

  const getStatusClasses = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'DELIVERED': return 'bg-green-50 text-green-700';
      case 'OUT_FOR_DELIVERY':
      case 'SHIPPED': return 'bg-orange-50 text-orange-700';
      case 'PROCESSING':
      case 'PREPARING':
      case 'READY': return 'bg-blue-50 text-blue-700';
      case 'CANCELLED': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getAddressIcon = (type: string) => {
    if (type === 'HOME') return <Home size={16} />;
    if (type === 'WORK') return <Briefcase size={16} />;
    return <MapPin size={16} />;
  };

  return (
    <div className="space-y-10">
      
      {/* Welcome Banner */}
      <div className="bg-[#FAF8F5] rounded-2xl p-8 border border-[#EAE2DB]/50 relative overflow-hidden flex items-center gap-6 shadow-sm">
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none w-64 h-64">
          <Image src="/images/b2b-hero-bg.png" alt="Decoration" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>
        
        <div className="w-24 h-24 rounded-full bg-[#EAE2DB] text-[#5c2a1c] flex items-center justify-center font-heading text-4xl shadow-inner z-10 shrink-0">
          {user?.user_metadata?.name?.charAt(0) || "U"}
        </div>
        
        <div className="z-10">
          <p className="text-gray-600 font-medium mb-1">Welcome back,</p>
          <h2 className="font-heading text-3xl font-bold text-[#5c2a1c] mb-1">{user?.user_metadata?.name || "User"}</h2>
          <p className="text-gray-500 text-sm mb-3">{user?.email || ""}</p>
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#C89F5F] text-[#C89F5F] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            <Crown size={12} />
            Loyal Customer
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EAE2DB] flex items-center justify-center text-[#C89F5F] shrink-0">
            <Package size={20} />
          </div>
          <div>
            <h3 className="font-bold text-[#3A1E14] text-xl">{stats.orders}</h3>
            <p className="text-gray-500 text-xs font-medium">Orders Placed</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EAE2DB] flex items-center justify-center text-[#C89F5F] shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="font-bold text-[#3A1E14] text-xl">{stats.addresses}</h3>
            <p className="text-gray-500 text-xs font-medium">Saved Addresses</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EAE2DB] flex items-center justify-center text-[#C89F5F] shrink-0">
            <IndianRupee size={20} />
          </div>
          <div>
            <h3 className="font-bold text-[#3A1E14] text-xl">₹{stats.spent.toLocaleString()}</h3>
            <p className="text-gray-500 text-xs font-medium">Total Spent</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-end mb-4 px-2">
          <h3 className="font-heading font-bold text-2xl text-[#5c2a1c]">Recent Orders</h3>
          <Link href="/account/orders" className="text-sm font-bold text-[#3A1E14] flex items-center gap-1 hover:text-[#C89F5F] transition-colors">
            View All Orders <ChevronRight size={14} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <PackageOpen size={32} className="text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm font-medium">You haven't placed any orders yet.</p>
              <Link href="/" className="mt-3 text-[#C89F5F] font-bold text-xs hover:underline">Start Shopping</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5 pl-2">Order</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-2 text-right pr-2">Action</div>
              </div>

              <div className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <div key={order.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative border border-gray-200">
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">IMG</span>
                      </div>
                      <div className="truncate pr-2">
                        <h4 className="font-bold text-[#5c2a1c] truncate">#{order.id.slice(0,8).toUpperCase()}</h4>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs md:text-sm text-gray-600 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full truncate ${getStatusClasses(order.status)}`}>
                        {order.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="col-span-1 font-bold text-[#3A1E14] text-xs md:text-sm">₹{order.totalAmount}</div>
                    <div className="col-span-2 text-right">
                      <Link href="/account/orders" className="border border-[#C89F5F]/50 text-[#5c2a1c] text-xs font-bold px-3 py-1.5 md:px-4 md:py-1.5 rounded-lg hover:bg-[#C89F5F] hover:text-white transition-colors">
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 flex justify-center border-t border-gray-50">
                <Link href="/account/orders" className="text-sm font-bold text-[#5c2a1c] flex items-center gap-1 hover:text-[#C89F5F] transition-colors">
                  View All Orders <ChevronRight size={14} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Saved Addresses */}
      <div>
        <div className="flex justify-between items-end mb-4 px-2">
          <h3 className="font-heading font-bold text-2xl text-[#5c2a1c]">Saved Addresses</h3>
          <Link href="/account/addresses" className="text-sm font-bold text-[#3A1E14] flex items-center gap-1 hover:text-[#C89F5F] transition-colors">
            Manage Addresses <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savedAddresses.map((addr, idx) => (
            <div key={addr.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 font-bold text-[#5c2a1c]">
                    {getAddressIcon(addr.type)} {addr.type}
                  </div>
                  {idx === 0 && (
                    <span className="bg-[#FAF8F5] text-[#C89F5F] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#EAE2DB]">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-gray-600 text-xs space-y-1.5 leading-relaxed">
                  <p className="font-bold text-[#3A1E14]">{user?.user_metadata?.name || "Customer"}</p>
                  <p>{addr.address}</p>
                  <p>{addr.city}, {addr.state} - {addr.pinCode}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Add New */}
          <Link href="/account/addresses" className="bg-[#FAF8F5] rounded-2xl border-2 border-dashed border-[#EAE2DB] flex flex-col items-center justify-center text-gray-400 hover:text-[#C89F5F] hover:border-[#C89F5F] transition-colors p-6 min-h-[200px] group">
            <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="font-bold text-sm text-[#3A1E14] group-hover:text-[#5c2a1c]">Add New Address</span>
          </Link>
        </div>
      </div>

      {/* Account Details Shortcut */}
      <div>
        <h3 className="font-heading font-bold text-2xl text-[#5c2a1c] mb-4 px-2">Account Details</h3>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            
            <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
              <UserIcon size={16} className="text-gray-400 shrink-0" />
              <div className="flex-1">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                <p className="font-medium text-[#3A1E14] text-sm">{user?.user_metadata?.name || "User"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
              <Mail size={16} className="text-gray-400 shrink-0" />
              <div className="flex-1">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                <p className="font-medium text-[#3A1E14] text-sm">{user?.email || ""}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/account/details" className="inline-block w-full text-center md:w-auto px-8 py-3 bg-white border border-[#C89F5F] text-[#5c2a1c] font-bold text-sm rounded-xl hover:bg-[#C89F5F] hover:text-white transition-colors">
              Edit Account Details
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
