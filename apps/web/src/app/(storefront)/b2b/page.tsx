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
import { useEffect } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function B2BPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [enquiryCart, setEnquiryCart] = useState<{product: any, qty: number}[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showModal = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setModalConfig({ isOpen: true, title, message, type });
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  // Load cart from local storage
  useEffect(() => {
    const saved = localStorage.getItem('b2bCart');
    if (saved) {
      try {
        setEnquiryCart(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('b2bCart', JSON.stringify(enquiryCart));
  }, [enquiryCart]);

  const addToEnquiry = (product: any) => {
    setEnquiryCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromEnquiry = (productId: string) => {
    setEnquiryCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateEnquiryQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromEnquiry(productId);
      return;
    }
    setEnquiryCart(prev => prev.map(item => item.product.id === productId ? { ...item, qty: newQty } : item));
  };

  const enquirySubtotal = enquiryCart.reduce((total, item) => total + (item.product.b2bPrice || item.product.basePrice) * item.qty, 0);
  const retailSubtotal = enquiryCart.reduce((total, item) => total + (item.product.basePrice) * item.qty, 0);
  const savings = retailSubtotal - enquirySubtotal;

  useEffect(() => {
    const fetchB2BData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products?b2b=true`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
        
        const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/categories?b2b=true`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      } catch (error) {
        console.error("Failed to fetch B2B data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchB2BData();
  }, []);

  // Filter & Sort Logic
  const processedProducts = products.filter(p => {
    if (selectedCategories.length > 0) {
      if (!p.categories || !p.categories.some((c: any) => selectedCategories.includes(c.slug))) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return (a.b2bPrice || a.basePrice) - (b.b2bPrice || b.basePrice);
    if (sortBy === "price-desc") return (b.b2bPrice || b.basePrice) - (a.b2bPrice || a.basePrice);
    if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return 0; // popularity
  });

  const totalPages = Math.max(1, Math.ceil(processedProducts.length / itemsPerPage));
  const currentProducts = processedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleCategory = (catSlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(catSlug) ? prev.filter(slug => slug !== catSlug) : [...prev, catSlug]
    );
    setCurrentPage(1);
  };

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
                <Link href="/signup?b2b=true" className="w-full bg-[#E8BA6E] hover:bg-[#D5A75B] text-[#3A1E14] font-semibold text-sm py-3.5 px-6 rounded-lg flex items-center justify-between transition-colors">
                  <span>Register Now</span>
                  <ArrowRight size={16} />
                </Link>
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
                <button onClick={() => {setSelectedCategories([]); setCurrentPage(1);}} className="text-[#C89F5F] text-xs font-medium hover:underline">Clear All</button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 cursor-pointer">
                  <h4 className="text-[#3A1E14] font-semibold text-sm">Categories</h4>
                  <ChevronDown size={16} className="text-[#C89F5F]" />
                </div>
                <div className="space-y-3">
                  {categories.filter(c => Number(c.product_count) > 0).map((cat) => {
                    const isChecked = selectedCategories.includes(cat.slug);
                    return (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.slug)}
                        />
                        <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#4A171E] border-[#4A171E]' : 'border-gray-300 group-hover:border-[#C89F5F]'}`}>
                          {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-[13px] ${isChecked ? 'text-[#3A1E14] font-medium' : 'text-gray-600'}`}>
                          {cat.name} <span className="text-gray-400">({cat.product_count || 0})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </aside>

            {/* ── MIDDLE AREA (PRODUCTS) ── */}
            <div className="flex-1 min-w-0">
              
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl px-5 py-3 border border-[#F0EBE1] shadow-sm mb-6 gap-4">
                <p className="text-[13px] text-gray-600 font-medium">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, processedProducts.length)} of {processedProducts.length} products
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-500">Sort by:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-[13px] text-[#3A1E14] font-medium bg-transparent outline-none border border-gray-200 rounded-md px-2 py-1 cursor-pointer hover:border-[#C89F5F] transition-colors"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                    </select>
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
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C89F5F]"></div>
                </div>
              ) : processedProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p>No B2B products found matching your criteria.</p>
                </div>
              ) : (
                <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {currentProducts.map((p) => (
                    <motion.div 
                      key={p.id}
                      className={`bg-white rounded-2xl border border-[#F0EBE1] overflow-hidden group hover:shadow-lg hover:border-[#C89F5F]/40 transition-all duration-300 ${viewMode === 'list' ? 'flex items-center' : 'flex flex-col'}`}
                    >
                      {/* Image */}
                      <div className={`relative bg-[#FAF8F5] overflow-hidden ${viewMode === 'list' ? 'w-32 h-full min-h-[100px]' : 'w-full aspect-[16/9]'}`}>
                        <Image 
                          src={p.images?.[0]?.url || "/images/hero-cake.png"} 
                          alt={p.name} 
                          fill 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {/* Content */}
                      <div className={`p-3 ${viewMode === 'list' ? 'flex-1 flex flex-row items-center justify-between' : 'flex flex-col flex-1'}`}>
                        <div className={viewMode === 'list' ? 'flex-1' : ''}>
                          <h4 className="text-[13px] font-bold text-[#3A1E14] mb-1">{p.name}</h4>
                          <p className="text-[11px] text-gray-500 mb-3">{p.categories?.[0]?.name || p.category?.name || 'Category'}</p>
                        </div>

                        <div className={`flex items-end justify-between mb-3 ${viewMode === 'list' ? 'flex-col items-end gap-1 mb-0 mx-4' : ''}`}>
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">Retail Price</p>
                            <p className="text-[13px] font-semibold text-gray-500 line-through">₹{p.basePrice || p.retail}</p>
                          </div>
                          <div className={`text-right ${viewMode === 'list' ? 'text-right' : ''}`}>
                            <p className="text-[10px] text-[#2E7D32] font-semibold mb-0.5">Wholesale Price</p>
                            <p className="text-base font-bold text-[#2E7D32]">₹{p.b2bPrice || p.wholesale || p.basePrice}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => addToEnquiry(p)}
                          className={`w-full bg-white hover:bg-[#FAF8F5] border border-[#C89F5F] text-[#3A1E14] font-semibold text-[12px] py-2 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95 ${viewMode === 'list' ? 'w-auto px-4' : 'mt-auto'}`}
                        >
                          <ShoppingCart size={14} className="text-[#C89F5F]" /> Add to Enquiry
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] transition-colors disabled:opacity-50"
                  >
                    <ArrowRight size={14} className="rotate-180" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button 
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded transition-colors text-[13px] font-medium ${currentPage === page ? 'bg-[#4A171E] text-white shadow-sm' : 'bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F]'}`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] transition-colors disabled:opacity-50"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

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
                  <span className="bg-[#F4E6D4] text-[#8B5E34] text-[10px] font-bold px-2 py-1 rounded-md">{enquiryCart.reduce((sum, i) => sum + i.qty, 0)} Items</span>
                </div>

                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {enquiryCart.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Your enquiry cart is empty.</p>
                  ) : (
                    enquiryCart.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-start border-b border-gray-200/60 pb-4">
                        <div>
                          <h4 className="text-[12px] font-bold text-[#3A1E14] leading-tight mb-1">{item.product.name}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-gray-500">
                            <span>{item.product.categories?.[0]?.name || 'Category'}</span>
                            <div className="flex items-center border border-gray-200 rounded">
                              <button onClick={() => updateEnquiryQty(item.product.id, item.qty - 1)} className="px-1.5 py-0.5 hover:bg-gray-100 text-gray-600">-</button>
                              <input 
                                type="number" 
                                value={item.qty} 
                                onChange={(e) => updateEnquiryQty(item.product.id, parseInt(e.target.value) || 1)}
                                className="w-8 text-center text-[11px] py-0.5 outline-none border-x border-gray-200 bg-transparent"
                              />
                              <button onClick={() => updateEnquiryQty(item.product.id, item.qty + 1)} className="px-1.5 py-0.5 hover:bg-gray-100 text-gray-600">+</button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-[#3A1E14]">₹{(item.product.b2bPrice || item.product.basePrice) * item.qty}</span>
                          <button 
                            onClick={() => removeFromEnquiry(item.product.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-0.5 border border-gray-200"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal */}
                <div className="border-t border-gray-200/80 pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-gray-600">Subtotal</span>
                    <span className="text-base font-bold text-[#3A1E14]">₹{enquirySubtotal}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-[#2E7D32]">You Save <span className="font-normal opacity-80">(Retail vs Wholesale)</span></span>
                      <span className="text-[13px] font-bold text-[#2E7D32]">₹{savings}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button 
                  disabled={isSubmittingEnquiry}
                  onClick={async () => {
                    if (enquiryCart.length === 0) {
                      showModal("Empty Cart", "Please add items to your enquiry first!", "error");
                      return;
                    }
                    
                    setIsSubmittingEnquiry(true);
                    try {
                      // Fetch user
                      const { createClient } = await import('@/utils/supabase/client');
                      const supabase = createClient();
                      const { data: { user } } = await supabase.auth.getUser();
                      
                      if (!user) {
                        showModal("Authentication Required", "Please log in to submit a B2B enquiry.", "error");
                        setIsSubmittingEnquiry(false);
                        return;
                      }

                      // Call API
                      const items = enquiryCart.map(i => ({
                        productId: i.product.id,
                        quantity: i.qty
                      }));
                      
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/enquiries`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          notes: 'Submitted from B2B Portal',
                          items
                        })
                      });
                      
                      if (res.ok) {
                        setEnquiryCart([]);
                        localStorage.removeItem('b2bCart');
                        showModal("Enquiry Submitted", "Your B2B enquiry has been submitted successfully! Our team will get in touch with you shortly.", "success");
                      } else {
                        showModal("Error", "Failed to submit enquiry. Please try again.", "error");
                      }
                    } catch (error) {
                      console.error(error);
                      showModal("Error", "An unexpected error occurred.", "error");
                    } finally {
                      setIsSubmittingEnquiry(false);
                    }
                  }}
                  className="w-full bg-[#4A171E] hover:bg-[#330F13] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-[13px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors mb-4 shadow-md"
                >
                  {isSubmittingEnquiry ? 'Submitting...' : 'Submit Enquiry'} <ArrowRight size={14} />
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 max-w-[400px] w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-[#3A1E14] mb-3">Enquiry Submitted!</h3>
            <p className="text-gray-600 text-[14px] leading-relaxed mb-8">
              Thank you for your enquiry. Our team will review your request and get in touch with you within 24 hours.
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#C89F5F] hover:bg-[#b08b53] text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className={`text-lg font-bold mb-2 ${
                modalConfig.type === 'error' ? 'text-red-600' :
                'text-green-600'
              }`}>
                {modalConfig.title}
              </h3>
              <p className="text-gray-600 text-[14px]">
                {modalConfig.message}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
