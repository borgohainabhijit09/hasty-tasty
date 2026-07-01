"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Calendar as CalendarIcon, 
  ShoppingBag, IndianRupee, Users, Package, Tag,
  TrendingUp, TrendingDown, ChevronDown, Clock, Truck, ChefHat, XCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- COMPONENTS ---

const KpiCard = ({ title, value, subtitle, icon: Icon, iconBg, trend, trendValue }: any) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
    <div className="flex items-center gap-4 mb-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={22} className="text-current" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      </div>
    </div>
    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

const SectionCard = ({ title, actionText, children }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {actionText && (
        <button className="text-xs font-semibold text-[#C89F5F] hover:underline flex items-center gap-1">
          {actionText} <ChevronDown size={14} className="rotate-[-90deg]" />
        </button>
      )}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function AdminDashboard() {
  const [data, setData] = useState<{ orders: any[], customers: any[], products: any[], topProducts?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/dashboard`, { cache: 'no-store' });
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#C89F5F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  const { orders, customers, products, topProducts = [] } = data;
 
  // Calculate KPIs
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalCustomers = customers.length;
  const activeProducts = products.filter(p => p.isActive).length;

  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
  const preparingOrdersCount = orders.filter(o => ['ACCEPTED', 'PREPARING', 'PROCESSING', 'READY'].includes(o.status)).length;
  const trucksOnWayCount = orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'CANCELLED').length;

  // Order Status Data
  const orderStatusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orderStatusData = [
    { name: 'Delivered', value: orderStatusCounts['DELIVERED'] || 0, color: '#4CAF50' },
    { name: 'Confirmed', value: orderStatusCounts['CONFIRMED'] || 0, color: '#2196F3' },
    { name: 'Preparing', value: orderStatusCounts['PREPARING'] || 0, color: '#9C27B0' },
    { name: 'Pending', value: orderStatusCounts['PENDING'] || 0, color: '#FF9800' },
    { name: 'Cancelled', value: orderStatusCounts['CANCELLED'] || 0, color: '#F44336' },
  ].filter(item => item.value > 0);

  // Fallback for empty orders
  if (orderStatusData.length === 0) {
    orderStatusData.push({ name: 'No Orders', value: 1, color: '#E5E7EB' });
  }

  // Sales Chart Data
  const getDayName = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  const dayTotals: Record<string, number> = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
  orders.forEach(o => {
    if (o.createdAt) {
      const day = getDayName(o.createdAt);
      if (dayTotals[day] !== undefined) {
        dayTotals[day] += Number(o.totalAmount || 0);
      }
    }
  });
  const salesData = Object.keys(dayTotals).map(date => ({ date, amount: dayTotals[date] }));

  const recentOrders = orders.slice(0, 5);
  const newCustomers = customers.slice(0, 5);
  const lowStock = products.filter(p => p.stock < 10).slice(0, 5);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500">Welcome back, Abhijit! Here's what's happening with your store today.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="relative w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <Bell size={18} />
            {orders.filter((o: any) => o.status === 'PENDING').length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </Link>
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl py-2 px-4">
            <CalendarIcon size={18} className="text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900">{formatDate(new Date().toISOString())}</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard 
          title="Total Orders" 
          value={totalOrders} 
          icon={ShoppingBag} 
          iconBg="bg-orange-50 text-orange-600" 
          trend="up" 
          trendValue="12.5" 
        />
        <KpiCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          icon={IndianRupee} 
          iconBg="bg-green-50 text-green-600" 
          trend="up" 
          trendValue="8.4" 
        />
        <KpiCard 
          title="Total Customers" 
          value={totalCustomers} 
          icon={Users} 
          iconBg="bg-blue-50 text-blue-600" 
          trend="up" 
          trendValue="4.2" 
        />
        <KpiCard 
          title="Active Products" 
          value={activeProducts} 
          subtitle={`Out of ${products.length} products`}
          icon={Package} 
          iconBg="bg-purple-50 text-purple-600" 
        />
      </div>

      {/* Fulfillment & Delivery Brief Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard 
          title="Pending Orders" 
          value={pendingOrdersCount} 
          subtitle="Awaiting admin confirmation"
          icon={Clock} 
          iconBg="bg-yellow-50 text-yellow-600" 
        />
        <KpiCard 
          title="Preparing (In Kitchen)" 
          value={preparingOrdersCount} 
          subtitle="Orders currently in production"
          icon={ChefHat} 
          iconBg="bg-indigo-50 text-indigo-600" 
        />
        <KpiCard 
          title="Out for Delivery" 
          value={trucksOnWayCount} 
          subtitle="Delivery trucks on the way"
          icon={Truck} 
          iconBg="bg-sky-50 text-sky-600" 
        />
        <KpiCard 
          title="Cancelled Orders" 
          value={cancelledOrdersCount} 
          subtitle="Unfulfilled or rejected orders"
          icon={XCircle} 
          iconBg="bg-rose-50 text-rose-600" 
        />
      </div>

      {/* Middle Row: Charts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Overview */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
          </div>
          <div className="flex-1 w-full h-full relative -ml-4">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A171E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4A171E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#6B7280' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickFormatter={(val) => `₹${val}`}
                  width={60}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${Math.round(value)}`, 'Revenue']}
                  labelStyle={{ color: '#6B7280', marginBottom: '4px', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4A171E" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4A171E', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#C89F5F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-2">
              <span className="text-2xl font-bold text-gray-900">{totalOrders}</span>
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any, name: any) => [`${value} Orders`, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 px-2">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs text-gray-600 flex-1">{item.name}</span>
                <span className="text-xs font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1 h-[400px]">
          <SectionCard title="Recent Orders" actionText="View All">
            <div className="space-y-4 overflow-y-auto h-[290px] custom-scrollbar pr-2">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent orders.</p>
              ) : (
                recentOrders.map((order, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-bold text-gray-900 truncate">#{order.id.slice(0,6).toUpperCase()}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate">{order.customer || 'Guest'}</p>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">₹{order.totalAmount}</p>
                          <p className="text-[10px] text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
            {/* Bottom Row: Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* New Customers */}
        <div className="lg:col-span-1 h-[350px]">
          <SectionCard title="New Customers" actionText="View All">
            <div className="space-y-4 overflow-y-auto h-[240px] custom-scrollbar pr-2">
              {newCustomers.length === 0 ? (
                 <p className="text-sm text-gray-500 text-center py-4">No new customers.</p>
              ) : (
                newCustomers.map((customer, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-orange-100 text-[#C89F5F]`}>
                      {customer.name ? customer.name.substring(0,2).toUpperCase() : 'US'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{customer.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
 
        {/* Low Stock Alert */}
        <div className="lg:col-span-1 h-[350px]">
          <SectionCard title="Low Stock Alert" actionText="View All">
            <div className="space-y-4 overflow-y-auto h-[240px] custom-scrollbar pr-2">
              {lowStock.length === 0 ? (
                 <p className="text-sm text-gray-500 text-center py-4">All products have sufficient stock.</p>
              ) : (
                lowStock.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      <img src={item.imageUrl || '/images/hero-cake.png'} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Stock: {item.stock}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600 border border-red-100">
                        {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-1 h-[350px]">
          <SectionCard title="Top Selling Products" actionText="View All">
            <div className="space-y-4 overflow-y-auto h-[240px] custom-scrollbar pr-2">
              {topProducts.length === 0 ? (
                 <p className="text-sm text-gray-500 text-center py-4">No sales data available.</p>
              ) : (
                topProducts.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      <img src={item.image || '/images/hero-cake.png'} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Sales: {item.salesCount} units</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-[#3A1E14]">₹{item.price}</p>
                      <p className="text-[10px] text-green-600 font-bold">₹{item.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>  </div>

      </div>
      
      <div className="mt-4 text-center text-xs text-gray-400 pb-4">
        © 2025 Hasty Tasty. All rights reserved. <span className="float-right mr-4">Made with ❤️ for your business</span>
      </div>
      
    </div>
  );
}

// Helper components
function StatusBadge({ status }: { status: string }) {
  let colorClass = "bg-gray-100 text-gray-600";
  
  if (status === "DELIVERED") colorClass = "bg-green-50 text-green-600 border border-green-100";
  if (status === "CONFIRMED") colorClass = "bg-blue-50 text-blue-600 border border-blue-100";
  if (status === "PREPARING") colorClass = "bg-purple-50 text-purple-600 border border-purple-100";
  if (status === "OUT_FOR_DELIVERY") colorClass = "bg-orange-50 text-orange-600 border border-orange-100";
  if (status === "PENDING") colorClass = "bg-yellow-50 text-yellow-600 border border-yellow-100";
  if (status === "CANCELLED") colorClass = "bg-red-50 text-red-600 border border-red-100";
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
      {status}
    </span>
  );
}
