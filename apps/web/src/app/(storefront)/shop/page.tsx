"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Heart, ShoppingCart, ChevronDown, ChevronUp, LayoutGrid, List, Check, Star, ChevronLeft, ChevronRight, X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL
  const initialCategoryParam = searchParams.get("category");
  const initialCategories = initialCategoryParam ? initialCategoryParam.split(",") : [];
  const initialSearch = searchParams.get("product") || "";

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const { addItem } = useCartStore();
  const itemsPerPage = 16;

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = new URL(`${apiUrl}/api/products`);
        url.searchParams.append("b2c", "true");
        // Fetch all products, filter locally for multi-category and search
        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setAllProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/categories?b2c=true`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []); // Only fetch once on mount

  // Sync state to URL params (shallow)
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }
    if (searchQuery) {
      params.set("product", searchQuery);
    }
    
    const newUrl = params.toString() ? `/shop?${params.toString()}` : '/shop';
    router.replace(newUrl, { scroll: false });
    
    // Reset to page 1 whenever filters change
    setCurrentPage(1);
  }, [selectedCategories, searchQuery, router]);

  // Derived state: Filtered & Sorted Products
  const processedProducts = useMemo(() => {
    let result = [...allProducts];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase().replace(/-/g, ' ');
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.slug && p.slug.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategories.length > 0 && selectedCategories[0] !== "") {
      result = result.filter(p => 
        p.categories && p.categories.some((c: any) => selectedCategories.includes(c.slug))
      );
    }

    // Price Filter
    if (minPrice !== "") {
      result = result.filter(p => (p.basePrice || p.price || 0) >= minPrice);
    }
    if (maxPrice !== "") {
      result = result.filter(p => (p.basePrice || p.price || 0) <= maxPrice);
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.basePrice || a.price) - (b.basePrice || b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.basePrice || b.price) - (a.basePrice || a.price));
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    // "popularity" keeps default order

    return result;
  }, [allProducts, searchQuery, selectedCategories, sortBy]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(processedProducts.length / itemsPerPage));
  const currentProducts = processedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) 
        ? prev.filter(c => c !== slug)
        : [...prev, slug]
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setSortBy("popularity");
    setMinPrice("");
    setMaxPrice("");
  };

  const generatePageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

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
          <aside className="w-full lg:w-[260px] flex-shrink-0 bg-white rounded-2xl p-6 border border-[#F0EBE1] shadow-sm lg:sticky lg:top-28">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3A1E14] font-bold font-heading text-lg">Filter By</h3>
              <button 
                onClick={handleClearAll}
                className="text-[#C89F5F] text-xs font-medium hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <h4 className="text-[#3A1E14] font-semibold text-sm">Categories</h4>
                {isCategoryOpen ? <ChevronUp size={16} className="text-[#C89F5F]" /> : <ChevronDown size={16} className="text-[#C89F5F]" />}
              </div>
              
              {isCategoryOpen && (
                <div className="space-y-3">
                  {categories.filter(c => Number(c.product_count) > 0).map((cat) => {
                    const isChecked = selectedCategories.includes(cat.slug);
                    return (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isChecked}
                          onChange={() => handleCategoryToggle(cat.slug)}
                        />
                        <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#4A171E] border-[#4A171E]' : 'border-gray-300 group-hover:border-[#C89F5F]'}`}>
                          {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-[13px] ${isChecked ? 'text-[#3A1E14] font-medium' : 'text-gray-600'}`}>
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="pt-6 border-t border-[#F0EBE1]">
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setIsPriceOpen(!isPriceOpen)}
              >
                <h4 className="text-[#3A1E14] font-semibold text-sm">Price Range</h4>
                {isPriceOpen ? <ChevronUp size={16} className="text-[#C89F5F]" /> : <ChevronDown size={16} className="text-[#C89F5F]" />}
              </div>
              
              {isPriceOpen && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                      <input 
                        type="number" 
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                        className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#C89F5F] transition-colors"
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                      <input 
                        type="number" 
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                        className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#C89F5F] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
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
              {searchQuery && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-500">Showing results for:</span>
                  <span className="bg-white border border-[#EBE3D5] text-[#3A1E14] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                </div>
              )}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <p className="text-[13px] text-gray-500 font-medium">
                Showing {currentProducts.length} of {processedProducts.length} products
              </p>
              
              <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white border border-[#EBE3D5] text-[#3A1E14] text-[13px] font-medium py-2 pl-4 pr-10 rounded-lg outline-none cursor-pointer shadow-sm hover:border-[#C89F5F] transition-colors"
                  >
                    <option value="popularity">Sort: Popularity</option>
                    <option value="price-asc">Sort: Price (Low to High)</option>
                    <option value="price-desc">Sort: Price (High to Low)</option>
                    <option value="newest">Sort: Newest</option>
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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C89F5F]"></div>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-[#F0EBE1]">
                <p>No products found matching your filters.</p>
                <button 
                  onClick={handleClearAll}
                  className="mt-4 text-[#C89F5F] font-medium text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {currentProducts.map((p) => (
                  <motion.div 
                    key={p.id}
                    className={`bg-white rounded-2xl border border-[#F0EBE1] overflow-hidden group hover:shadow-lg hover:border-[#C89F5F]/40 transition-all duration-300 flex flex-col ${viewMode === 'list' ? 'flex-row items-center sm:h-44' : ''}`}
                  >
                    {/* Image */}
                    <div className={`relative bg-[#FAF8F5] overflow-hidden flex-shrink-0 ${viewMode === 'list' ? 'w-40 sm:w-48 h-full' : 'w-full aspect-[4/3]'}`}>
                      <Image 
                        src={p.images?.[0]?.url || "/images/hero-cake.png"} 
                        alt={p.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-[#4A171E] hover:bg-white transition-all shadow-sm">
                        <Heart size={16} />
                      </button>
                    </div>
                    
                    {/* Content */}
                    <div className={`p-4 flex flex-col flex-1 h-full ${viewMode === 'list' ? 'justify-center p-6' : ''}`}>
                      {p.category && (
                        <span className="text-[#C89F5F] text-[10px] font-bold uppercase tracking-wider mb-1 block">
                          {p.category.name}
                        </span>
                      )}
                      <h4 className="text-[14px] font-bold text-[#3A1E14] mb-1.5 line-clamp-1">{p.name}</h4>
                      
                      {/* Ratings */}
                      <div className="flex items-center gap-1 mb-4">
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} size={11} className={`${star <= 5 ? 'text-[#C89F5F] fill-[#C89F5F]' : 'text-gray-300 fill-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">(New)</span>
                      </div>

                      <div className="flex items-end justify-between mt-auto mb-4">
                        <p className="text-[17px] font-bold text-[#3A1E14]">₹{p.basePrice || p.price}</p>
                      </div>

                      <button 
                        onClick={() => addItem({
                          id: p.id,
                          name: p.name,
                          price: p.basePrice || p.price,
                          quantity: 1,
                          image: p.images?.[0]?.url || "/images/hero-cake.png"
                        })}
                        className={`w-full bg-[#4A171E] hover:bg-[#330F13] text-white font-medium tracking-wide text-[13px] py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${viewMode === 'list' ? 'w-auto px-6 mt-0 self-start' : ''}`}
                      >
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14 mb-8">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#F0EBE1] text-gray-400 hover:text-[#3A1E14] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {generatePageNumbers().map(pageNum => (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium text-[13px] shadow-sm transition-colors ${
                      currentPage === pageNum 
                        ? 'bg-[#4A171E] text-white' 
                        : 'bg-white border border-[#F0EBE1] text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#F0EBE1] text-[#3A1E14] hover:border-[#C89F5F] hover:text-[#C89F5F] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-40 min-h-screen bg-[#FAF8F5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C89F5F]"></div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
