"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Users, Star, TrendingUp, Mail,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  
  const [kpis, setKpis] = useState({
    total: 0,
    b2b: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/customers`);
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
          
          const currentMonth = new Date().getMonth();
          
          setKpis({
            total: data.length,
            b2b: data.filter((c: any) => c.role === 'B2B_CUSTOMER').length,
            newThisMonth: data.filter((c: any) => new Date(c.createdAt).getMonth() === currentMonth).length
          });
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
          <span>&gt;</span>
          <span className="text-[#C89F5F]">Customers</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
            <Users size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Customers</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50 text-purple-600">
            <Star size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">B2B Customers</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.b2b}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
            <TrendingUp size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">New This Month</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.newThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
           <h2 className="text-sm font-bold text-gray-900">Customer Directory</h2>
           <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="Search customers..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#C89F5F]" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Contact</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Joined Date</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-[#C89F5F] flex items-center justify-center font-bold text-sm">
                           {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail size={14} className="text-gray-400"/> {customer.email}
                      </div>
                      <div className="text-[11px] text-gray-500">{customer.phone || 'No phone provided'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold ${customer.role === 'B2B_CUSTOMER' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {customer.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(customer.createdAt)}</td>
                    <td className="p-4 text-center">
                       <button onClick={() => setSelectedCustomer(customer)} className="text-sm text-[#C89F5F] font-medium hover:underline">View Profile</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* View Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
            <div className="bg-[#FAF8F5] p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#C89F5F] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-bold ${selectedCustomer.role === 'B2B_CUSTOMER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedCustomer.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 transition-colors self-start">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <a href={`mailto:${selectedCustomer.email}`} className="text-gray-700 hover:text-[#C89F5F]">{selectedCustomer.email}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <span className="text-gray-700">{selectedCustomer.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-500 mb-1">Joined Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 mb-1">Status</p>
                    <p className="text-sm font-medium text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
