"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Heart, ShoppingCart, ChevronDown, LayoutGrid, List, Check, Star, ChevronLeft, ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { label: "Cakes", count: 12, checked: true },
  { label: "Cookies", count: 15, checked: false },
  { label: "Pastries", count: 8, checked: false },
  { label: "Breads", count: 6, checked: false },
  { label: "Snacks", count: 9, checked: false },
  { label: "Gift Hampers", count: 8, checked: false },
];

const dietaryPrefs = [
  { label: "Eggless", count: 18, checked: false },
  { label: "Gluten Free", count: 6, checked: false },
  { label: "No Maida", count: 10, checked: false },
  { label: "Vegan", count: 5, checked: false },
];

const occasions = [
  { label: "Birthday", count: 11, checked: false },
  { label: "Anniversary", count: 7, checked: false },
  { label: "Wedding", count: 6, checked: false },
  { label: "Festive", count: 12, checked: false },
  { label: "Corporate", count: 8, checked: false },
];

const products = [
  { id: 1, name: "Chocolate Truffle Cake", rating: 5, reviews: 128, price: "1,199", image: "/images/hero-cake.png", badge: "Bestseller" },
  { id: 2, name: "Chocolate Cookies", rating: 4.5, reviews: 96, price: "200", image: "/images/pastries-new.png", badge: "Bestseller" },
  { id: 3, name: "Strawberry Pastry", rating: 4.5, reviews: 74, price: "249", image: "/images/hero-cake.png", badge: null },
  { id: 4, name: "Garlic Bread", rating: 4, reviews: 58, price: "150", image: "/images/pastries-new.png", badge: null },
  { id: 5, name: "Masala Mathri", rating: 4.5, reviews: 42, price: "180", image: "/images/pastries-new.png", badge: null },
  { id: 6, name: "Premium Gift Hamper", rating: 5, reviews: 31, price: "899", image: "/images/hampers.png", badge: "New" },
  { id: 7, name: "Red Velvet Cake", rating: 4.5, reviews: 85, price: "1,199", image: "/images/hero-cake.png", badge: "Bestseller" },
  { id: 8, name: "Whole Wheat Bread", rating: 4, reviews: 39, price: "120", image: "/images/hero-cake.png", badge: null },
];

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <main className="flex-grow flex flex-col bg-[#FAF8F5] text-foreground font-sans">
      <div className="max-w-[1260px] mx-auto px-4 md:px-8 py-8 w-full">
        
        {/* Breadcrumb */}
        <div className="text-[12px] text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#C89F5F] transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-[#C89F5F]">Shop</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ── LEFT SIDEBAR (FILTERS) ── */}
          <aside className="w-full lg:w-[260px] flex-shrink-0 bg-white rounded-2xl p-6 border border-[#F0EBE1] shadow-sm sticky top-28">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3A1E14] font-bold font-heading text-lg">Filter By</h3>
              <button className="text-[#C89F5F] text-xs font-medium hover:underline">Clear All</button>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h4 className="text-[#3A1E14] font-semibold text-sm">Categories</h4>
                <ChevronDown size={16} className="text-[#C89F5F]" />
              </div>
              <div className="space-y-3">
                {categories.map((cat) => (
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
            <div className="mb-8 border-t border-[#F0EBE1] pt-6">
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h4 className="text-[#3A1E14] font-semibold text-sm">Price Range</h4>
                <ChevronDown size={16} className="text-[#C89F5F]" />
              </div>
              {/* Custom Slider Track (Visual only) */}
              <div className="relative w-full h-1 bg-gray-200 rounded-full mb-4 mt-6">
                <div className="absolute top-0 left-0 h-full w-full bg-[#C89F5F] rounded-full"></div>
                {/* Thumb 1 */}
                <div className="absolute -top-2 left-0 w-4 h-4 bg-white border-2 border-[#3A1E14] rounded-full shadow-sm cursor-grab"></div>
                {/* Thumb 2 */}
                <div className="absolute -top-2 right-0 w-4 h-4 bg-white border-2 border-[#3A1E14] rounded-full shadow-sm cursor-grab"></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>₹0</span>
                <span>₹2,000+</span>
              </div>
            </div>

            {/* Dietary Preference */}
            <div className="mb-8 border-t border-[#F0EBE1] pt-6">
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h4 className="text-[#3A1E14] font-semibold text-sm">Dietary Preference</h4>
                <ChevronDown size={16} className="text-[#C89F5F]" />
              </div>
              <div className="space-y-3">
                {dietaryPrefs.map((pref) => (
                  <label key={pref.label} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded-[4px] border border-gray-300 group-hover:border-[#C89F5F] flex items-center justify-center transition-colors"></div>
                    <span className="text-[13px] text-gray-600">
                      {pref.label} <span className="text-gray-400">({pref.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Occasion */}
            <div className="border-t border-[#F0EBE1] pt-6">
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h4 className="text-[#3A1E14] font-semibold text-sm">Occasion</h4>
                <ChevronDown size={16} className="text-[#C89F5F]" />
              </div>
              <div className="space-y-3">
                {occasions.map((occ) => (
                  <label key={occ.label} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded-[4px] border border-gray-300 group-hover:border-[#C89F5F] flex items-center justify-center transition-colors"></div>
                    <span className="text-[13px] text-gray-600">
                      {occ.label} <span className="text-gray-400">({occ.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* ── RIGHT MAIN CONTENT ── */}
          <div className="flex-1 flex flex-col w-full">
            
            {/* Header / Title */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-[40px] font-heading font-bold text-[#3A1E14] mb-3 leading-tight">Shop All Products</h1>
              <p className="text-gray-600 text-[14px] md:text-[15px] max-w-xl leading-relaxed">
                Discover our wide range of freshly baked delights made with love and premium ingredients.
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <p className="text-[13px] text-gray-500 font-medium">
                Showing 1–8 of 48 products
              </p>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select className="appearance-none bg-white border border-[#EBE3D5] text-[#3A1E14] text-[13px] font-medium py-2 pl-4 pr-10 rounded-lg outline-none cursor-pointer shadow-sm hover:border-[#C89F5F] transition-colors">
                    <option>Sort by: Popularity</option>
                    <option>Sort by: Price (Low to High)</option>
                    <option>Sort by: Price (High to Low)</option>
                    <option>Sort by: Newest Arrivals</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                
                <div className="flex items-center bg-white border border-[#EBE3D5] rounded-lg p-1 shadow-sm">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${viewMode === 'grid' ? 'bg-[#FAF8F5] text-[#3A1E14]' : 'text-gray-500 hover:text-[#3A1E14]'}`}
                  >
                    <LayoutGrid size={14} /> Grid
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${viewMode === 'list' ? 'bg-[#FAF8F5] text-[#3A1E14]' : 'text-gray-500 hover:text-[#3A1E14]'}`}
                  >
                    <List size={14} /> List
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {products.map((p) => (
                <motion.div 
                  key={p.id}
                  className={`bg-white rounded-2xl border border-[#F0EBE1] overflow-hidden group hover:shadow-lg hover:border-[#C89F5F]/40 transition-all duration-300 flex flex-col ${viewMode === 'list' ? 'flex-row items-center sm:h-44' : ''}`}
                >
                  {/* Image */}
                  <div className={`relative bg-[#FAF8F5] overflow-hidden flex-shrink-0 ${viewMode === 'list' ? 'w-40 sm:w-48 h-full' : 'w-full aspect-[4/3]'}`}>
                    <Image 
                      src={p.image} 
                      alt={p.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-[#4A171E] hover:bg-white transition-all shadow-sm">
                      <Heart size={16} />
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className={`p-4 flex flex-col flex-1 h-full ${viewMode === 'list' ? 'justify-center p-6' : ''}`}>
                    <h4 className="text-[14px] font-bold text-[#3A1E14] mb-1.5 line-clamp-1">{p.name}</h4>
                    
                    {/* Ratings */}
                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} size={11} className={`${star <= Math.floor(p.rating) ? 'text-[#C89F5F] fill-[#C89F5F]' : 'text-gray-300 fill-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">({p.reviews})</span>
                    </div>

                    <div className="flex items-end justify-between mt-auto mb-4">
                      <p className="text-[17px] font-bold text-[#3A1E14]">₹{p.price}</p>
                      {p.badge && (
                        <span className="text-[10px] font-semibold bg-[#FAF8F5] text-[#8B5E34] px-2 py-0.5 rounded border border-[#F0EBE1]">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <button className={`w-full bg-[#4A171E] hover:bg-[#330F13] text-white font-medium tracking-wide text-[13px] py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${viewMode === 'list' ? 'w-auto px-6 mt-0 self-start' : ''}`}>
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-14 mb-8">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#F0EBE1] text-gray-400 hover:text-[#3A1E14] transition-colors shadow-sm">
                <ChevronLeft size={16} />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#4A171E] text-white font-medium text-[13px] shadow-sm">1</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] font-medium text-[13px] transition-colors shadow-sm">2</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] font-medium text-[13px] transition-colors shadow-sm">3</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] font-medium text-[13px] transition-colors shadow-sm">4</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#F0EBE1] text-[#3A1E14] hover:border-[#C89F5F] hover:text-[#C89F5F] transition-colors shadow-sm">
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
