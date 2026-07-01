"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Cake, ShoppingBag, CheckCircle, Heart, Star, Sparkles, ChefHat, Truck, Users, Award, ShieldCheck, ArrowRight, Leaf
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AboutPage() {
  return (
    <main className="flex-grow flex flex-col overflow-x-hidden font-sans">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="bg-[#FAF8F5] pt-12 pb-20">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <motion.div 
              className="flex-1 space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="text-[12px] text-gray-500 flex items-center gap-2 mb-4">
                <Link href="/" className="hover:text-[#C89F5F] transition-colors">Home</Link>
                <span>&gt;</span>
                <span className="text-[#C89F5F]">About Us</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#3A1E14] leading-[1.1]">
                Our Story.<br />
                Crafted with <span className="text-[#C89F5F]">Passion.</span>
              </h1>
              
              {/* Ornamental Divider */}
              <div className="flex items-center gap-2 opacity-60 w-32 py-2">
                <div className="flex-1 h-px bg-[#C89F5F]"></div>
                <div className="w-2 h-2 rotate-45 border border-[#C89F5F]"></div>
                <div className="flex-1 h-px bg-[#C89F5F]"></div>
              </div>

              <div className="space-y-4 text-gray-600 text-[15px] leading-relaxed max-w-lg">
                <p>
                  Hasty Tasty was born out of a simple belief – that every celebration deserves exceptional taste.
                </p>
                <p>
                  From our humble beginnings to becoming a trusted name, we continue to bake happiness into every creation.
                </p>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              className="flex-1 relative w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-[30px] overflow-hidden">
                {/* Simulated background fade for the cake image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#F0EBE1]/50 to-transparent mix-blend-multiply z-10" />
                <Image 
                  src="/images/hero-cake.png" 
                  alt="Delicious Chocolate Cake" 
                  fill 
                  className="object-cover scale-105"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. OUR JOURNEY SECTION ── */}
      <section className="bg-white py-24">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Left Image */}
            <motion.div 
              className="w-full lg:w-5/12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="relative aspect-[4/5] rounded-[30px] overflow-hidden shadow-xl border border-[#F0EBE1]">
                <Image 
                  src="/images/pastries-new.png" 
                  alt="Baker decorating a cake" 
                  fill 
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div 
              className="w-full lg:w-7/12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="mb-8">
                <p className="text-[#C89F5F] tracking-[0.2em] text-[11px] font-bold uppercase mb-2">Our Journey</p>
                <div className="flex items-center gap-2 opacity-60 w-16 mb-4">
                  <div className="flex-1 h-px bg-[#C89F5F]"></div>
                  <div className="w-1.5 h-1.5 rotate-45 border border-[#C89F5F]"></div>
                  <div className="flex-1 h-px bg-[#C89F5F]"></div>
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-[42px] font-heading font-bold text-[#3A1E14] leading-[1.15] mb-6">
                  Baked with <span className="text-[#C89F5F]">Love.</span><br />
                  Delivered with <span className="text-[#C89F5F]">Pride.</span>
                </h2>
                
                <p className="text-gray-600 text-[15px] leading-relaxed max-w-lg mb-12">
                  What started in a small kitchen with big dreams is now a journey of growth, gratitude and countless sweet moments. We focus on quality, consistency and creating memories that last a lifetime.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 flex items-center justify-center text-[#C89F5F] mb-3">
                      <Cake size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-xl font-bold text-[#3A1E14] mb-1">2000</p>
                    <p className="text-[11px] text-gray-500 font-medium">Our Beginning</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 flex items-center justify-center text-[#C89F5F] mb-3">
                      <ShoppingBag size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-xl font-bold text-[#3A1E14] mb-1">10,000+</p>
                    <p className="text-[11px] text-gray-500 font-medium">Happy Customers</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 flex items-center justify-center text-[#C89F5F] mb-3">
                      <CheckCircle size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-xl font-bold text-[#3A1E14] mb-1">500+</p>
                    <p className="text-[11px] text-gray-500 font-medium">Products</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 flex items-center justify-center text-[#C89F5F] mb-3">
                      <Heart size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-xl font-bold text-[#3A1E14] mb-1">Countless</p>
                    <p className="text-[11px] text-gray-500 font-medium">Sweet Memories</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 3. THE PROMISE SECTION ── */}
      <section className="bg-[#FAF8F5] py-20">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <p className="text-[#C89F5F] tracking-[0.2em] text-[11px] font-bold uppercase mb-2">Why Choose Us</p>
            <div className="flex items-center gap-2 opacity-60 w-16 mb-4">
              <div className="flex-1 h-px bg-[#C89F5F]"></div>
              <div className="w-1.5 h-1.5 rotate-45 border border-[#C89F5F]"></div>
              <div className="flex-1 h-px bg-[#C89F5F]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#3A1E14] mb-4">
              The Hasty Tasty <span className="text-[#C89F5F]">Promise</span>
            </h2>
            <p className="text-gray-600 text-[14px] max-w-lg mx-auto">
              We don't just bake. We create experiences that you can taste and cherish.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200/60">
            {[
              { icon: Leaf, title: "Premium Ingredients", desc: "We use the finest ingredients to ensure exceptional taste and quality." },
              { icon: Cake, title: "Freshly Baked", desc: "Every product is baked fresh to order for the best flavor and texture." },
              { icon: ChefHat, title: "Expert Bakers", desc: "Our skilled bakers bring passion, creativity and years of experience." },
              { icon: ShieldCheck, title: "Hygienically Prepared", desc: "Maintaining the highest standards of hygiene in every step." },
              { icon: Truck, title: "On-time Delivery", desc: "We value your time and ensure safe and timely delivery." },
            ].map((feat, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4 pt-6 md:pt-0">
                <div className="w-16 h-16 rounded-full border border-[#EBE3D5] bg-white flex items-center justify-center text-[#C89F5F] mb-5 shadow-sm">
                  <feat.icon size={26} strokeWidth={1.5} />
                </div>
                <h4 className="text-[13px] font-bold text-[#3A1E14] mb-2">{feat.title}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. STATS HIGHLIGHT BAR ── */}
      <section className="bg-white">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8 py-10">
          <div className="bg-[#FAF8F5] border border-[#F0EBE1] rounded-2xl py-12 px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200/60">
              {[
                { stat: "15,000+", label: "Orders Delivered" },
                { stat: "98%", label: "Happy Customers" },
                { stat: "100%", label: "Premium Ingredients" },
                { stat: "24 Hour", label: "Fresh Preparation" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center px-4">
                  <p className="text-3xl md:text-4xl font-heading font-bold text-[#3A1E14] mb-2">{item.stat}</p>
                  <p className="text-[12px] font-medium text-gray-600 mb-2">{item.label}</p>
                  <div className="flex items-center gap-1 opacity-40 w-8">
                    <div className="flex-1 h-px bg-[#C89F5F]"></div>
                    <div className="w-1 h-1 rotate-45 border border-[#C89F5F]"></div>
                    <div className="flex-1 h-px bg-[#C89F5F]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. OUR VALUES SECTION ── */}
      <section className="bg-white py-20">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <p className="text-[#C89F5F] tracking-[0.2em] text-[11px] font-bold uppercase mb-2">Our Values</p>
            <div className="flex items-center gap-2 opacity-60 w-16 mb-4">
              <div className="flex-1 h-px bg-[#C89F5F]"></div>
              <div className="w-1.5 h-1.5 rotate-45 border border-[#C89F5F]"></div>
              <div className="flex-1 h-px bg-[#C89F5F]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#3A1E14]">
              Rooted in <span className="text-[#C89F5F]">Values.</span> Driven by <span className="text-[#C89F5F]">Passion.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Award, title: "Quality First", desc: "We never compromise on the quality of our ingredients or process." },
              { icon: Heart, title: "Customer Delight", desc: "Your happiness is at the heart of everything we do." },
              { icon: ShieldCheck, title: "Integrity", desc: "Honest, transparent and committed in every relationship." },
              { icon: Sparkles, title: "Continuous Improvement", desc: "We keep innovating to bring you better products and experiences." },
            ].map((val, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-shrink-0 text-[#C89F5F] mt-1">
                  <val.icon size={32} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#3A1E14] mb-2">{val.title}</h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FOOTER CTA SECTION ── */}
      <section className="bg-[#FAF8F5] border-t border-[#F0EBE1] overflow-hidden">
        <div className="max-w-[1260px] mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            
            {/* Left Image */}
            <div className="w-full md:w-1/3 h-[250px] md:h-[300px] relative">
              <Image 
                src="/images/pastries-new.png" 
                alt="Cake slice" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#FAF8F5] opacity-50 md:opacity-100"></div>
            </div>

            {/* Center Content */}
            <div className="w-full md:w-1/3 py-12 px-8 text-center md:text-left z-10 flex flex-col justify-center items-center md:items-start">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#3A1E14] leading-tight mb-4">
                Thank You for Being<br />
                a Part of <span className="text-[#C89F5F]">Our Journey.</span>
              </h2>
              <p className="text-gray-600 text-[13px] leading-relaxed mb-6 max-w-sm">
                Every order, every celebration and every smile inspires us to keep creating the best for you.
              </p>
              <Link href="/shop" className="inline-flex items-center gap-2 bg-[#4A171E] hover:bg-[#330F13] text-white px-6 py-3 rounded-lg text-[13px] font-medium transition-colors shadow-md">
                Shop Our Collection <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right Badge */}
            <div className="w-full md:w-1/3 py-12 px-8 flex justify-center items-center">
              <div className="w-48 h-48 rounded-full border border-[#EBE3D5] flex items-center justify-center relative bg-white shadow-sm">
                <div className="absolute inset-2 rounded-full border border-dashed border-[#C89F5F]/40 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-widest text-[#C89F5F] font-bold mb-2">Crafted with Love</p>
                    <h3 className="font-heading text-2xl font-bold text-[#3A1E14] mb-1 leading-none">Hasty Tasty</h3>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-medium">Taster's Pride</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
