"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, MapPin, HelpCircle, Package, Truck, ShieldCheck, Heart, Menu, X, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { logout } from "@/app/(storefront)/login/actions";
import { useCartStore } from "@/store/useCartStore";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const { toggleDrawer, items: cartItems } = useCartStore();

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user?.email) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        fetch(`${apiUrl}/api/users/me?email=${encodeURIComponent(user.email)}`)
          .then(res => res.json())
          .then(data => setUserRole(data.role))
          .catch(err => console.error("Error fetching role:", err));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        fetch(`${apiUrl}/api/users/me?email=${encodeURIComponent(session.user.email)}`)
          .then(res => res.json())
          .then(data => setUserRole(data.role))
          .catch(err => console.error("Error fetching role:", err));
      } else {
        setUserRole(null);
      }
    });

    // Fetch categories dynamically
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    fetch(`${apiUrl}/api/categories?b2c=true`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));

    return () => subscription.unsubscribe();
  }, []);

  // Search effect
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/products?search=${encodeURIComponent(searchQuery)}&b2c=true`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#3A1E14] text-[#EAE2DB] py-2 text-xs hidden md:block">
        <div className="max-w-[1260px] mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-[#C89F5F]" /> <span>Freshly Baked</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#C89F5F]" /> <span>Premium Ingredients</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-[#C89F5F]" /> <span>Hygienically Prepared</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/account/orders" className="flex items-center gap-2 hover:text-white transition-colors">
              <Truck size={14} className="text-[#C89F5F]" /> <span>Track Order</span>
            </Link>
            <Link href="/contact" className="flex items-center gap-2 hover:text-white transition-colors">
              <HelpCircle size={14} className="text-[#C89F5F]" /> <span>Help Center</span>
            </Link>
            <a 
              href="https://maps.app.goo.gl/71xybeyPSXtLXZ4N8" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <MapPin size={14} className="text-[#C89F5F]" /> <span>Store Locator</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="relative w-28 h-10 sm:w-36 sm:h-14 md:w-44 md:h-16 block">
              <Image
                src="/images/logo.png"
                alt="Hasty Tasty Logo"
                fill
                sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
                className="object-contain object-left"
                priority
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide text-gray-700">
            <Link href="/" className="hover:text-[#C89F5F] transition-colors">
              Home
            </Link>

            <Link href="/shop" className="hover:text-[#C89F5F] transition-colors">
              Shop
            </Link>

            {/* Categories Mega Menu */}
            <div className="group relative py-4">
              <button className="hover:text-[#C89F5F] transition-colors flex items-center gap-1 cursor-pointer font-medium">
                Categories <span className="text-[10px] opacity-60 group-hover:rotate-180 transition-transform">▼</span>
              </button>
              
              <div className="absolute top-full -left-12 w-[500px] lg:w-[600px] bg-white shadow-2xl rounded-xl border border-gray-100 p-6 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                {/* Hover bridge */}
                <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />
                
                <div className="mb-4 pb-3 border-b border-gray-100 flex justify-between items-end">
                  <div>
                    <h3 className="text-[#3A1E14] font-heading font-bold text-lg">Shop by Category</h3>
                    <p className="text-gray-500 text-xs mt-1">Explore our wide range of premium baked goods</p>
                  </div>
                </div>

                <ul className="grid grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <li key={cat.id}>
                        <Link href={`/shop?category=${cat.slug}`} className="text-gray-700 hover:text-[#C89F5F] hover:bg-[#FAF8F5] p-2 rounded-lg text-sm transition-all flex items-center gap-3 group/link border border-transparent hover:border-[#EAE2DB]">
                          <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#EAE2DB] group-hover/link:border-[#C89F5F]/50 group-hover/link:bg-white transition-colors shrink-0">
                            <span className="text-[#C89F5F] text-xs font-bold font-heading">
                              {cat.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium truncate">{cat.name}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-sm col-span-full py-4 text-center">Loading categories...</li>
                  )}
                </ul>

                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-center">
                  <Link href="/shop" className="text-[#C89F5F] text-sm font-bold hover:text-[#3A1E14] transition-colors flex items-center gap-1 group/btn">
                    View All Products <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {userRole !== 'CUSTOMER' && (
              <Link href="/b2b" className="hover:text-[#C89F5F] transition-colors">
                Wholesale
              </Link>
            )}
            <Link href="/about" className="hover:text-[#C89F5F] transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-[#C89F5F] transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">
            
            {/* Search Bar Component */}
            <div className="relative flex items-center" ref={searchRef}>
              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 250, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden mr-2 hidden md:block"
                  >
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-[#C89F5F] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/30 bg-white"
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
              
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setIsMobileMenuOpen(true);
                    setTimeout(() => {
                      const mobileSearchInput = document.getElementById('mobile-search-input');
                      if (mobileSearchInput) mobileSearchInput.focus();
                    }, 200);
                  } else {
                    setIsSearchOpen(!isSearchOpen);
                  }
                }}
                className="text-gray-600 hover:text-[#3A1E14] transition-colors p-1"
              >
                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>

              {/* Search Dropdown */}
              <AnimatePresence>
                {isSearchOpen && searchQuery.length >= 2 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-4 w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-gray-50 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Search Results</span>
                      {isSearching && <Loader2 size={14} className="animate-spin text-[#C89F5F]" />}
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto">
                      {!isSearching && searchResults.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          No products found for "{searchQuery}"
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-50">
                          {searchResults.map((product) => (
                            <li key={product.id}>
                              <Link 
                                href={`/shop?product=${product.slug}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="flex items-center gap-3 p-3 hover:bg-[#FAF8F5] transition-colors"
                              >
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                                  {product.images?.[0]?.url ? (
                                    <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                                  ) : (
                                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400">IMG</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-[#3A1E14] truncate">{product.name}</h4>
                                  <p className="text-[#C89F5F] font-bold text-xs mt-0.5">₹{product.basePrice}</p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <Link 
                          href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="text-xs font-bold text-[#5c2a1c] hover:text-[#C89F5F] transition-colors"
                        >
                          View all matching products &rarr;
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link href={user ? "/account" : "/login"} className="hidden md:flex text-gray-600 hover:text-[#3A1E14] transition-colors items-center">
              <User size={20} />
            </Link>

            <Button 
              onClick={toggleDrawer}
              className="bg-[#3A1E14] text-white hover:bg-[#2A140B] rounded-full px-0 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center relative shadow-md"
            >
              <ShoppingCart size={18} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C89F5F] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartItems.length}
                </span>
              )}
            </Button>
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden text-[#3A1E14] p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-white z-[70] shadow-2xl flex flex-col lg:hidden overflow-y-auto"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <span className="font-heading font-bold text-[#3A1E14] text-lg">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-[#3A1E14] transition-colors bg-gray-50 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Mobile Search */}
              <div className="px-6 pt-6">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    id="mobile-search-input"
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#C89F5F]"
                  />
                  
                  {/* Mobile Search Results */}
                  {searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      {isSearching ? (
                        <div className="p-4 flex justify-center"><Loader2 size={16} className="animate-spin text-[#C89F5F]" /></div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-xs">No products found</div>
                      ) : (
                        <ul className="max-h-[250px] overflow-y-auto divide-y divide-gray-50">
                          {searchResults.map((product) => (
                            <li key={product.id}>
                              <Link 
                                href={`/shop?product=${product.slug}`}
                                onClick={() => { setIsMobileMenuOpen(false); setSearchQuery(""); }}
                                className="flex items-center gap-3 p-3 hover:bg-[#FAF8F5]"
                              >
                                <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden relative">
                                  {product.images?.[0]?.url ? (
                                    <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                                  ) : (
                                    <span className="absolute inset-0 flex items-center justify-center text-[6px] text-gray-400">IMG</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-[#3A1E14] truncate">{product.name}</h4>
                                  <p className="text-[#C89F5F] font-bold text-[10px]">₹{product.basePrice}</p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 py-6 px-6 flex flex-col gap-6">
                <Link href="/" className="text-[#3A1E14] font-medium text-lg border-b border-gray-50 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                <Link href="/shop" className="text-[#3A1E14] font-medium text-lg border-b border-gray-50 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
                <div className="border-b border-gray-50 pb-4">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 block">Shop Categories</span>
                  <ul className="space-y-4 pl-2">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <li key={cat.id}>
                          <Link 
                            href={`/shop?category=${cat.slug}`} 
                            className="text-[#3A1E14] font-medium" 
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 text-xs">Loading...</li>
                    )}
                  </ul>
                </div>
                {userRole !== 'CUSTOMER' && (
                  <Link href="/b2b" className="text-[#3A1E14] font-medium text-lg border-b border-gray-50 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Wholesale / Corporate</Link>
                )}
                <Link href="/about" className="text-[#3A1E14] font-medium text-lg border-b border-gray-50 pb-4" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link href="/contact" className="text-[#3A1E14] font-medium text-lg pb-4" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
              </div>
              
              <div className="p-6 bg-[#FAF8F5] mt-auto">
                {user ? (
                  <div className="mb-3 space-y-2">
                    <div className="w-full py-3 bg-white border border-[#EAE2DB] text-[#3A1E14] rounded-xl font-medium text-sm flex items-center justify-center">
                      Hi, {user.user_metadata?.name || 'User'}
                    </div>
                    <button 
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                      className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 bg-[#3A1E14] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 mb-3"
                  >
                    Login / Sign Up
                  </Link>
                )}
                <Link href="/account/orders" className="w-full py-3 bg-white border border-[#EAE2DB] text-[#3A1E14] rounded-xl font-medium text-sm flex items-center justify-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <Truck size={16} className="text-[#C89F5F]" /> Track Order
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <CartDrawer />
    </>
  );
}
