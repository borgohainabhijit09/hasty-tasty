"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, RotateCcw, Eye, Trash2, Edit, Check, X,
  ShoppingBag, Clock, CheckCircle, Truck, Package, Download,
  ChevronDown, Printer
} from 'lucide-react';
import Link from 'next/link';
import { getDeliveryBoys } from '@/app/actions/admin';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [kpis, setKpis] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    revenue: 0
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [datePreset, setDatePreset] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // Compute filtered orders
  const filteredOrders = orders.filter((o) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const orderIdMatch = o.id.toLowerCase().includes(q);
      const nameMatch = o.customer?.name?.toLowerCase().includes(q);
      const emailMatch = o.customer?.email?.toLowerCase().includes(q);
      if (!orderIdMatch && !nameMatch && !emailMatch) {
        return false;
      }
    }

    // 2. Status Filter
    if (statusFilter !== "ALL") {
      if (o.status !== statusFilter) {
        return false;
      }
    }

    // 3. Date Presets & Custom Ranges
    if (datePreset !== "ALL") {
      const orderDate = new Date(o.createdAt);
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

      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
    }

    return true;
  });

  const totalCount = filteredOrders.length;
  const pendingCount = filteredOrders.filter(o => o.status === 'PENDING').length;
  const deliveredCount = filteredOrders.filter(o => o.status === 'DELIVERED').length;
  const revenueTotal = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    invoiceType: 'gst',
    gstRate: '5',
    taxCalculation: 'included',
    storeGstIn: '18AABCU9603R1ZM',
    storeAddress: 'Hasty Tasty, Near ASTC Bus Stand, Golaghat, Assam - 785621',
    storePhone: '+91 94350 00000',
    printFormat: 'thermal'
  });

  const handlePrint = (order: any, options: typeof printOptions) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const {
      invoiceType,
      gstRate,
      taxCalculation,
      storeGstIn,
      storeAddress,
      storePhone,
      printFormat,
    } = options;

    const gstRateNum = Number(gstRate);
    const ratePercent = gstRateNum / 100;
    const shipping = Number(order.shippingAmount || 0);
    const originalTotal = Number(order.totalAmount || 0);

    let taxableSubtotal = 0;
    let taxAmount = 0;
    let finalTotal = 0;

    if (invoiceType === 'simple') {
      taxableSubtotal = originalTotal - shipping;
      taxAmount = 0;
      finalTotal = originalTotal;
    } else {
      if (taxCalculation === 'included') {
        taxableSubtotal = (originalTotal - shipping) / (1 + ratePercent);
        taxAmount = (originalTotal - shipping) - taxableSubtotal;
        finalTotal = originalTotal;
      } else {
        taxableSubtotal = originalTotal - shipping;
        taxAmount = taxableSubtotal * ratePercent;
        finalTotal = taxableSubtotal + taxAmount + shipping;
      }
    }

    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;

    const itemsHtml = order.items.map((item: any) => {
      const p = item.product || {};
      const unitPrice = Number(item.price);
      const qty = Number(item.quantity);
      const lineTotal = unitPrice * qty;

      return `
        <tr style="border-bottom: 1px ${printFormat === 'thermal' ? 'dashed #000' : 'solid #eee'};">
          <td style="padding: 8px 0; text-align: left; vertical-align: top;">
            <strong>${p.name || 'Unknown Item'}</strong>
            ${p.weight ? `<div style="font-size: 10px; color: #666;">${p.weight}</div>` : ''}
          </td>
          <td style="padding: 8px 0; text-align: center; vertical-align: top;">${qty}</td>
          <td style="padding: 8px 0; text-align: right; vertical-align: top;">₹${unitPrice.toFixed(2)}</td>
          <td style="padding: 8px 0; text-align: right; vertical-align: top;">₹${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const isThermal = printFormat === 'thermal';
    const containerStyle = isThermal 
      ? 'width: 80mm; padding: 4mm; font-family: monospace; font-size: 12px; color: #000; background: #fff;'
      : 'max-width: 800px; padding: 40px; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #333; background: #fff; line-height: 1.5;';

    const headerStyle = isThermal
      ? 'text-align: center; margin-bottom: 15px;'
      : 'display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px;';

    const footerStyle = isThermal
      ? 'text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px;'
      : 'text-align: center; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; color: #777; font-size: 12px;';

    const tableHeaderStyle = isThermal
      ? 'border-top: 1px dashed #000; border-bottom: 1px dashed #000; font-weight: bold; font-size: 11px;'
      : 'background: #FAF8F5; font-weight: bold; border-top: 1px solid #eee; border-bottom: 1px solid #eee;';

    const summarySectionStyle = isThermal
      ? 'border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px;'
      : 'border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px; display: flex; justify-content: flex-end;';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Invoice #${order.id.slice(0, 8).toUpperCase()}</title>
        <meta charset="utf-8">
        <style>
          @media print {
            body { margin: 0; background: #fff; padding: 0; }
            .no-print { display: none !important; }
            @page { margin: 0; }
          }
          body { background: #f5f5f5; margin: 0; padding: 20px; display: flex; justify-content: center; }
          * { box-sizing: border-box; }
          table { width: 100%; border-collapse: collapse; }
        </style>
      </head>
      <body>
        <div style="${containerStyle} box-shadow: 0 0 10px rgba(0,0,0,0.05); margin: 0 auto;">
          
          <!-- Action Buttons (No Print) -->
          <div class="no-print" style="margin-bottom: 20px; display: flex; gap: 10px; justify-content: center; width: 100%;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #C89F5F; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">Print Invoice</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #333; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">Close</button>
          </div>

          <!-- Header -->
          <div style="${headerStyle}">
            <div style="${isThermal ? 'text-align: center;' : 'text-align: left;'}">
              <h1 style="margin: 0; font-size: ${isThermal ? '22px' : '28px'}; font-weight: bold; text-transform: uppercase; color: #4A171E;">Hasty Tasty</h1>
              <p style="margin: 3px 0; font-size: ${isThermal ? '11px' : '13px'};">${storeAddress}</p>
              <p style="margin: 3px 0; font-size: ${isThermal ? '11px' : '13px'};"><strong>Ph:</strong> ${storePhone}</p>
              ${invoiceType === 'gst' && storeGstIn ? `<p style="margin: 3px 0; font-size: ${isThermal ? '11px' : '13px'};"><strong>GSTIN:</strong> ${storeGstIn}</p>` : ''}
            </div>
            ${!isThermal ? `
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 20px; color: #C89F5F; text-transform: uppercase;">${invoiceType === 'gst' ? 'Tax Invoice' : 'Cash Memo'}</h2>
              <p style="margin: 5px 0 0 0;"><strong>Invoice No:</strong> HT-${order.id.slice(0, 8).toUpperCase()}</p>
              <p style="margin: 3px 0 0 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            ` : `
            <div style="border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px; text-align: center; font-size: 11px;">
              <strong>${invoiceType === 'gst' ? 'TAX INVOICE' : 'CASH MEMO / RECEIPT'}</strong><br/>
              HT-${order.id.slice(0, 8).toUpperCase()}<br/>
              ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            `}
          </div>

          <!-- Billing Info -->
          <div style="margin-bottom: 20px; font-size: ${isThermal ? '11px' : '13px'}; border-top: ${isThermal ? '1px dashed #000' : 'none'}; padding-top: ${isThermal ? '5px' : '0'}; line-height: 1.4;">
            <p style="margin: 4px 0;"><strong>Bill To:</strong> ${order.customer?.name || 'Walk-in Customer'}</p>
            ${order.customer?.phone ? `<p style="margin: 4px 0;"><strong>Ph:</strong> ${order.customer.phone}</p>` : ''}
            ${order.address ? `<p style="margin: 4px 0;"><strong>Delivery Addr:</strong> ${order.address.address}, ${order.address.city}, ${order.address.state} - ${order.address.pinCode}</p>` : ''}
            ${invoiceType === 'gst' && order.customer?.businessProfile?.gstNumber ? `<p style="margin: 4px 0; color: #4A171E;"><strong>Customer GSTIN:</strong> ${order.customer.businessProfile.gstNumber}</p>` : ''}
          </div>

          <!-- Items Table -->
          <table style="margin-bottom: 20px; font-size: ${isThermal ? '11px' : '13px'};">
            <thead>
              <tr style="${tableHeaderStyle}">
                <th style="padding: 6px 0; text-align: left;">Item</th>
                <th style="padding: 6px 0; text-align: center; width: 40px;">Qty</th>
                <th style="padding: 6px 0; text-align: right; width: 80px;">Rate</th>
                <th style="padding: 6px 0; text-align: right; width: 90px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Summary -->
          <div style="${summarySectionStyle}">
            <div style="${isThermal ? 'width: 100%' : 'width: 300px'}; font-size: ${isThermal ? '11px' : '13px'}; line-height: 1.8;">
              <div style="display: flex; justify-content: space-between;">
                <span>Subtotal:</span>
                <span>₹${taxableSubtotal.toFixed(2)}</span>
              </div>
              
              ${invoiceType === 'gst' ? `
              <div style="display: flex; justify-content: space-between;">
                <span>CGST (${(gstRateNum / 2).toFixed(1)}%):</span>
                <span>₹${cgst.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>SGST (${(gstRateNum / 2).toFixed(1)}%):</span>
                <span>₹${sgst.toFixed(2)}</span>
              </div>
              ` : ''}
              
              <div style="display: flex; justify-content: space-between;">
                <span>Delivery:</span>
                <span>${shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px dashed #000; padding-top: 5px; font-size: ${isThermal ? '13px' : '16px'}; margin-top: 5px; color: #2E7D32;">
                <span>Grand Total:</span>
                <span>₹${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="${footerStyle}">
            <p style="margin: 5px 0; font-weight: bold;">Thank you for your order!</p>
            <p style="margin: 3px 0;">Visit us again at Hasty Tasty Bakery.</p>
            ${isThermal ? '<p style="margin: 15px 0 0 0; font-size: 8px;">HT-POS billing system</p>' : ''}
          </div>

        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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
    
    const initData = async () => {
      await fetchOrders();
      const res = await getDeliveryBoys();
      if (res.data) setDeliveryBoys(res.data);
    };
    
    initData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000); // Extended toast time for new order alerts
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      const now = ctx.currentTime;
      playTone(587.33, now, 0.4); // D5
      playTone(880.00, now + 0.15, 0.6); // A5
    } catch (e) {
      console.error("Audio playback blocked or failed:", e);
    }
  };

  // Polling for new orders every 10 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders`, { cache: 'no-store' });
        if (res.ok) {
          const newData = await res.json();
          
          setOrders(prevOrders => {
            if (prevOrders.length > 0 && newData.length > 0) {
              const prevIds = new Set(prevOrders.map((o: any) => o.id));
              const newOrders = newData.filter((o: any) => !prevIds.has(o.id));
              
              if (newOrders.length > 0) {
                playNotificationSound();
                setNotification({
                  message: `🔔 New Order Received! ID: ${newOrders[0].id.slice(0, 8).toUpperCase()}`,
                  type: 'success'
                });
              }

              // Check if any order count or properties/status changed
              const hasChanges = prevOrders.length !== newData.length ||
                newData.some((newO: any, idx: number) => {
                  const oldO = prevOrders[idx];
                  return !oldO || oldO.id !== newO.id || oldO.status !== newO.status || oldO.totalAmount !== newO.totalAmount;
                });

              if (hasChanges) {
                setKpis({
                  total: newData.length,
                  pending: newData.filter((o: any) => o.status === 'PENDING').length,
                  delivered: newData.filter((o: any) => o.status === 'DELIVERED').length,
                  revenue: newData.reduce((sum: number, o: any) => sum + o.totalAmount, 0)
                });
                return newData;
              }
            }
            return prevOrders.length === 0 ? newData : prevOrders;
          });
        }
      } catch (error) {
        console.error("Failed to poll new orders:", error);
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, []);

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
    return d.toLocaleString('en-GB', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' 
    });
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

  const handleAssignDeliveryBoy = async (orderId: string, deliveryBoyId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryBoyId })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryBoyId: deliveryBoyId === "" ? null : deliveryBoyId } : o));
        setNotification({ message: "Delivery assignment updated!", type: "success" });
      } else {
        setNotification({ message: "Failed to assign delivery boy", type: "error" });
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
        
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setBulkDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm self-end"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedIds.length})
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm self-end"
          >
            <RotateCcw size={16} className={`${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export CSV */}
          <a 
            href={`/api/admin/orders/export?status=${statusFilter}&datePreset=${datePreset}&startDate=${startDate}&endDate=${endDate}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm self-end"
          >
            <Download size={16} />
            Export CSV
          </a>

          {/* Export for Tally */}
          <a 
            href={`/api/admin/orders/export/tally?status=${statusFilter}&datePreset=${datePreset}&startDate=${startDate}&endDate=${endDate}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm self-end"
          >
            <Download size={16} />
            Export for Tally
          </a>
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
            <p className="text-2xl font-bold text-gray-900 leading-none">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-50 text-yellow-600">
            <Clock size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Pending</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
            <CheckCircle size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Delivered</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{deliveredCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600">
            <Truck size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Revenue</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">₹{revenueTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Order ID, Customer..." 
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
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PREPARING">PREPARING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="READY">READY</option>
              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
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
                    checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredOrders.map(o => o.id));
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
                <th className="p-4 font-bold">Delivery</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
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
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`appearance-none cursor-pointer outline-none inline-flex items-center pl-2.5 pr-6 py-1 rounded-md text-[10px] font-bold border-transparent ${getStatusColor(order.status)}`}
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
                        <ChevronDown size={12} className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${getStatusColor(order.status).split(' ')[1]}`} />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="relative inline-block w-[110px]">
                        <select
                          value={order.deliveryBoyId || ""}
                          onChange={(e) => handleAssignDeliveryBoy(order.id, e.target.value)}
                          className="w-full appearance-none cursor-pointer outline-none pl-2.5 pr-6 py-1 rounded-md text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-white focus:border-[#C89F5F] transition-colors truncate"
                        >
                          <option value="">Unassigned</option>
                          {deliveryBoys.map(boy => (
                            <option key={boy.id} value={boy.id}>{boy.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
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
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                <div className="h-px w-full bg-gray-200"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Delivery Assignment</h4>
                    <p className="text-xs text-gray-500">Assign a delivery boy to this order.</p>
                  </div>
                  <div>
                    <select
                      value={activeOrder.deliveryBoyId || ""}
                      onChange={(e) => {
                        handleAssignDeliveryBoy(activeOrder.id, e.target.value);
                        setActiveOrder((prev: any) => prev ? { ...prev, deliveryBoyId: e.target.value || null } : null);
                      }}
                      className="cursor-pointer outline-none px-4 py-2 rounded-lg text-xs font-bold border border-gray-300 bg-white text-gray-700"
                    >
                      <option value="">Unassigned</option>
                      {deliveryBoys.map(db => (
                        <option key={db.id} value={db.id}>{db.name}</option>
                      ))}
                    </select>
                  </div>
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
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button 
                onClick={() => setIsPrintOptionsOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Printer size={14} />
                Print Bill
              </button>
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

      {/* Print Options Modal */}
      {isPrintOptionsOpen && activeOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Print Configuration</h3>
                <p className="text-xs text-gray-500 mt-0.5">Configure bill printing details</p>
              </div>
              <button 
                onClick={() => setIsPrintOptionsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              {/* Invoice Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Invoice Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrintOptions(prev => ({ ...prev, invoiceType: 'gst' }))}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                      printOptions.invoiceType === 'gst'
                        ? 'border-[#C89F5F] bg-[#FAF8F5] text-[#5c2a1c]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    GST Tax Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintOptions(prev => ({ ...prev, invoiceType: 'simple' }))}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                      printOptions.invoiceType === 'simple'
                        ? 'border-[#C89F5F] bg-[#FAF8F5] text-[#5c2a1c]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Cash Memo / Simple Bill
                  </button>
                </div>
              </div>

              {printOptions.invoiceType === 'gst' && (
                <>
                  {/* GST Rate */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">GST Rate</label>
                      <select
                        value={printOptions.gstRate}
                        onChange={(e) => setPrintOptions(prev => ({ ...prev, gstRate: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C89F5F]"
                      >
                        <option value="5">5% (Bakery Standard)</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                      </select>
                    </div>

                    {/* Tax Calculation */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tax Mode</label>
                      <select
                        value={printOptions.taxCalculation}
                        onChange={(e) => setPrintOptions(prev => ({ ...prev, taxCalculation: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C89F5F]"
                      >
                        <option value="included">Tax Included in Price</option>
                        <option value="added">Add Tax on Top</option>
                      </select>
                    </div>
                  </div>

                  {/* Store GSTIN */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Store GSTIN</label>
                    <input
                      type="text"
                      value={printOptions.storeGstIn}
                      onChange={(e) => setPrintOptions(prev => ({ ...prev, storeGstIn: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C89F5F]"
                      placeholder="Enter Store GSTIN"
                    />
                  </div>
                </>
              )}

              {/* Print Format */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Print Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrintOptions(prev => ({ ...prev, printFormat: 'thermal' }))}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                      printOptions.printFormat === 'thermal'
                        ? 'border-[#C89F5F] bg-[#FAF8F5] text-[#5c2a1c]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Thermal Receipt (80mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintOptions(prev => ({ ...prev, printFormat: 'a4' }))}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                      printOptions.printFormat === 'a4'
                        ? 'border-[#C89F5F] bg-[#FAF8F5] text-[#5c2a1c]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Standard Page (A4 / A5)
                  </button>
                </div>
              </div>

              {/* Store Address & Phone */}
              <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Store Address</label>
                  <input
                    type="text"
                    value={printOptions.storeAddress}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, storeAddress: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#C89F5F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Store Phone</label>
                  <input
                    type="text"
                    value={printOptions.storePhone}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, storePhone: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#C89F5F]"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsPrintOptionsOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePrint(activeOrder, printOptions);
                  setIsPrintOptionsOpen(false);
                }}
                className="bg-[#C89F5F] hover:bg-[#b08b50] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Printer size={14} />
                Generate & Print
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
