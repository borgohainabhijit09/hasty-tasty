"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Users, TrendingUp, Mail, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminStaffPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'MANAGER' });
  const [isAdding, setIsAdding] = useState(false);
  
  useEffect(() => {
    // RBAC: Only SUPER_ADMIN can view and manage staff
    if (session?.user && session.user.role !== 'SUPER_ADMIN') {
      router.push("/admin");
    }
  }, [session, router]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchStaff = async () => {
      if (session?.user?.role !== 'SUPER_ADMIN') return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/staff`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setStaff(data);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) {
      fetchStaff();
    }
  }, [session]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/staff/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setStaff(prev => prev.map(s => s.id === userId ? { ...s, role: newRole } : s));
        setNotification({ message: "Staff role updated successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to update role.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: "An error occurred.", type: "error" });
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      if (res.ok) {
        const addedUser = await res.json();
        setStaff(prev => [addedUser, ...prev]);
        setNotification({ message: "Staff member added successfully!", type: "success" });
        setIsAddModalOpen(false);
        setNewStaff({ name: '', email: '', password: '', role: 'MANAGER' });
      } else {
        const data = await res.json();
        setNotification({ message: data.error || "Failed to add staff.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: "An error occurred.", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (session?.user?.role !== 'SUPER_ADMIN') {
    return <div className="p-10 text-center">Unauthorized. Only Super Admins can access this page.</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff & Roles</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Staff & Roles</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#3A1E14] hover:bg-[#2A140B] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
           <h2 className="text-sm font-bold text-gray-900">Staff Directory</h2>
           <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="Search staff..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#C89F5F]" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Contact</th>
                <th className="p-4 font-bold">Joined Date</th>
                <th className="p-4 font-bold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-500">No staff found.</td>
                </tr>
              ) : (
                staff.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                           {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail size={14} className="text-gray-400"/> {user.email}
                      </div>
                      <div className="text-[11px] text-gray-500">{user.phone || 'No phone provided'}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === session?.user?.id}
                        className="cursor-pointer outline-none bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 disabled:opacity-50"
                      >
                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="DELIVERY_BOY">DELIVERY BOY</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
            <div className="bg-[#FAF8F5] p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C89F5F]"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C89F5F]"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C89F5F]"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Assign Role</label>
                <select 
                  required
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C89F5F]"
                >
                  <option value="MANAGER">MANAGER</option>
                  <option value="DELIVERY_BOY">DELIVERY BOY</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 px-4 py-2.5 bg-[#3A1E14] hover:bg-[#2A140B] text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {isAdding ? "Adding..." : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
