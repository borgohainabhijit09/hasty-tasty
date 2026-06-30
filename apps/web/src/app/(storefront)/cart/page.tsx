"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // Dummy 5% tax
  const total = subtotal + tax;

  if (!mounted) {
    return (
      <div className="max-w-[1260px] mx-auto px-8 py-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <p className="text-gray-400">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1260px] mx-auto px-8 py-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h1 className="font-heading text-4xl font-bold text-[#3A1E14] mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any premium baked goods to your cart yet. Let's change that!</p>
        <Link 
          href="/shop"
          className="bg-[#3A1E14] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#2A140B] transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <h1 className="font-heading text-2xl font-bold text-[#3A1E14] mb-6">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="lg:w-[65%]">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="col-span-1 md:col-span-6 flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100 relative overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt="product" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-400 text-[10px]">IMG</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3A1E14] text-sm md:text-base">{item.name}</h3>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 text-xs flex items-center gap-1 mt-1 hover:underline"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center">
                  <span className="md:hidden text-gray-500 text-sm">Price:</span>
                  <span className="font-medium text-gray-600 text-sm">₹{item.price}</span>
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center">
                  <span className="md:hidden text-gray-500 text-sm">Quantity:</span>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1 bg-white">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="text-gray-500 hover:text-[#3A1E14] transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-500 hover:text-[#3A1E14] transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center">
                  <span className="md:hidden text-gray-500 text-sm">Total:</span>
                  <span className="font-bold text-[#2E7D32] text-sm md:text-base">₹{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-[35%]">
          <div className="bg-[#FAF8F5] rounded-xl p-5 border border-[#EAE2DB] sticky top-24">
            <h2 className="font-heading font-bold text-lg text-[#3A1E14] mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-[#3A1E14]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax (5%)</span>
                <span className="font-medium text-[#3A1E14]">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-xs text-gray-400 mt-0.5">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-[#EAE2DB] pt-3 mb-6 flex justify-between items-end">
              <span className="font-bold text-[#3A1E14] text-sm">Total</span>
              <span className="font-bold text-[#3A1E14] text-xl">₹{total.toFixed(2)}</span>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-[#3A1E14] text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#2A140B] transition-colors shadow-sm"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <div className="mt-3 text-center">
              <Link href="/shop" className="text-[#C89F5F] text-xs font-bold hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
