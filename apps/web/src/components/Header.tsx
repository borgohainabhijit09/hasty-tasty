"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, MapPin, HelpCircle, Package, Truck, ShieldCheck, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <Link href="/track" className="flex items-center gap-2 hover:text-white transition-colors">
              <Truck size={14} className="text-[#C89F5F]" /> <span>Track Order</span>
            </Link>
            <Link href="/help" className="flex items-center gap-2 hover:text-white transition-colors">
              <HelpCircle size={14} className="text-[#C89F5F]" /> <span>Help Center</span>
            </Link>
            <Link href="/stores" className="flex items-center gap-2 hover:text-white transition-colors">
              <MapPin size={14} className="text-[#C89F5F]" /> <span>Store Locator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1260px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="relative w-52 h-20 md:w-64 md:h-[90px] block">
              <Image
                src="/images/logo.png"
                alt="Hasty Tasty Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide text-gray-700">
            <Link href="/" className="hover:text-[#C89F5F] transition-colors">
              Home
            </Link>

            {/* Shop Mega Menu */}
            <div className="group relative py-4">
              <Link href="/shop" className="hover:text-[#C89F5F] transition-colors flex items-center gap-1">
                Shop <span className="text-[10px] opacity-60 group-hover:rotate-180 transition-transform">▼</span>
              </Link>
              
              {/* Dropdown */}
              <div className="absolute top-full -left-[180px] w-[600px] bg-white shadow-2xl rounded-2xl border border-gray-100 p-6 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50 flex gap-8">
                {/* Invisible hover bridge to prevent menu from closing when moving mouse */}
                <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
                
                {/* Links */}
                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <h5 className="text-[#3A1E14] text-sm font-bold font-heading mb-4 border-b border-gray-100 pb-2">Sweet Delights</h5>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/shop?category=cakes" className="text-gray-500 hover:text-[#C89F5F] text-xs transition-colors flex items-center gap-2 group/link">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C89F5F]/30 group-hover/link:bg-[#C89F5F] transition-colors" /> Cakes
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=cookies" className="text-gray-500 hover:text-[#C89F5F] text-xs transition-colors flex items-center gap-2 group/link">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C89F5F]/30 group-hover/link:bg-[#C89F5F] transition-colors" /> Cookies
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=pastries" className="text-gray-500 hover:text-[#C89F5F] text-xs transition-colors flex items-center gap-2 group/link">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C89F5F]/30 group-hover/link:bg-[#C89F5F] transition-colors" /> Pastries
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[#3A1E14] text-sm font-bold font-heading mb-4 border-b border-gray-100 pb-2">Savory &amp; Gifts</h5>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/shop?category=breads" className="text-gray-500 hover:text-[#C89F5F] text-xs transition-colors flex items-center gap-2 group/link">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C89F5F]/30 group-hover/link:bg-[#C89F5F] transition-colors" /> Artisan Breads
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=snacks" className="text-gray-500 hover:text-[#C89F5F] text-xs transition-colors flex items-center gap-2 group/link">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C89F5F]/30 group-hover/link:bg-[#C89F5F] transition-colors" /> Savory Snacks
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=hampers" className="text-gray-500 hover:text-[#C89F5F] text-xs transition-colors flex items-center gap-2 group/link">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C89F5F]/30 group-hover/link:bg-[#C89F5F] transition-colors" /> Gift Hampers
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Feature Image */}
                <div className="w-[220px] bg-[#FAF8F5] rounded-xl overflow-hidden relative shadow-inner">
                  <Image src="/images/pastries-new.png" alt="Featured Pastries" fill className="object-cover hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <p className="text-[#C89F5F] text-[9px] font-bold uppercase tracking-widest mb-1.5">New Arrivals</p>
                    <p className="text-white text-sm font-medium leading-snug">Assorted Premium Pastries</p>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/b2b" className="hover:text-[#C89F5F] transition-colors">
              B2B
            </Link>
            <Link href="/about" className="hover:text-[#C89F5F] transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-[#C89F5F] transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-4 lg:gap-5">
            <button className="text-gray-600 hover:text-[#3A1E14] transition-colors">
              <Search size={20} />
            </button>
            <button className="hidden md:flex text-sm font-medium text-gray-600 hover:text-[#3A1E14] transition-colors">
              Login / Sign Up
            </button>
            <Button className="bg-[#3A1E14] text-white hover:bg-[#2A140B] rounded-full px-4 lg:px-6 flex items-center gap-2 text-xs lg:text-sm shadow-md h-9 lg:h-10">
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Cart (2)</span>
              <span className="sm:hidden">(2)</span>
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
              
              <div className="flex-1 py-6 px-6 flex flex-col gap-6">
                <Link href="/" className="text-[#3A1E14] font-medium text-lg border-b border-gray-50 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                <div className="border-b border-gray-50 pb-4">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 block">Shop Categories</span>
                  <ul className="space-y-4 pl-2">
                    <li><Link href="/shop?category=cakes" className="text-[#3A1E14] font-medium" onClick={() => setIsMobileMenuOpen(false)}>Cakes</Link></li>
                    <li><Link href="/shop?category=cookies" className="text-[#3A1E14] font-medium" onClick={() => setIsMobileMenuOpen(false)}>Cookies</Link></li>
                    <li><Link href="/shop?category=pastries" className="text-[#3A1E14] font-medium" onClick={() => setIsMobileMenuOpen(false)}>Pastries</Link></li>
                    <li><Link href="/shop?category=breads" className="text-[#3A1E14] font-medium" onClick={() => setIsMobileMenuOpen(false)}>Breads</Link></li>
                    <li><Link href="/shop?category=snacks" className="text-[#3A1E14] font-medium" onClick={() => setIsMobileMenuOpen(false)}>Snacks</Link></li>
                    <li><Link href="/shop?category=hampers" className="text-[#3A1E14] font-medium" onClick={() => setIsMobileMenuOpen(false)}>Gift Hampers</Link></li>
                  </ul>
                </div>
                <Link href="/b2b" className="text-[#3A1E14] font-medium text-lg border-b border-gray-50 pb-4" onClick={() => setIsMobileMenuOpen(false)}>B2B / Corporate</Link>
                <Link href="/about" className="text-[#3A1E14] font-medium text-lg border-b border-gray-50 pb-4" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link href="/contact" className="text-[#3A1E14] font-medium text-lg pb-4" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
              </div>
              
              <div className="p-6 bg-[#FAF8F5] mt-auto">
                <button className="w-full py-3 bg-[#3A1E14] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 mb-3">
                  Login / Sign Up
                </button>
                <Link href="/track" className="w-full py-3 bg-white border border-[#EAE2DB] text-[#3A1E14] rounded-xl font-medium text-sm flex items-center justify-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <Truck size={16} className="text-[#C89F5F]" /> Track Order
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
