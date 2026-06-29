"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { login } from "./actions";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center bg-[#FAF8F5] py-20 px-4">
      <motion.div 
        className="max-w-[440px] w-full bg-white rounded-[24px] p-8 md:p-10 border border-[#F0EBE1] shadow-sm"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#3A1E14] mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-[14px]">Sign in to continue to Hasty Tasty.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] p-3 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 relative">
            <label className="text-[13px] font-semibold text-[#3A1E14]">Email Address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} strokeWidth={1.5} />
              </div>
              <input 
                type="email" 
                name="email"
                required
                placeholder="hello@example.com"
                className="w-full border border-[#EBE3D5] rounded-xl pl-11 pr-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#3A1E14]">Password</label>
              <a href="#" className="text-[12px] text-[#C89F5F] hover:underline font-medium">Forgot password?</a>
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
                className="w-full border border-[#EBE3D5] rounded-xl pl-11 pr-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#4A171E] hover:bg-[#330F13] disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium text-[15px] py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-6"
          >
            {isPending ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 text-center text-[13px] text-gray-500">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#4A171E] font-bold hover:underline">
            Create one
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
