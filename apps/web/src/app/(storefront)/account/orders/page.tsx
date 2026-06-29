"use client";

import { ChevronRight, PackageOpen, Loader2, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch real orders from database along with order items and products, and address
        const { data } = await supabase
          .from('Order')
          .select(`
            id, 
            totalAmount, 
            shippingAmount,
            status, 
            createdAt,
            address:Address(address, city, state, pinCode, type),
            items:OrderItem(
              quantity, 
              price,
              product:Product(name, images:ProductImage(url))
            )
          `)
          .eq('userId', user.id)
          .order('createdAt', { ascending: false });
        
        if (data) setOrders(data);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  const getColorClasses = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'DELIVERED': return 'bg-green-50 text-green-700';
      case 'OUT_FOR_DELIVERY':
      case 'SHIPPED': return 'bg-orange-50 text-orange-700';
      case 'PROCESSING':
      case 'PREPARING':
      case 'READY': return 'bg-blue-50 text-blue-700';
      case 'CANCELLED': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700'; // PENDING, etc
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getOrderSummaryText = (items: any[]) => {
    if (!items || items.length === 0) return "No items";
    const parts = items.slice(0, 2).map(i => `${i.quantity}x ${i.product?.name || 'Item'}`);
    if (items.length > 2) {
      parts.push(`+${items.length - 2} more`);
    }
    return parts.join(', ');
  };

  const getFirstImage = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return items[0].product?.images?.[0]?.url || null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#C89F5F]">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-bold text-3xl text-[#5c2a1c]">My Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-[#FAF8F5] rounded-full text-[#C89F5F] flex items-center justify-center mb-4">
            <PackageOpen size={24} />
          </div>
          <h3 className="font-bold text-lg text-[#3A1E14] mb-2">No Orders Yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">You haven't placed any orders. Browse our delicious catalogue and treat yourself today!</p>
          <a 
            href="/shop"
            className="bg-[#3A1E14] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#2A140B] transition-colors inline-block shadow-sm"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="hidden md:grid grid-cols-12 gap-4 p-5 border-b border-gray-100 bg-[#FAF8F5] text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-5 pl-2">Order Summary</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-2 text-right pr-2">Action</div>
          </div>

          <div className="divide-y divide-gray-100">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              
              return (
                <div key={order.id} className="flex flex-col transition-colors hover:bg-gray-50/30">
                  {/* Main Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-center">
                    
                    <div className="md:col-span-5 flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#FAF8F5] rounded-xl shrink-0 overflow-hidden relative border border-[#EAE2DB]">
                        {getFirstImage(order.items) ? (
                          <Image src={getFirstImage(order.items)} alt="Product" fill className="object-cover" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">IMG</span>
                        )}
                      </div>
                      <div className="truncate pr-2 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[#3A1E14] text-sm truncate uppercase tracking-wide">#{order.id.slice(0,10)}</h4>
                          {/* Mobile status pill */}
                          <span className={`md:hidden inline-flex text-[9px] font-bold px-2 py-0.5 rounded-full ${getColorClasses(order.status)}`}>
                            {order.status || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs truncate leading-relaxed">
                          {getOrderSummaryText(order.items)}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:block md:col-span-2 text-sm text-gray-600 font-medium truncate pr-2">
                      {formatDate(order.createdAt)}
                    </div>

                    <div className="hidden md:block md:col-span-2">
                      <span className={`inline-flex text-[10px] font-bold px-3 py-1.5 rounded-full truncate ${getColorClasses(order.status)}`}>
                        {order.status || 'PENDING'}
                      </span>
                    </div>

                    <div className="hidden md:block md:col-span-1 font-bold text-[#3A1E14] text-sm truncate">
                      ₹{order.totalAmount}
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0">
                      <div className="md:hidden flex flex-col">
                        <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                        <span className="font-bold text-[#3A1E14] text-sm">₹{order.totalAmount}</span>
                      </div>
                      <button 
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className={`border text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${isExpanded ? 'bg-[#3A1E14] text-white border-[#3A1E14]' : 'bg-white border-[#EAE2DB] text-[#3A1E14] hover:border-[#C89F5F]'}`}
                      >
                        Details {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#FAF8F5] border-t border-[#EAE2DB]/50"
                      >
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                          
                          {/* Items List */}
                          <div>
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Items in Order</h5>
                            <div className="space-y-3">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#EAE2DB]/50 shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden relative shrink-0">
                                      {item.product?.images?.[0]?.url ? (
                                        <Image src={item.product.images[0].url} alt="Item" fill className="object-cover" />
                                      ) : null}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-[#3A1E14] line-clamp-1">{item.product?.name || "Product"}</p>
                                      <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <p className="text-sm font-bold text-[#5c2a1c]">₹{item.price * item.quantity}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Meta */}
                          <div className="space-y-6">
                            
                            <div className="bg-white p-4 rounded-xl border border-[#EAE2DB]/50 shadow-sm">
                              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin size={14}/> Delivery Address</h5>
                              {order.address ? (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  <span className="font-bold text-[#3A1E14]">{order.address.type}</span><br/>
                                  {order.address.address}<br/>
                                  {order.address.city}, {order.address.state} - {order.address.pinCode}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No address provided</p>
                              )}
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-[#EAE2DB]/50 shadow-sm">
                              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Summary</h5>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                  <span>Subtotal</span>
                                  <span className="font-medium text-[#3A1E14]">₹{order.totalAmount - (order.shippingAmount || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shipping</span>
                                  <span className="font-medium text-[#3A1E14]">{order.shippingAmount ? `₹${order.shippingAmount}` : 'FREE'}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
                                  <span className="font-bold text-[#3A1E14]">Total Paid (COD)</span>
                                  <span className="font-bold text-[#2E7D32]">₹{order.totalAmount}</span>
                                </div>
                              </div>
                            </div>
                            
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          
          {orders.length > 5 && (
            <div className="p-5 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-[#FAF8F5]">
              <span>Showing 1 to {Math.min(5, orders.length)} of {orders.length} orders</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-[#EAE2DB] rounded-md hover:bg-white disabled:opacity-50 transition-colors" disabled>Prev</button>
                <button className="px-3 py-1 border border-[#C89F5F] bg-white text-[#5c2a1c] font-bold rounded-md shadow-sm">1</button>
                <button className="px-3 py-1 border border-[#EAE2DB] rounded-md hover:bg-white disabled:opacity-50 transition-colors" disabled>Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
