"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, MapPin, Phone, LogOut, CheckCircle } from "lucide-react";

export default function DeliveryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (session?.user?.role !== "DELIVERY_BOY") {
      router.push("/");
    }
  }, [status, session, router]);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      const now = ctx.currentTime;
      playTone(587.33, now, 0.4); // D5
      playTone(880.00, now + 0.15, 0.6); // A5
    } catch (e) {
      console.error("Audio playback blocked or failed:", e);
    }
  };

  useEffect(() => {
    const fetchOrders = async (isPolling = false) => {
      if (session?.user?.id && session.user.role === "DELIVERY_BOY") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/delivery/orders?deliveryBoyId=${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            
            if (isPolling) {
              setOrders(prevOrders => {
                if (prevOrders.length > 0 && data.length > 0) {
                  const prevIds = new Set(prevOrders.map((o: any) => o.id));
                  const newOrders = data.filter((o: any) => !prevIds.has(o.id));
                  if (newOrders.length > 0) {
                    playNotificationSound();
                  }
                }
                return data;
              });
            } else {
              setOrders(data);
            }
          }
        } catch (error) {
          console.error("Failed to fetch delivery orders:", error);
        } finally {
          if (!isPolling) setLoading(false);
        }
      }
    };

    if (session?.user) {
      fetchOrders(false);
      // Poll every 10 seconds
      const interval = setInterval(() => fetchOrders(true), 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status");
    }
  };

  const getMapsUrl = (lat?: number, lng?: number, addressStr?: string) => {
    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else if (addressStr) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`;
    }
    return "#";
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (session?.user?.role !== "DELIVERY_BOY") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] pb-24 font-sans">
      {/* App-like Header */}
      <div className="bg-[#21050A] text-white p-4 sticky top-0 z-30 shadow-md flex justify-between items-center rounded-b-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C89F5F] flex items-center justify-center font-bold text-lg shadow-inner">
            {session.user.name?.[0]?.toUpperCase() || 'D'}
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Delivery Hub</h1>
            <p className="text-[11px] text-[#EBE3D5] opacity-80">{session.user.name}</p>
          </div>
        </div>
        <button 
          onClick={() => router.push("/account")}
          className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
        >
          <LogOut size={16} />
        </button>
      </div>

      <div className="px-3 pt-5 pb-4 max-w-md mx-auto w-full">
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-base font-bold text-[#21050A] flex items-center gap-2">
            <Package size={18} className="text-[#C89F5F]" />
            Active Orders
          </h2>
          <span className="bg-[#21050A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {orders.filter(o => o.status !== 'DELIVERED').length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[20px] p-6 text-center border border-[#EBE3D5] shadow-sm mt-4">
            <div className="w-12 h-12 bg-[#F7F5F0] rounded-full flex items-center justify-center mx-auto mb-3 text-[#C89F5F]">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-[#21050A] font-bold text-sm mb-1">All Caught Up!</h3>
            <p className="text-gray-500 text-xs">No active orders assigned to you right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const fullAddress = order.address ? `${order.address.address}, ${order.address.city}, ${order.address.pinCode}` : "";
              const mapsUrl = getMapsUrl(order.address?.latitude, order.address?.longitude, fullAddress);
              const isDelivered = order.status === 'DELIVERED';

              return (
                <div key={order.id} className={`bg-white rounded-[16px] p-3.5 border transition-all ${isDelivered ? 'opacity-60 border-[#EBE3D5] grayscale-[0.5]' : 'border-[#C89F5F]/40 shadow-sm shadow-[#C89F5F]/10 relative overflow-hidden'}`}>
                  {!isDelivered && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#C89F5F]"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2.5 pl-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#21050A] text-sm truncate max-w-[140px]">{order.user?.name || "Customer"}</h3>
                        <span className="text-[9px] font-bold bg-[#F7F5F0] text-gray-500 px-1.5 py-0.5 rounded">
                          #{order.id.slice(0, 6).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">{order.items.length} items • ₹{order.totalAmount}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap
                      ${order.status === 'READY' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 
                        order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-50 text-orange-700 border border-orange-100' : 
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border border-green-100' : 
                        'bg-gray-100 text-gray-600 border border-gray-200'}`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 bg-[#F7F5F0] p-2.5 rounded-xl text-xs border border-[#EBE3D5]/50 ml-1">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={13} className="text-[#C89F5F] shrink-0" />
                      <a href={`tel:${order.user?.phone}`} className="font-semibold text-[#21050A] hover:text-[#C89F5F]">{order.user?.phone || "N/A"}</a>
                    </div>
                    
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={13} className="mt-0.5 text-[#C89F5F] shrink-0" />
                      <p className="leading-tight text-[11px] line-clamp-2">{fullAddress}</p>
                    </div>
                  </div>

                  {!isDelivered && (
                    <div className="mt-3 grid grid-cols-2 gap-2 ml-1">
                      <a 
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-white text-[#21050A] border border-[#EBE3D5] py-2 rounded-lg font-bold text-[11px] hover:bg-[#F7F5F0] transition-colors"
                      >
                        <MapPin size={13} /> Maps
                      </a>
                      
                      {order.status === 'READY' ? (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                          className="flex items-center justify-center gap-1.5 bg-[#C89F5F] text-white py-2 rounded-lg font-bold text-[11px] hover:bg-[#b38d54] transition-colors shadow-sm shadow-[#C89F5F]/30"
                        >
                          <Package size={13} /> Pick Up
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          className="flex items-center justify-center gap-1.5 bg-[#21050A] text-white py-2 rounded-lg font-bold text-[11px] hover:bg-[#3D141C] transition-colors shadow-sm shadow-[#21050A]/30"
                        >
                          <CheckCircle size={13} /> Delivered
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
