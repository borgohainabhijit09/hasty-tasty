"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Search, ShoppingCart, MapPin, HelpCircle, Package, Truck, ShieldCheck, Heart, Headphones,
  Menu, X, Shield, Award, Clock, ChevronDown, LayoutGrid, List, XCircle, Check, Circle, CheckSquare, Square, CheckCircle, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const products = [
  { id: 1, name: "Chocolate Truffle Cake", size: "500g • Serves 4-6", retail: 1199, wholesale: 899, image: "/images/hero-cake.png" },
  { id: 2, name: "Chocolate Cookies", size: "Pack of 10", retail: 200, wholesale: 150, image: "/images/pastries-new.png" },
  { id: 3, name: "Strawberry Pastry", size: "Pack of 2", retail: 249, wholesale: 179, image: "/images/hero-cake.png" },
  { id: 4, name: "Premium Gift Hamper", size: "Small", retail: 899, wholesale: 649, image: "/images/hampers.png" },
  { id: 5, name: "Whole Wheat Bread", size: "400g", retail: 120, wholesale: 85, image: "/images/hero-cake.png" },
  { id: 6, name: "Masala Mathri", size: "200g", retail: 180, wholesale: 130, image: "/images/pastries-new.png" },
  { id: 7, name: "Red Velvet Cake", size: "500g • Serves 4-6", retail: 1199, wholesale: 880, image: "/images/hero-cake.png" },
  { id: 8, name: "Assorted Pastries Box", size: "Box of 6", retail: 450, wholesale: 325, image: "/images/hampers.png" },
];

const cartItems = [
  { id: 1, name: "Chocolate Truffle Cake", size: "500g", qty: 2, price: 1798 },
  { id: 2, name: "Chocolate Cookies", size: "Pack of 10", qty: 3, price: 450 },
  { id: 4, name: "Premium Gift Hamper", size: "Small", qty: 1, price: 649 },
];

export default function B2BPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <main className="flex-grow flex flex-col bg-[#FAF8F5] text-foreground font-sans">
      {/* ── B2B HERO SECTION ── */}
      <section className="pt-10 pb-6 bg-[#FAF8F5]">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          <div 
            className="relative w-full rounded-[30px] overflow-hidden flex flex-col lg:flex-row items-center justify-between min-h-[340px] bg-cover bg-center bg-no-repeat shadow-sm border border-[#F0EBE1]"
            style={{ backgroundImage: "url('/images/b2b-hero-bg.png')" }}
          >
            {/* Left Content Area */}
            <div className="relative z-10 w-full lg:w-1/2 p-8 md:p-12 lg:py-10 flex flex-col justify-center">
              <p className="text-[#C89F5F] tracking-[0.15em] text-[11px] font-bold uppercase mb-3">
                B2B Wholesale
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-[44px] font-heading font-bold leading-[1.1] mb-4">
                <span className="text-[#3A1E14] block mb-1">Stronger Relationships.</span>
                <span className="text-[#C89F5F] block">Better Business.</span>
              </h1>
              <p className="text-gray-600 text-[13px] md:text-[14px] leading-relaxed max-w-[420px] mb-8">
                Join hands with Hasty Tasty for premium quality bakery products at exclusive wholesale prices.
              </p>
              {/* Features row */}
              <div className="flex flex-wrap items-center gap-8 md:gap-10">
                <div className="flex items-center gap-3">
                  <div className="text-[#C89F5F]"><Shield size={24} strokeWidth={1.5} /></div>
                  <p className="text-[12px] md:text-[13px] font-bold text-[#3A1E14] leading-snug">
                    Exclusive<br/><span className="font-medium text-gray-500">B2B Pricing</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[#C89F5F]"><Award size={24} strokeWidth={1.5} /></div>
                  <p className="text-[12px] md:text-[13px] font-bold text-[#3A1E14] leading-snug">
                    Consistent<br/><span className="font-medium text-gray-500">Quality</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[#C89F5F]"><Clock size={24} strokeWidth={1.5} /></div>
                  <p className="text-[12px] md:text-[13px] font-bold text-[#3A1E14] leading-snug">
                    Timely<br/><span className="font-medium text-gray-500">Delivery</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content Area (Card) */}
            <div className="relative z-10 w-full lg:w-auto p-8 md:p-12 lg:py-10 flex justify-end">
              <div className="bg-[#3A1612] rounded-2xl p-7 w-full max-w-[340px] shadow-2xl flex flex-col gap-5 border border-white/10">
                <h3 className="text-white font-heading text-2xl font-semibold">Not a B2B Member?</h3>
                <p className="text-white/80 text-[13px] leading-relaxed mb-2">
                  Register your business to access our exclusive wholesale pricing.
                </p>
                <button className="w-full bg-[#E8BA6E] hover:bg-[#D5A75B] text-[#3A1E14] font-semibold text-sm py-3.5 px-6 rounded-lg flex items-center justify-between transition-colors">
                  <span>Register Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP LAYOUT ── */}
      <section className="pb-20 bg-[#FAF8F5]">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* ── LEFT SIDEBAR (FILTERS) ── */}
            <aside className="w-full lg:w-[260px] flex-shrink-0 bg-white rounded-2xl p-6 border border-[#F0EBE1] shadow-sm sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#3A1E14] font-bold font-heading text-lg">Filters</h3>
                <button className="text-[#C89F5F] text-xs font-medium hover:underline">Clear All</button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 cursor-pointer">
                  <h4 className="text-[#3A1E14] font-semibold text-sm">Categories</h4>
                  <ChevronDown size={16} className="text-[#C89F5F]" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "All Products", count: 48, checked: true },
                    { label: "Cakes", count: 12, checked: false },
                    { label: "Cookies", count: 15, checked: false },
                    { label: "Pastries", count: 8, checked: false },
                    { label: "Breads", count: 6, checked: false },
                    { label: "Snacks", count: 9, checked: false },
                    { label: "Gift Hampers", count: 8, checked: false },
                  ].map((cat) => (
                    <label key={cat.label} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${cat.checked ? 'bg-[#4A171E] border-[#4A171E]' : 'border-gray-300 group-hover:border-[#C89F5F]'}`}>
                        {cat.checked && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-[13px] ${cat.checked ? 'text-[#3A1E14] font-medium' : 'text-gray-600'}`}>
                        {cat.label} <span className="text-gray-400">({cat.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-6 cursor-pointer">
                  <h4 className="text-[#3A1E14] font-semibold text-sm">Price Range</h4>
                  <ChevronDown size={16} className="text-[#C89F5F]" />
                </div>
                <div className="relative w-full h-1 bg-gray-200 rounded-full mb-4">
                  <div className="absolute left-0 right-[30%] h-full bg-[#D5A75B] rounded-full"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#3A1E14] rounded-full cursor-grab"></div>
                  <div className="absolute right-[30%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#3A1E14] rounded-full cursor-grab translate-x-1/2"></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>₹0</span>
                  <span>₹5,000+</span>
                </div>
              </div>

              {/* Dietary Preference */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4 cursor-pointer">
                  <h4 className="text-[#3A1E14] font-semibold text-sm">Dietary Preference</h4>
                  <ChevronDown size={16} className="text-[#C89F5F]" />
                </div>
                <div className="space-y-3">
                  {["Eggless", "Gluten Free", "No Maida", "Vegan"].map((diet) => (
                    <label key={diet} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 rounded-[4px] border border-gray-300 group-hover:border-[#C89F5F] flex items-center justify-center transition-colors"></div>
                      <span className="text-[13px] text-gray-600">{diet}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* ── MIDDLE AREA (PRODUCTS) ── */}
            <div className="flex-1 min-w-0">
              
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl px-5 py-3 border border-[#F0EBE1] shadow-sm mb-6 gap-4">
                <p className="text-[13px] text-gray-600 font-medium">Showing 1–12 of 48 products</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-500">Sort by:</span>
                    <button className="text-[13px] text-[#3A1E14] font-medium flex items-center gap-1 border border-gray-200 rounded-md px-3 py-1.5 hover:border-[#C89F5F] transition-colors">
                      Popularity <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-md p-1 border border-gray-100">
                    <button 
                      onClick={() => setViewMode("grid")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#3A1E14]' : 'text-gray-500 hover:text-[#3A1E14]'}`}
                    >
                      <LayoutGrid size={14} /> Grid
                    </button>
                    <button 
                      onClick={() => setViewMode("list")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#3A1E14]' : 'text-gray-500 hover:text-[#3A1E14]'}`}
                    >
                      <List size={14} /> List
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((p) => (
                  <motion.div 
                    key={p.id}
                    className={`bg-white rounded-2xl border border-[#F0EBE1] overflow-hidden group hover:shadow-lg hover:border-[#C89F5F]/40 transition-all duration-300 ${viewMode === 'list' ? 'flex items-center' : 'flex flex-col'}`}
                  >
                    {/* Image */}
                    <div className={`relative bg-[#FAF8F5] overflow-hidden ${viewMode === 'list' ? 'w-32 h-full min-h-[100px]' : 'w-full aspect-[16/9]'}`}>
                      <Image 
                        src={p.image} 
                        alt={p.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {/* Content */}
                    <div className={`p-3 ${viewMode === 'list' ? 'flex-1 flex flex-row items-center justify-between' : 'flex flex-col flex-1'}`}>
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h4 className="text-[13px] font-bold text-[#3A1E14] mb-1">{p.name}</h4>
                        <p className="text-[11px] text-gray-500 mb-3">{p.size}</p>
                      </div>

                      <div className={`flex items-end justify-between mb-3 ${viewMode === 'list' ? 'flex-col items-end gap-1 mb-0 mx-4' : ''}`}>
                        <div>
                          <p className="text-[10px] text-gray-400 mb-0.5">Retail Price</p>
                          <p className="text-[13px] font-semibold text-gray-500 line-through">₹{p.retail}</p>
                        </div>
                        <div className={`text-right ${viewMode === 'list' ? 'text-right' : ''}`}>
                          <p className="text-[10px] text-[#2E7D32] font-semibold mb-0.5">Wholesale Price</p>
                          <p className="text-base font-bold text-[#2E7D32]">₹{p.wholesale}</p>
                        </div>
                      </div>

                      <button className={`w-full bg-white hover:bg-[#FAF8F5] border border-[#C89F5F] text-[#3A1E14] font-semibold text-[12px] py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${viewMode === 'list' ? 'w-auto px-4' : 'mt-auto'}`}>
                        <ShoppingCart size={14} className="text-[#C89F5F]" /> Add to Enquiry
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-10">
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-[#F0EBE1] text-gray-400 hover:text-[#3A1E14] transition-colors">
                  <ArrowRight size={14} className="rotate-180" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-[#4A171E] text-white font-medium text-[13px] shadow-sm">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] font-medium text-[13px] transition-colors">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] font-medium text-[13px] transition-colors">3</button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] font-medium text-[13px] transition-colors">4</button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-[#F0EBE1] text-[#3A1E14] hover:border-[#C89F5F] transition-colors">
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Trust Banner (Bottom) */}
              <div className="mt-12 bg-[#FAF8F5] rounded-xl border border-[#EBE3D5] p-5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <Package size={24} className="text-[#C89F5F]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[12px] font-bold text-[#3A1E14]">Minimum Order Value</p>
                    <p className="text-[12px] text-gray-600">₹3,000</p>
                  </div>
                </div>
                <div className="hidden lg:block w-px h-8 bg-[#EBE3D5]"></div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <Truck size={24} className="text-[#C89F5F]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[12px] font-bold text-[#3A1E14]">Pan India Delivery</p>
                    <p className="text-[12px] text-gray-600">On time, every time</p>
                  </div>
                </div>
                <div className="hidden lg:block w-px h-8 bg-[#EBE3D5]"></div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <ShieldCheck size={24} className="text-[#C89F5F]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[12px] font-bold text-[#3A1E14]">Custom Branding</p>
                    <p className="text-[12px] text-gray-600">For corporate orders</p>
                  </div>
                </div>
                <div className="hidden lg:block w-px h-8 bg-[#EBE3D5]"></div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <Headphones size={24} className="text-[#C89F5F]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[12px] font-bold text-[#3A1E14]">Dedicated Account Manager</p>
                    <p className="text-[12px] text-gray-600">For your support</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT SIDEBAR (ENQUIRY) ── */}
            <aside className="w-full lg:w-[280px] xl:w-[290px] flex-shrink-0 flex flex-col gap-6 sticky top-28">
              
              {/* Enquiry Summary Card */}
              <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#F0EBE1] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#3A1E14] font-bold font-heading text-lg">Enquiry Summary</h3>
                  <span className="bg-[#F4E6D4] text-[#8B5E34] text-[10px] font-bold px-2 py-1 rounded-md">6 Items</span>
                </div>

                {/* Items List */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start border-b border-gray-200/60 pb-4 last:border-0 last:pb-0">
                      <div>
                        <h4 className="text-[12px] font-bold text-[#3A1E14] leading-tight mb-1">{item.name}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          <span>{item.size}</span>
                          <span>Qty: {item.qty}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#3A1E14]">₹{item.price.toLocaleString()}</span>
                        <button className="text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-0.5 border border-gray-200">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="border-t border-gray-200/80 pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-gray-600">Subtotal</span>
                    <span className="text-base font-bold text-[#3A1E14]">₹2,897</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-[#2E7D32]">You Save <span className="font-normal opacity-80">(Retail vs Wholesale)</span></span>
                    <span className="text-[13px] font-bold text-[#2E7D32]">₹948</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button className="w-full bg-[#4A171E] hover:bg-[#330F13] text-white font-semibold text-[13px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors mb-4 shadow-md">
                  Submit Enquiry <ArrowRight size={14} />
                </button>

                <div className="text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[#8B5E34] text-[11px] font-semibold mb-1">
                    <Lock size={12} /> Secure &amp; Confidential
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Our team will get in touch with you<br/>within 24 hours.
                  </p>
                </div>
              </div>

              {/* Why Partner With Us Card */}
              <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#F0EBE1] shadow-sm">
                <h3 className="text-[#3A1E14] font-bold font-heading text-lg mb-4">Why Partner With Us?</h3>
                <ul className="space-y-3">
                  {[
                    "Best wholesale prices",
                    "Premium quality assurance",
                    "Flexible order volumes",
                    "Dedicated support"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-[#C89F5F]" strokeWidth={2} />
                      <span className="text-[13px] text-gray-700 font-medium">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </aside>

          </div>
        </div>
      </section>

    </main>
  );
}
