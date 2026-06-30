"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";

import { useState, useEffect } from "react";

export default function CartDrawer() {
  const { items, isDrawerOpen, setDrawerOpen, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-white z-[100] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#3A1E14]" />
                <span className="font-heading font-bold text-[#3A1E14] text-lg">Your Cart</span>
                <span className="bg-[#C89F5F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-[#3A1E14] transition-colors bg-white rounded-full shadow-sm"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-gray-500">
                  <ShoppingBag size={48} className="text-gray-200" />
                  <p className="text-sm">Your cart is empty.</p>
                  <Link 
                    href="/shop"
                    onClick={() => setDrawerOpen(false)}
                    className="mt-2 text-[#C89F5F] font-medium text-sm hover:underline"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 relative flex items-center justify-center">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          sizes="80px"
                          className="object-cover" 
                        />
                      ) : (
                        <span className="text-gray-400 text-xs text-center px-2">Image<br/>Placeholder</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-[#3A1E14] text-sm leading-tight">{item.name}</h4>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-3 border border-gray-200 rounded-full px-2 py-1 bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-gray-500 hover:text-[#3A1E14] transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-[#3A1E14] transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-bold text-[#2E7D32] text-sm">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 font-medium text-sm">Subtotal</span>
                  <span className="font-bold text-xl text-[#3A1E14]">₹{totalAmount}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <Link 
                    href="/checkout"
                    onClick={() => setDrawerOpen(false)}
                    className="w-full bg-[#3A1E14] text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#2A140B] transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link 
                    href="/cart"
                    onClick={() => setDrawerOpen(false)}
                    className="w-full bg-white border border-[#EAE2DB] text-[#3A1E14] py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:border-[#C89F5F] hover:text-[#C89F5F] transition-colors"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
