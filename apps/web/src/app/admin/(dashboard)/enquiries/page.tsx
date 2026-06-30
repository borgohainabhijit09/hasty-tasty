"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Calendar, Mail, Phone, Clock, Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/enquiries`, { cache: 'no-store' });
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

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/enquiries`, { cache: 'no-store' });
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

  const handleDeleteEnquiry = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/enquiries/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      if (res.ok) {
        setEnquiries(prev => prev.filter(e => e.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        setNotification({ message: "Enquiry deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete enquiry.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: "An error occurred.", type: "error" });
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/enquiries/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setEnquiries(prev => prev.filter(e => !selectedIds.includes(e.id)));
        setSelectedIds([]);
        setNotification({ message: "Selected enquiries deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete selected enquiries.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: "An error occurred during deletion.", type: "error" });
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enquiries</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Enquiries</span>
          </div>
        </div>
        
        {selectedIds.length > 0 && (
          <button 
            onClick={() => setBulkDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm self-end"
          >
            <Trash2 size={16} />
            Delete Selected ({selectedIds.length})
          </button>
        )}
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
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                    checked={enquiries.length > 0 && selectedIds.length === enquiries.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(enquiries.map(e => e.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="p-4 font-bold">Customer Details</th>
                <th className="p-4 font-bold">Message / Notes</th>
                <th className="p-4 font-bold text-center">Expected Date</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Submitted On</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">No enquiries found.</td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                        checked={selectedIds.includes(enq.id)}
                        onChange={() => {
                          setSelectedIds(prev => 
                            prev.includes(enq.id)
                              ? prev.filter(id => id !== enq.id)
                              : [...prev, enq.id]
                          );
                        }}
                      />
                    </td>
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
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setDeleteConfirm({ isOpen: true, id: enq.id })}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Enquiry?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this enquiry? This action cannot be undone.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirm({isOpen: false, id: null})}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteConfirm.id && handleDeleteEnquiry(deleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Selected Enquiries?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete the {selectedIds.length} selected enquiries? This action cannot be undone.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setBulkDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5 duration-350">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-xs font-bold border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
