"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, RotateCcw, Eye, Trash2,
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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders`, { cache: 'no-store' });
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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
        setNotification({ message: "Order status updated successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to update status", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setNotification({ message: "An error occurred", type: "error" });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        setNotification({ message: "Order deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete order.", type: "error" });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => !selectedIds.includes(o.id)));
        setSelectedIds([]);
        setNotification({ message: "Selected orders deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete selected orders.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: "An error occurred during deletion.", type: "error" });
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Orders</span>
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
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(orders.map(o => o.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
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
                  <td colSpan={7} className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                        checked={selectedIds.includes(order.id)}
                        onChange={() => {
                          setSelectedIds(prev => 
                            prev.includes(order.id)
                              ? prev.filter(id => id !== order.id)
                              : [...prev, order.id]
                          );
                        }}
                      />
                    </td>
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
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setActiveOrder(order)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ isOpen: true, id: order.id })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Order?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirm({isOpen: false, id: null})}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteConfirm.id && handleDeleteOrder(deleteConfirm.id)}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Selected Orders?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete the {selectedIds.length} selected orders? This action cannot be undone.</p>
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

      {/* Order Details Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">#{activeOrder.id.toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setActiveOrder(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-all font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Customer & Address Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Customer Profile</h4>
                  <p className="text-sm font-bold text-gray-900">{activeOrder.customer?.name || "N/A"}</p>
                  <p className="text-xs text-gray-600 mt-1"><strong>Email:</strong> {activeOrder.customer?.email || "N/A"}</p>
                  <p className="text-xs text-gray-600 mt-0.5"><strong>Phone:</strong> {activeOrder.customer?.phone || "N/A"}</p>
                </div>
                
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Delivery Address</h4>
                  {activeOrder.address ? (
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong>{activeOrder.address.type || "Shipping"} Address:</strong><br />
                      {activeOrder.address.address}<br />
                      {activeOrder.address.city}, {activeOrder.address.state} - {activeOrder.address.pinCode}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No shipping address details found</p>
                  )}
                </div>
              </div>

              {/* Order Status Timeline Control */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Order Status</h4>
                  <p className="text-xs text-gray-500">Change fulfillment stage of this order.</p>
                </div>
                <div>
                  <select
                    value={activeOrder.status}
                    onChange={(e) => {
                      handleStatusChange(activeOrder.id, e.target.value);
                      setActiveOrder((prev: any) => prev ? { ...prev, status: e.target.value } : null);
                    }}
                    className={`cursor-pointer outline-none px-4 py-2 rounded-lg text-xs font-bold border ${getStatusColor(activeOrder.status)}`}
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
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Order Items</h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
                        <th className="p-3">Product Name</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeOrder.items && activeOrder.items.map((item: any) => {
                        const p = item.product || {};
                        const weightStr = p.weight ? ` (${p.weight})` : "";
                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="p-3">
                              <span className="font-bold text-gray-900">{p.name || "Unknown Product"}</span>
                              {weightStr && <span className="text-[10px] text-gray-400 block">{weightStr}</span>}
                            </td>
                            <td className="p-3 text-gray-500 font-mono">{p.sku || "N/A"}</td>
                            <td className="p-3 text-center font-semibold text-gray-900">{item.quantity}</td>
                            <td className="p-3 text-right text-gray-600">₹{item.price}</td>
                            <td className="p-3 text-right font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="flex justify-end">
                <div className="w-full md:w-64 space-y-2 text-xs border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₹{(activeOrder.totalAmount - (activeOrder.shippingAmount || 0) - (activeOrder.taxAmount || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Location Surcharge</span>
                    <span className="font-bold text-gray-900">₹{(activeOrder.shippingAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span>
                    <span className="font-bold text-gray-900">₹{(activeOrder.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-emerald-600">₹{activeOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setActiveOrder(null)}
                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
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
