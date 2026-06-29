"use client";

import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="bg-[#FAF8F5] min-h-[80vh] flex flex-col items-center justify-center p-8">
      <div className="bg-white max-w-lg w-full rounded-3xl p-10 text-center shadow-xl border border-[#F0EBE1] relative overflow-hidden">
        
        {/* Confetti decoration top */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#C89F5F] via-[#E5C38B] to-[#C89F5F]"></div>

        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-inner">
          <CheckCircle size={48} />
        </div>

        <h1 className="font-heading text-3xl font-bold text-[#3A1E14] mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Thank you for choosing Hasty Tasty! Your order has been successfully placed and is being processed. 
          We'll notify you as soon as it's out for delivery.
        </p>

        {orderId && (
          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#EBE3D5] mb-8 inline-block">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Order ID</span>
            <span className="font-mono font-bold text-lg text-[#5c2a1c]">{orderId}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <Link 
            href="/account/orders" 
            className="flex items-center justify-center gap-2 border-2 border-[#EBE3D5] text-[#3A1E14] font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag size={18} /> View Order
          </Link>
          <Link 
            href="/shop" 
            className="flex items-center justify-center gap-2 bg-[#3A1E14] text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-[#2A140B] transition-all"
          >
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center bg-[#FAF8F5]"><div className="animate-spin w-10 h-10 border-4 border-[#C89F5F] border-t-transparent rounded-full"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
