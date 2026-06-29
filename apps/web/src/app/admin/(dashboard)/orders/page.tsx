"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, RotateCcw, Eye, 
  ShoppingBag, CheckCircle, Clock, Truck,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [kpis, setKpis] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
          
          setKpis({
            total: data.length,
            pending: data.filter((o: any) => o.status === 'PENDING').length,
            delivered: data.filter((o: any) => o.status === 'DELIVERED').length,
            revenue: data.reduce((sum: number, o: any) => sum + o.totalAmount, 0)
          });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-600';
      case 'ACCEPTED': return 'bg-indigo-50 text-indigo-600';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-600';
      case 'PREPARING': return 'bg-purple-50 text-purple-600';
      case 'PROCESSING': return 'bg-purple-50 text-purple-600';
      case 'READY': return 'bg-cyan-50 text-cyan-600';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-50 text-orange-600';
      case 'DELIVERED': return 'bg-green-50 text-green-600';
      case 'CANCELLED': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
          <span>&gt;</span>
          <span className="text-[#C89F5F]">Orders</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
            <ShoppingBag size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-50 text-yellow-600">
            <Clock size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Pending</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
            <CheckCircle size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Delivered</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.delivered}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600">
            <Truck size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Revenue</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">₹{kpis.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search Order ID, Customer..." className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#C89F5F]" />
          </div>
        </div>
        <div className="w-[160px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Status</label>
          <div className="relative">
            <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-[#C89F5F]">
              <option>All Status</option>
              <option>PENDING</option>
              <option>DELIVERED</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-[#3A1E14] hover:bg-[#2A080C] text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 text-sm font-mono text-gray-600">{order.id.slice(0,8).toUpperCase()}</td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">{order.customer?.name}</p>
                      <p className="text-[11px] text-gray-500">{order.customer?.email}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">₹{order.totalAmount}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`appearance-none cursor-pointer outline-none inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border-transparent ${getStatusColor(order.status)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="READY">READY</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
