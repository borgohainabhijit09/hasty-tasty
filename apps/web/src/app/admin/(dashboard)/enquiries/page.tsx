"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Calendar, Mail, Phone, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/enquiries`);
        if (res.ok) {
          const data = await res.json();
          setEnquiries(data);
        }
      } catch (error) {
        console.error("Failed to fetch enquiries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-yellow-50 text-yellow-600">Pending</span>;
      case 'REVIEWED': return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600">Reviewed</span>;
      case 'CONVERTED': return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-600">Converted</span>;
      case 'CANCELLED': return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-600">Cancelled</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enquiries</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Enquiries</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
             <MessageSquare size={16} className="text-[#C89F5F]"/> 
             Customer Enquiries
           </h2>
           <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="Search by name..." className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-[#C89F5F]" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Customer Details</th>
                <th className="p-4 font-bold">Message / Notes</th>
                <th className="p-4 font-bold text-center">Expected Date</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Submitted On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500">No enquiries found.</td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">{enq.customer?.name}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Mail size={12} /> {enq.customer?.email}
                        </div>
                        {enq.customer?.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Phone size={12} /> {enq.customer?.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-sm truncate" title={enq.notes}>
                      {enq.notes || <span className="text-gray-400 italic">No notes provided</span>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700">
                        <Calendar size={14} className="text-[#C89F5F]" />
                        {formatDate(enq.expectedDate)}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(enq.status)}
                    </td>
                    <td className="p-4 text-center text-xs text-gray-500">
                       <div className="flex items-center justify-center gap-1">
                         <Clock size={12} />
                         {formatDate(enq.createdAt)}
                       </div>
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
