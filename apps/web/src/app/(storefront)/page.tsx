"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, ShoppingCart, MapPin, HelpCircle, Package, Truck, ShieldCheck, Heart, Tag, Lock, RefreshCw, Headphones, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const reviewContainerRef = useRef<HTMLDivElement>(null);
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/categories?b2c=true`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data.filter((c: any) => c.isActive !== false));
        }
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Just take the first 5 active products for now
          setBestSellers(data.filter((p: any) => p.isActive).slice(0, 5));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <main className="flex-grow flex flex-col overflow-x-hidden font-sans">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] lg:h-[50vh] min-h-[450px] bg-[#FAF8F5] overflow-hidden flex items-center">
        {/* Background Image Setup */}
        <div
          className="absolute inset-0 z-0 bg-cover lg:bg-[length:auto_100%] bg-[center_top_20%] lg:bg-right bg-no-repeat"
          style={{ backgroundImage: "url('/images/h-hero-bg.png')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/95 lg:via-[#FAF8F5]/80 to-[#FAF8F5]/60 lg:to-transparent w-full lg:w-[65%]" />

        {/* Golden curved line from design */}
        <div className="absolute top-0 right-[40%] h-full w-[2px] opacity-30 bg-gradient-to-b from-transparent via-[#C89F5F] to-transparent transform -skew-x-[15deg] z-0 hidden lg:block" />
        <div className="absolute top-10 right-[38%] w-[600px] h-[600px] rounded-full border border-[#C89F5F]/30 -translate-y-1/2 z-0 hidden lg:block" />

        <div className="max-w-[1260px] mx-auto px-8 w-full relative z-10 flex">
          <motion.div
            className="flex-1 max-w-xl space-y-5"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <p className="text-[#C89F5F] tracking-[0.2em] text-[10px] font-bold uppercase mb-3">
                Premium Food. Exceptional Taste.
              </p>
              <h1 className="text-3xl lg:text-5xl font-heading font-bold leading-[1.15] text-[#3A1E14]">
                Made with <span className="text-[#C89F5F]">Love,</span><br />
                Served with <span className="text-[#C89F5F]">Pride.</span>
              </h1>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-sm text-gray-600 max-w-sm leading-relaxed">
              From our ovens to your home, experience the finest bakery delights crafted with passion and premium ingredients.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 pt-1">
              <Button
                size="default"
                className="bg-[#4A171E] text-white hover:bg-[#330F13] rounded-md px-6 h-10 text-sm font-medium tracking-wide shadow-lg"
                asChild
              >
                <Link href="/shop">Shop Now <ArrowRight size={14} className="ml-2" /></Link>
              </Button>
              <Button
                size="default"
                variant="outline"
                className="border-[#C89F5F] text-[#3A1E14] hover:bg-[#FAF8F5] rounded-md px-6 h-10 text-sm font-medium tracking-wide bg-white shadow-sm"
                asChild
              >
                <Link href="/shop?category=cakes">Explore Cakes</Link>
              </Button>
            </motion.div>

            {/* Feature small points */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 sm:gap-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EAE2DB] flex items-center justify-center text-[#C89F5F] shadow-sm">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#3A1E14]">Premium Ingredients</p>
                  <p className="text-[11px] text-gray-500">Finest quality, always</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EAE2DB] flex items-center justify-center text-[#C89F5F] shadow-sm">
                  <Package size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#3A1E14]">Freshly Baked</p>
                  <p className="text-[11px] text-gray-500">Made every day</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EAE2DB] flex items-center justify-center text-[#C89F5F] shadow-sm">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#3A1E14]">Fast Delivery</p>
                  <p className="text-[11px] text-gray-500">On time, every time</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Signature Collection */}
      <section className="py-16 bg-[#FAF8F5]">
        <div className="max-w-[1260px] mx-auto px-8">
          <div className="text-center mb-10 space-y-2">
            <p className="text-[#C89F5F] tracking-[0.2em] text-[10px] font-bold uppercase">Our Collection</p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#3A1E14]">Shop by Category</h2>
            <p className="text-gray-400 text-xs">Discover our wide range of freshly baked delights</p>
          </div>

          <div className="relative">
            {/* Left arrow */}
            <button 
              onClick={() => {
                if (categoryContainerRef.current) categoryContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-12 z-10 w-10 h-10 rounded-full border border-[#C89F5F] bg-white text-[#C89F5F] items-center justify-center hover:bg-[#C89F5F] hover:text-white transition-colors shadow-sm hidden md:flex"
            >
              <ArrowRight size={15} className="rotate-180" />
            </button>

            <div 
              ref={categoryContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id || cat.slug}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                transition={{ delay: idx * 0.08 }}
                className="flex-shrink-0 w-[180px] md:w-[220px] snap-start"
              >
                <Link href={`/shop?category=${cat.slug}`}>
                  <div className="bg-white rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className="w-full aspect-square relative overflow-hidden bg-[#F7F4F0]">
                      <Image
                        src={cat.imageUrl || "/images/hero-cake.png"}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 768px) 180px, 220px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="px-3 py-3 flex items-center justify-between bg-white relative z-10">
                      <h3 className="text-[13px] font-semibold text-[#3A1E14]">{cat.name}</h3>
                      <div className="w-6 h-6 rounded-full bg-[#C89F5F] flex items-center justify-center text-white flex-shrink-0 group-hover:bg-[#4A171E] transition-colors duration-300">
                        <ArrowRight size={11} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            </div>

            {/* Right arrow */}
            <button 
              onClick={() => {
                if (categoryContainerRef.current) categoryContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-12 z-10 w-10 h-10 rounded-full border border-[#C89F5F] bg-white text-[#C89F5F] items-center justify-center hover:bg-[#C89F5F] hover:text-white transition-colors shadow-sm hidden md:flex"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="py-14 bg-white">
        <div className="max-w-[1260px] mx-auto px-8">
          {/* Header row */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#C89F5F] tracking-[0.2em] text-[10px] font-bold uppercase mb-1">Best Sellers</p>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#3A1E14]">Most Loved by Our Customers</h2>
            </div>
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-2 border border-[#C89F5F] text-[#3A1E14] text-xs font-medium px-5 py-2.5 rounded-full hover:bg-[#C89F5F] hover:text-white transition-colors"
            >
              View All Products <ArrowRight size={13} />
            </Link>
          </div>

          {/* Product cards row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {bestSellers.map((product, idx) => (
              <motion.div
                key={product.id || product.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                transition={{ delay: idx * 0.08 }}
                className="bg-[#FAF8F5] border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <Link href={`/product/${product.slug}`} className="block relative w-full aspect-square bg-white overflow-hidden">
                  <Image
                    src={product.images?.[0]?.url || "/images/hero-cake.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-3 flex flex-col flex-1 space-y-2">
                  <Link href={`/product/${product.slug}`} className="block">
                    <h3 className="text-[12px] font-semibold text-[#3A1E14] leading-tight hover:underline line-clamp-2">{product.name}</h3>
                  </Link>
                  <div className="flex gap-0.5 mt-auto">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-[11px] text-[#C89F5F]">★</span>
                    ))}
                  </div>
                  <p className="text-[13px] font-bold text-[#3A1E14]">₹{product.basePrice || product.price}</p>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.basePrice || product.price,
                        quantity: 1,
                        image: product.images?.[0]?.url || "/images/hero-cake.png"
                      });
                    }}
                    className="w-full bg-[#4A171E] hover:bg-[#330F13] text-white text-[11px] font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-2"
                  >
                    <ShoppingCart size={12} />
                    Add to Cart <ArrowRight size={11} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile view all link */}
          <div className="mt-6 flex justify-center md:hidden">
            <Link href="/shop" className="flex items-center gap-2 border border-[#C89F5F] text-[#3A1E14] text-xs font-medium px-5 py-2.5 rounded-full">
              View All Products <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Promotional Banner ── */}
      <section className="py-8 bg-white">
        <div className="max-w-[1260px] mx-auto px-8">
          <div
            className="relative rounded-3xl overflow-hidden flex items-center min-h-[280px] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/cta-01.png')" }}
          >
            {/* Gold arc decoration */}
            <div className="absolute right-[38%] top-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-[#C89F5F]/25 z-10 pointer-events-none" />

            {/* Text side */}
            <div className="relative z-20 flex-1 px-6 md:px-10 py-10 md:py-12 w-full md:max-w-[55%] bg-white/70 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
              <p className="text-[#C89F5F] tracking-[0.2em] text-[10px] font-bold uppercase mb-4">Made with Passion</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-[#3A1E14] leading-[1.15] mb-6">
                Every Celebration<br />
                Deserves Something<br />
                <span className="text-[#C89F5F]">Extraordinary.</span>
              </h2>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#4A171E] hover:bg-[#330F13] text-white text-sm font-medium px-6 py-3 md:px-7 rounded-lg transition-colors"
              >
                Explore Collection <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ── Corporate & Bulk Orders ── */}
      <section className="py-8 bg-white">
        <div className="max-w-[1260px] mx-auto px-8">
          <div
            className="relative rounded-3xl overflow-hidden flex items-center min-h-[240px] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/cta-02.png')" }}
          >
            {/* Text + features side */}
            <div className="relative z-10 flex-1 px-6 md:px-10 py-8 md:py-10 w-full md:max-w-[65%] lg:max-w-[55%] bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
              <p className="text-[#C89F5F] tracking-[0.2em] text-[10px] font-bold uppercase mb-3">Corporate &amp; Bulk Orders</p>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-[#3A1E14] leading-[1.2] mb-6">
                Thoughtful Gifting.<br className="hidden md:block" />Stronger Relationships.
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6 md:mb-0">
                {[
                  { icon: "🎁", label: "Corporate Gifting", sub: "Strengthen connections" },
                  { icon: "🎉", label: "Events & Occasions", sub: "Make every moment special" },
                  { icon: "🏢", label: "Office Orders", sub: "Hassle-free delivery" },
                  { icon: "📦", label: "Wholesale Supply", sub: "Reliable & timely" },
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#C89F5F]/10 flex items-center justify-center text-base md:text-lg mb-2">{f.icon}</div>
                    <p className="text-[11px] md:text-[12px] font-semibold text-[#3A1E14]">{f.label}</p>
                    <p className="text-[9px] md:text-[10px] text-gray-500">{f.sub}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 md:hidden">
                <Link
                  href="/b2b"
                  className="inline-flex items-center gap-2 bg-[#4A171E] hover:bg-[#330F13] text-white text-xs font-medium px-5 py-3 rounded-lg transition-colors shadow-md w-full justify-center"
                >
                  Request Quote <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Request Quote button — bottom right */}
            <div className="absolute bottom-8 right-8 z-10 hidden md:block">
              <Link
                href="/b2b"
                className="inline-flex items-center gap-2 bg-[#4A171E] hover:bg-[#330F13] text-white text-xs md:text-sm font-medium px-4 py-2.5 md:px-6 md:py-3 rounded-lg transition-colors shadow-lg"
              >
                Request Quote <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dynamic Pricing ── */}
      <section className="py-8 bg-white">
        <div className="max-w-[1260px] mx-auto px-8">
          <div className="bg-[#FAF8F5] rounded-3xl overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-0">

              {/* Left — Cookie image */}
              <div className="relative w-full lg:w-[30%] aspect-[4/3] lg:aspect-auto lg:h-[320px] flex-shrink-0">
                <Image src="/images/pastries-new.png" alt="Cookies" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none" />
              </div>

              {/* Middle — Heading */}
              <div className="flex-1 px-8 py-10 text-center lg:text-left">
                <p className="text-[#C89F5F] tracking-[0.2em] text-[10px] font-bold uppercase mb-3">Dynamic Pricing</p>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#3A1E14] leading-[1.2]">
                  Order More.<br />
                  <span className="text-[#C89F5F]">Save More.</span>
                </h2>
                <p className="text-gray-500 text-sm mt-3">Better value for every celebration.</p>
              </div>

              {/* Right — Pricing table */}
              <div className="flex-shrink-0 w-full lg:w-[400px] px-6 pb-8 lg:py-10 lg:pr-[80px]">
                <div className="bg-white rounded-xl shadow-sm border border-[#EBE3D5] relative">
                  <div className="px-5 py-3 border-b border-[#EBE3D5]">
                    <p className="text-[#4A2015] text-[13px] font-bold font-heading">Chocolate Cookies</p>
                  </div>
                  {[
                    { range: "1 - 5 Packs", price: "₹200", highlight: false },
                    { range: "6 - 20 Packs", price: "₹180", highlight: false },
                    { range: "21 - 50 Packs", price: "₹160", highlight: true },
                    { range: "51+ Packs", price: "₹140", highlight: false },
                  ].map((tier, idx, arr) => (
                    <div
                      key={tier.range}
                      className={`relative flex items-center justify-between px-5 py-3 border-b border-[#EBE3D5] last:border-0 ${idx === arr.length - 1 ? 'rounded-b-xl' : ''} ${tier.highlight ? "bg-[#F3E5D4]" : ""}`}
                    >
                      <span className="text-[12px] text-[#3A1E14] font-medium">{tier.range}</span>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-[12px] font-bold ${tier.highlight ? "text-[#4A2015]" : "text-[#3A1E14]"}`}>{tier.price}</span>
                        {/* Inline 'Most Popular' tag for all screen sizes */}
                        {tier.highlight && (
                          <span className="text-[9px] bg-[#FAF8F5] text-[#3A1E14] font-medium px-2 py-0.5 rounded-full shadow-sm border border-[#EBE3D5] whitespace-nowrap">
                            Most Popular
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#FAF8F5] py-10 border-t border-gray-200">
        <div className="max-w-[1260px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "📦", stat: "15,000+", label: "Orders Delivered" },
              { icon: "😊", stat: "98%", label: "Happy Customers" },
              { icon: "🌿", stat: "100%", label: "Premium Ingredients" },
              { icon: "⏰", stat: "24 Hour", label: "Fresh Preparation" },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full border border-[#C89F5F]/30 bg-white flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xl font-heading font-bold text-[#3A1E14]">{item.stat}</p>
                  <p className="text-[11px] text-gray-500">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-14 bg-white">
        <div className="max-w-[1260px] mx-auto px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-[#C89F5F] tracking-[0.3em] text-[10px] font-bold uppercase mb-2">What Our Customers Say</p>
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2 mb-0">
              <div className="h-px w-10 bg-[#C89F5F]/40" />
              <span className="text-[#C89F5F] text-base">✦</span>
              <div className="h-px w-10 bg-[#C89F5F]/40" />
            </div>
          </div>

          {/* Cards + arrows */}
          <div className="relative">
            {/* Left arrow */}
            <button 
              onClick={() => {
                if (reviewContainerRef.current) reviewContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-12 z-10 w-10 h-10 rounded-full border border-[#C89F5F] bg-white text-[#C89F5F] items-center justify-center hover:bg-[#C89F5F] hover:text-white transition-colors shadow-sm hidden md:flex"
            >
              <ArrowRight size={15} className="rotate-180" />
            </button>

            {/* Cards Container */}
            <div 
              ref={reviewContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {[
                {
                  quote: "The cake was absolutely delicious and beautifully presented. It made our celebration even more special!",
                  name: "Priya Sharma",
                },
                {
                  quote: "We regularly order hampers for our clients. The quality and packaging are always top-notch.",
                  name: "Rahul Mehta",
                },
                {
                  quote: "Fresh, premium and perfectly baked. Hasty Tasty never disappoints!",
                  name: "Sneha Iyer",
                },
                {
                  quote: "Their customized cookies are a huge hit at every party. The attention to detail is fantastic.",
                  name: "Amit Patel",
                },
                {
                  quote: "Best bakery in town. Period. The chocolate truffle is simply out of this world.",
                  name: "Neha Gupta",
                },
              ].map((t, idx) => (
                <motion.div
                  key={t.name}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#FAF8F5] border border-gray-100 rounded-2xl px-6 py-8 flex flex-col items-center text-center gap-4 flex-shrink-0 w-[85%] md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] snap-center"
                >
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-[#C89F5F] text-base">★</span>
                    ))}
                  </div>
                  <p className="text-[13px] text-gray-600 leading-relaxed flex-1">{t.quote}</p>
                  <p className="text-[13px] font-semibold text-[#C89F5F] italic">– {t.name}</p>
                </motion.div>
              ))}
            </div>

            {/* Right arrow */}
            <button 
              onClick={() => {
                if (reviewContainerRef.current) reviewContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-12 z-10 w-10 h-10 rounded-full border border-[#C89F5F] bg-white text-[#C89F5F] items-center justify-center hover:bg-[#C89F5F] hover:text-white transition-colors shadow-sm hidden md:flex"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
