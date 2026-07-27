"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Briefcase, FileText, Check, X
} from 'lucide-react';
import Link from 'next/link';

export default function AdminB2BPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [kpis, setKpis] = useState({
    total: 0,
    pending: 0,
    approved: 0
  });

  useEffect(() => {
    const fetchB2B = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/b2b`);
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
          
          setKpis({
            total: data.length,
            pending: data.filter((b: any) => b.status === 'PENDING').length,
            approved: data.filter((b: any) => b.status === 'APPROVED').length
          });
        }
      } catch (error) {
        console.error("Failed to fetch b2b applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchB2B();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-yellow-50 text-yellow-600">Pending Review</span>;
      case 'APPROVED': return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-50 text-green-600">Approved</span>;
      case 'REJECTED': return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-600">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">B2B Applications</h1>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
          <span>&gt;</span>
          <span className="text-[#C89F5F]">B2B</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
            <Briefcase size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Applications</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-50 text-yellow-600">
            <FileText size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Review</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
            <Check size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Approved Partners</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.approved}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
           <h2 className="text-sm font-bold text-gray-900">Partner Applications</h2>
           <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="Search business name..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#C89F5F]" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Business Info</th>
                <th className="p-4 font-bold">GST Number</th>
                <th className="p-4 font-bold">Contact Person</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500">No applications found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">{app.businessName}</p>
                    </td>
                    <td className="p-4 text-sm font-mono text-gray-600">{app.gstNumber}</td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900">{app.contactPerson}</p>
                      <p className="text-[11px] text-gray-500">{app.applicant?.email}</p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="p-4 text-center">
                       {app.status === 'PENDING' ? (
                         <div className="flex items-center justify-center gap-2">
                           <button className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors" title="Approve">
                             <Check size={16} />
                           </button>
                           <button className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors" title="Reject">
                             <X size={16} />
                           </button>
                         </div>
                       ) : (
                         <button className="text-sm text-gray-400 font-medium cursor-not-allowed">Processed</button>
                       )}
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
