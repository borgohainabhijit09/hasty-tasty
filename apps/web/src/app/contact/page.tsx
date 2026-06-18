"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Phone, Mail, MessageCircle, MapPin, 
  Cake, Gift, Truck, MessageSquare, ShieldCheck, ArrowRight, Store, Leaf, Shield
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ContactPage() {
  return (
    <main className="flex-grow flex flex-col font-sans">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="bg-[#FAF8F5] pt-12 pb-16">
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
              <p className="text-[#C89F5F] tracking-[0.2em] text-[11px] font-bold uppercase mb-2">Contact Us</p>
              
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-heading font-bold text-[#3A1E14] leading-[1.1]">
                We'd Love to<br />
                <span className="text-[#C89F5F]">Hear from You.</span>
              </h1>
              
              {/* Ornamental Divider */}
              <div className="flex items-center gap-2 opacity-60 w-32 py-2">
                <div className="flex-1 h-px bg-[#C89F5F]"></div>
                <div className="w-2 h-2 rotate-45 border border-[#C89F5F]"></div>
                <div className="flex-1 h-px bg-[#C89F5F]"></div>
              </div>

              <div className="space-y-4 text-gray-600 text-[15px] leading-relaxed max-w-[400px]">
                <p>
                  Have a question, feedback, or a special request? We're here to help and make every experience truly delightful.
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
              <div className="relative w-full aspect-[4/3] rounded-[30px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#F0EBE1]/40 to-transparent mix-blend-multiply z-10" />
                <Image 
                  src="/images/hero-cake.png" 
                  alt="Delicious Cupcake and Envelope" 
                  fill 
                  className="object-cover scale-105"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN CONTACT AREA ── */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* Left Column (Form) */}
            <motion.div 
              className="flex-1 bg-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-heading font-bold text-[#3A1E14] mb-3">Send Us a Message</h2>
              <div className="flex items-center gap-2 opacity-60 w-16 mb-4">
                <div className="flex-1 h-px bg-[#C89F5F]"></div>
                <div className="w-1.5 h-1.5 rotate-45 border border-[#C89F5F]"></div>
                <div className="flex-1 h-px bg-[#C89F5F]"></div>
              </div>
              <p className="text-gray-500 text-[14px] mb-8">Fill in the details below and we will get back to you shortly.</p>

              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#3A1E14]">Full Name *</label>
                    <input type="text" className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#3A1E14]">Email Address *</label>
                    <input type="email" className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#3A1E14]">Phone Number *</label>
                  <input type="tel" className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#3A1E14]">Subject *</label>
                  <select className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5] appearance-none cursor-pointer">
                    <option value="" disabled selected>Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="corporate">Corporate Gifting</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#3A1E14]">Message *</label>
                  <textarea rows={4} placeholder="Type your message here..." className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5] resize-none"></textarea>
                </div>

                <button type="button" className="w-full bg-[#4A171E] hover:bg-[#330F13] text-white font-medium text-[15px] py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4">
                  Send Message <ArrowRight size={16} />
                </button>

                <div className="flex items-center justify-center gap-2 text-gray-500 text-[12px] mt-4">
                  <ShieldCheck size={14} /> We respect your privacy. Your information is safe with us.
                </div>
              </form>
            </motion.div>

            {/* Right Column (Get in Touch) */}
            <motion.div 
              className="lg:w-[400px] xl:w-[450px] flex-shrink-0"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="bg-[#FAF8F5] border border-[#F0EBE1] rounded-[24px] p-8 md:p-10 h-full">
                <h2 className="text-3xl font-heading font-bold text-[#3A1E14] mb-3">Get in Touch</h2>
                <div className="flex items-center gap-2 opacity-60 w-16 mb-10">
                  <div className="flex-1 h-px bg-[#C89F5F]"></div>
                  <div className="w-1.5 h-1.5 rotate-45 border border-[#C89F5F]"></div>
                  <div className="flex-1 h-px bg-[#C89F5F]"></div>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-full border border-[#EBE3D5] bg-white flex items-center justify-center text-[#C89F5F] flex-shrink-0 shadow-sm">
                      <Phone size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#3A1E14] mb-1">Phone</p>
                      <p className="text-[15px] font-semibold text-[#3A1E14] mb-1">+91 98765 43210</p>
                      <p className="text-[12px] text-gray-500">Mon - Sat: 9:00 AM - 7:00 PM</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-full border border-[#EBE3D5] bg-white flex items-center justify-center text-[#C89F5F] flex-shrink-0 shadow-sm">
                      <Mail size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#3A1E14] mb-1">Email</p>
                      <p className="text-[15px] font-semibold text-[#3A1E14] mb-1">hello@hastytasty.com</p>
                      <p className="text-[12px] text-gray-500">We reply within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-full border border-[#EBE3D5] bg-white flex items-center justify-center text-[#C89F5F] flex-shrink-0 shadow-sm">
                      <MessageCircle size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#3A1E14] mb-1">WhatsApp</p>
                      <p className="text-[15px] font-semibold text-[#3A1E14] mb-1">+91 98765 43210</p>
                      <p className="text-[12px] text-gray-500">Chat with us for quick help</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-full border border-[#EBE3D5] bg-white flex items-center justify-center text-[#C89F5F] flex-shrink-0 shadow-sm">
                      <MapPin size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#3A1E14] mb-1">Address</p>
                      <p className="text-[13px] text-gray-600 leading-relaxed max-w-[200px]">
                        Hasty Tasty Bakery,<br />
                        123 Sweet Street,<br />
                        Kolkata, West Bengal 700001,<br />
                        India
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-[#EBE3D5]">
                  <p className="text-[13px] font-bold text-[#3A1E14] mb-4">Follow Us</p>
                  <div className="flex items-center gap-3">
                    <a href="#" className="w-10 h-10 rounded-full bg-white border border-[#EBE3D5] flex items-center justify-center text-[#3A1E14] hover:text-[#C89F5F] hover:border-[#C89F5F] transition-colors shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white border border-[#EBE3D5] flex items-center justify-center text-[#3A1E14] hover:text-[#C89F5F] hover:border-[#C89F5F] transition-colors shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white border border-[#EBE3D5] flex items-center justify-center text-[#3A1E14] hover:text-[#C89F5F] hover:border-[#C89F5F] transition-colors shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                    </a>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 3. WE'RE HERE FOR SECTION ── */}
      <section className="bg-white pb-20">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          <div className="bg-[#FAF8F5] border border-[#F0EBE1] rounded-[24px] py-14 px-8">
            <div className="text-center mb-12 flex flex-col items-center">
              <h2 className="text-3xl font-heading font-bold text-[#3A1E14] mb-3">We're Here For</h2>
              <div className="flex items-center gap-2 opacity-60 w-16">
                <div className="flex-1 h-px bg-[#C89F5F]"></div>
                <div className="w-1.5 h-1.5 rotate-45 border border-[#C89F5F]"></div>
                <div className="flex-1 h-px bg-[#C89F5F]"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#EBE3D5]">
              {[
                { icon: Cake, title: "Order Assistance", desc: "Need help placing an order or checking your order status?" },
                { icon: Gift, title: "Corporate & Bulk Orders", desc: "Looking for bulk orders or corporate gifting solutions?" },
                { icon: Truck, title: "Delivery & Logistics", desc: "Have questions about delivery, timing, or tracking?" },
                { icon: MessageSquare, title: "Feedback & Suggestions", desc: "We love feedback! Share your experience with us." },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center px-6 pt-6 md:pt-0">
                  <div className="w-14 h-14 rounded-full bg-white border border-[#EBE3D5] flex items-center justify-center text-[#C89F5F] mb-4 shadow-sm">
                    <item.icon size={24} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-[14px] font-bold text-[#3A1E14] mb-2">{item.title}</h4>
                  <p className="text-[12px] text-gray-500 leading-relaxed max-w-[200px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CALL TO ACTION CARDS ── */}
      <section className="bg-white pb-20">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Visit Our Store Card */}
            <div className="bg-[#2A0F14] rounded-[24px] overflow-hidden relative p-10 flex flex-col justify-center min-h-[280px]">
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
                {/* Decorative background element if needed */}
              </div>
              <div className="flex gap-8 items-center z-10">
                <div className="hidden sm:flex w-28 h-28 border border-[#C89F5F]/30 rounded-2xl items-center justify-center text-[#C89F5F]">
                  <Store size={48} strokeWidth={1} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-heading font-bold text-[#FAF8F5]">Visit Our Store</h3>
                  <div className="flex items-center gap-2 opacity-60 w-16">
                    <div className="flex-1 h-px bg-[#C89F5F]"></div>
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#C89F5F]"></div>
                    <div className="flex-1 h-px bg-[#C89F5F]"></div>
                  </div>
                  <p className="text-[#EBE3D5] text-[14px]">Experience our magic in person at our bakery.</p>
                  <button className="bg-[#C89F5F] hover:bg-[#B38C4F] text-[#3A1E14] font-semibold text-[13px] px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors inline-flex">
                    Store Locator <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Shop Online Card */}
            <div className="bg-[#FAF8F5] rounded-[24px] overflow-hidden border border-[#F0EBE1] relative p-10 flex flex-col justify-center min-h-[280px]">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-60 mix-blend-multiply">
                <Image 
                  src="/images/hero-cake.png" 
                  alt="Delicious cake" 
                  fill 
                  className="object-cover object-right scale-110"
                />
              </div>
              <div className="relative z-10 max-w-[260px] space-y-4">
                <p className="text-[#C89F5F] tracking-[0.15em] text-[10px] font-bold uppercase">Can't wait to indulge?</p>
                <div className="flex items-center gap-2 opacity-60 w-16">
                  <div className="flex-1 h-px bg-[#C89F5F]"></div>
                  <div className="w-1 h-1 rotate-45 border border-[#C89F5F]"></div>
                  <div className="flex-1 h-px bg-[#C89F5F]"></div>
                </div>
                <h3 className="text-3xl font-heading font-bold text-[#3A1E14] leading-tight">Explore our delicious collection online.</h3>
                <button className="bg-transparent border border-[#3A1E14] hover:bg-[#3A1E14] hover:text-white text-[#3A1E14] font-semibold text-[13px] px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors inline-flex">
                  Shop Now <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. BOTTOM FEATURE STRIP ── */}
      <section className="bg-[#FAF8F5] border-t border-[#F0EBE1] py-10">
        <div className="max-w-[1260px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Leaf, title: "Premium Ingredients", desc: "Finest quality, always" },
              { icon: Cake, title: "Freshly Baked", desc: "Made every day" },
              { icon: ShieldCheck, title: "Hygienically Prepared", desc: "100% safe & clean" },
              { icon: Truck, title: "On-time Delivery", desc: "Right to your doorstep" },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="text-[#C89F5F]">
                  <feat.icon size={32} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#3A1E14]">{feat.title}</h4>
                  <p className="text-[11px] text-gray-500">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
