"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Users, Star, TrendingUp, Mail,
  ChevronDown, Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

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

  const fetchCustomers = async () => {
    try {
      setLoading(true);
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
  
  const [kpis, setKpis] = useState({
    total: 0,
    b2b: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/customers`, { cache: 'no-store' });
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

  const handleDeleteCustomer = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/customers/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        setNotification({ message: "Customer deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete customer.", type: "error" });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/customers/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setCustomers(prev => prev.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
        setNotification({ message: "Selected customers deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete selected customers.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: "An error occurred during deletion.", type: "error" });
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Customers</span>
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
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                    checked={customers.length > 0 && selectedIds.length === customers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(customers.map(c => c.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
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
                  <td colSpan={6} className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                        checked={selectedIds.includes(customer.id)}
                        onChange={() => {
                          setSelectedIds(prev => 
                            prev.includes(customer.id)
                              ? prev.filter(id => id !== customer.id)
                              : [...prev, customer.id]
                          );
                        }}
                      />
                    </td>
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
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => setSelectedCustomer(customer)} className="text-sm text-[#C89F5F] font-medium hover:underline">View Profile</button>
                        <button 
                          onClick={() => setDeleteConfirm({ isOpen: true, id: customer.id })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

              {/* Reset Password */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Reset Password</h4>
                <div className="flex gap-2">
                  <input 
                    type="password"
                    placeholder="Enter new password"
                    id="new-password-input"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F]"
                  />
                  <button 
                    onClick={async () => {
                      const input = document.getElementById('new-password-input') as HTMLInputElement;
                      if (!input || !input.value) {
                        setNotification({ message: "Please enter a new password.", type: "error" });
                        return;
                      }
                      if (input.value.length < 6) {
                        setNotification({ message: "Password must be at least 6 characters.", type: "error" });
                        return;
                      }
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/customers/${selectedCustomer.id}/reset-password`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ newPassword: input.value })
                        });
                        if (res.ok) {
                          setNotification({ message: "Password reset successfully!", type: "success" });
                          input.value = '';
                        } else {
                          const data = await res.json();
                          setNotification({ message: data.error || "Failed to reset password.", type: "error" });
                        }
                      } catch (err) {
                        console.error(err);
                        setNotification({ message: "An error occurred.", type: "error" });
                      }
                    }}
                    className="bg-[#3A1E14] hover:bg-[#2A140B] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Customer?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this customer? All their orders, reviews, addresses, and profiles will be permanently removed.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirm({isOpen: false, id: null})}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteConfirm.id && handleDeleteCustomer(deleteConfirm.id)}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Selected Customers?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete the {selectedIds.length} selected customers? All their associated data (orders, reviews, addresses) will be permanently removed.</p>
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
