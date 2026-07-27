"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Calendar, Mail, Phone, Clock, Trash2,
  ChevronDown, Filter, Eye
} from 'lucide-react';
import Link from 'next/link';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [datePreset, setDatePreset] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeEnquiry, setActiveEnquiry] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  // Compute filtered enquiries
  const filteredEnquiries = enquiries.filter((e) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = e.customer?.name?.toLowerCase().includes(q);
      const emailMatch = e.customer?.email?.toLowerCase().includes(q);
      const phoneMatch = e.customer?.phone?.toLowerCase().includes(q);
      const noteMatch = e.notes?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch && !noteMatch) {
        return false;
      }
    }

    // 2. Status Filter
    if (statusFilter !== "ALL") {
      if (e.status !== statusFilter) {
        return false;
      }
    }

    // 3. Date Presets & Custom Ranges
    if (datePreset !== "ALL") {
      const enqDate = new Date(e.createdAt);
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = null;

      if (datePreset === "TODAY") {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
      } else if (datePreset === "YESTERDAY") {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        start = new Date(yesterday.setHours(0, 0, 0, 0));
        end = new Date(yesterday.setHours(23, 59, 59, 999));
      } else if (datePreset === "LAST_7_DAYS") {
        start = new Date();
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end = new Date();
      } else if (datePreset === "LAST_30_DAYS") {
        start = new Date();
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        end = new Date();
      } else if (datePreset === "THIS_MONTH") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
      } else if (datePreset === "LAST_MONTH") {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      } else if (datePreset === "CUSTOM" && startDate && endDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }

      if (start && enqDate < start) return false;
      if (end && enqDate > end) return false;
    }

    return true;
  });
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' 
    });
  };

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/enquiries/${enquiryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status: newStatus } : e));
        setNotification({ message: "Enquiry status updated successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to update status", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setNotification({ message: "An error occurred", type: "error" });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
      case 'REVIEWED': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'CONVERTED': return 'bg-green-50 text-green-600 border border-green-100';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-gray-50 text-gray-600 border border-gray-100';
    }
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
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-8 min-w-0">
      
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

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-wrap items-end gap-4 w-full">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Customer, Message..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#C89F5F]" 
            />
          </div>
        </div>

        {/* Status */}
        <div className="w-[160px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Status</label>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-[#C89F5F]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="CONVERTED">CONVERTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Date Preset */}
        <div className="w-[180px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Date Filter</label>
          <div className="relative">
            <select 
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value);
                if (e.target.value !== "CUSTOM") {
                  setStartDate("");
                  setEndDate("");
                }
              }}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-[#C89F5F]"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="CUSTOM">Custom Range...</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Custom Range Fields */}
        {datePreset === "CUSTOM" && (
          <>
            <div className="w-[150px] animate-in slide-in-from-left duration-200">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-[#C89F5F]" 
              />
            </div>
            <div className="w-[150px] animate-in slide-in-from-left duration-200">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-[#C89F5F]" 
              />
            </div>
          </>
        )}

        {/* Clear Filters Button */}
        {(searchQuery || statusFilter !== "ALL" || datePreset !== "ALL") && (
          <button 
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setDatePreset("ALL");
              setStartDate("");
              setEndDate("");
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 py-2 px-3 hover:bg-rose-50 rounded-lg transition-all"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table Card wrapper */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full min-w-0">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 w-full">
           <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
             <MessageSquare size={16} className="text-[#C89F5F]"/> 
             Customer Enquiries
           </h2>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="min-w-[800px] w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                    checked={filteredEnquiries.length > 0 && selectedIds.length === filteredEnquiries.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredEnquiries.map(e => e.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="p-4 font-bold">Customer Details</th>
                <th className="p-4 font-bold">Source</th>
                <th className="p-4 font-bold text-right">Total Amount</th>
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
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">No enquiries found.</td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => {
                  const enqTotal = enq.items && enq.items.length > 0
                    ? enq.items.reduce((sum: number, item: any) => sum + (Number(item.product?.price || 0) * item.quantity), 0)
                    : 0;
                  return (
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
                      <td className="p-4">
                        {enq.items && enq.items.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            B2B Enquiry
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                            Suggestion Box
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900 text-right">
                        {enq.items && enq.items.length > 0 ? (
                          `₹${enqTotal.toFixed(2)}`
                        ) : (
                          <span className="text-gray-400 font-normal">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          className={`appearance-none cursor-pointer outline-none inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border-transparent ${getStatusColor(enq.status)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="REVIEWED">REVIEWED</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="p-4 text-center text-xs text-gray-500">
                         <div className="flex items-center justify-center gap-1">
                           <Clock size={12} />
                           {formatDateTime(enq.createdAt)}
                         </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setActiveEnquiry(enq)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm({ isOpen: true, id: enq.id })}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Enquiry Details Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Enquiry Details</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">#{activeEnquiry.id.toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setActiveEnquiry(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-all font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Customer Profile</h4>
                  <p className="text-sm font-bold text-gray-900">{activeEnquiry.customer?.name || "N/A"}</p>
                  <p className="text-xs text-gray-600 mt-1"><strong>Email:</strong> {activeEnquiry.customer?.email || "N/A"}</p>
                  <p className="text-xs text-gray-600 mt-0.5"><strong>Phone:</strong> {activeEnquiry.customer?.phone || "N/A"}</p>
                </div>
                
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Submission Details</h4>
                  <p className="text-xs text-gray-600 mt-1"><strong>Source:</strong> {activeEnquiry.items && activeEnquiry.items.length > 0 ? "B2B Enquiry Portal" : "Customer Suggestion Box"}</p>
                  <p className="text-[11px] text-gray-500 mt-1.5">Submitted on: {formatDateTime(activeEnquiry.createdAt)}</p>
                </div>
              </div>

              {/* Status Action */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Enquiry Status</h4>
                  <p className="text-xs text-gray-500">Change processing stage of this enquiry.</p>
                </div>
                <div>
                  <select
                    value={activeEnquiry.status}
                    onChange={(e) => {
                      handleStatusChange(activeEnquiry.id, e.target.value);
                      setActiveEnquiry((prev: any) => prev ? { ...prev, status: e.target.value } : null);
                    }}
                    className={`cursor-pointer outline-none px-4 py-2 rounded-lg text-xs font-bold border ${getStatusColor(activeEnquiry.status)}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Message / Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Message / Notes</h4>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {activeEnquiry.notes || <span className="text-gray-400 italic">No notes provided</span>}
                </div>
              </div>

              {/* Items List (only B2B requests) */}
              {activeEnquiry.items && activeEnquiry.items.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Requested Wholesale Products</h4>
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
                          <th className="p-3">Product Name</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activeEnquiry.items.map((item: any) => {
                          const p = item.product || {};
                          const price = Number(p.price || 0);
                          const weightStr = p.weight ? ` (${p.weight})` : "";
                          return (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                              <td className="p-3">
                                <span className="font-bold text-gray-900">{p.name || "Unknown Product"}</span>
                                {weightStr && <span className="text-[10px] text-gray-400 block">{weightStr}</span>}
                              </td>
                              <td className="p-3 text-gray-500 font-mono">{p.sku || "N/A"}</td>
                              <td className="p-3 text-center font-semibold text-gray-900">{item.quantity}</td>
                              <td className="p-3 text-right text-gray-600">₹{price.toFixed(2)}</td>
                              <td className="p-3 text-right font-bold text-gray-900">₹{(price * item.quantity).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Estimated Wholesale Total */}
                  <div className="flex justify-end mt-4">
                    <div className="text-right">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Estimated Wholesale Total</span>
                      <span className="text-lg font-bold text-[#C89F5F] block mt-0.5">
                        ₹{activeEnquiry.items.reduce((sum: number, item: any) => sum + (Number(item.product?.price || 0) * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end items-center">
              <button 
                onClick={() => setActiveEnquiry(null)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                Close Details
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
