"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Lock, Mail, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { adminLogin } from "./actions";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    const result = await adminLogin(formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center bg-[#F7F5F0] min-h-screen py-20 px-4">
      <motion.div 
        className="max-w-[440px] w-full bg-white rounded-[24px] p-8 md:p-10 border border-[#F0EBE1] shadow-xl relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        {/* Admin Styling Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#21050A]"></div>
        
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#F7F5F0] rounded-full flex items-center justify-center mb-4 border border-[#EBE3D5]">
            <ShieldAlert size={28} className="text-[#4A171E]" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-[#21050A] mb-2">Admin Portal</h1>
          <p className="text-gray-500 text-[14px]">Secure access for authorized personnel only.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] p-4 rounded-xl mb-6 border border-red-100 flex items-start gap-3">
            <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 relative">
            <label className="text-[13px] font-semibold text-[#21050A]">Admin Email</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} strokeWidth={1.5} />
              </div>
              <input 
                type="email" 
                name="email"
                required
                placeholder="admin@hastytasty.com"
                className="w-full border border-[#EBE3D5] rounded-xl pl-11 pr-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#F7F5F0]" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#21050A]">Password</label>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} strokeWidth={1.5} />
              </div>
              <input 
                type="password" 
                name="password"
                required
                placeholder="••••••••"
                className="w-full border border-[#EBE3D5] rounded-xl pl-11 pr-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#F7F5F0]" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#21050A] hover:bg-[#3D141C] disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium text-[15px] py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-6 shadow-md"
          >
            {isPending ? 'Authenticating...' : 'Access Dashboard'} <ArrowRight size={16} />
          </button>
        </form>

      </motion.div>
    </main>
  );
}
