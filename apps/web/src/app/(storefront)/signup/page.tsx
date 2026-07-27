"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { useState, useEffect } from "react";
import { signup } from "../login/actions";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [isB2B, setIsB2B] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redir = params.get("redirect");
      if (redir) {
        setRedirectTo(redir);
      }
      if (params.get("b2b") === "true") {
        setIsB2B(true);
      }
    }
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Switch between regular and b2b signup actions
      let result;
      if (isB2B) {
        const { b2bSignup } = await import('../login/actions');
        result = await b2bSignup(formData);
        if (result?.success) {
          setSuccess("Thank you! Your B2B wholesale application has been submitted and is currently pending admin approval. We will contact you shortly.");
          setIsPending(false);
          return;
        }
      } else {
        const { signup } = await import('../login/actions');
        result = await signup(formData);
        if (result?.success) {
          window.location.replace(redirectTo);
          return;
        }
      }
      
      if (result?.error) {
        setError(result.error);
        setIsPending(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsPending(false);
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center bg-[#FAF8F5] py-20 px-4">
      <motion.div 
        className="max-w-[480px] w-full bg-white rounded-[24px] p-8 md:p-10 border border-[#F0EBE1] shadow-sm"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#3A1E14] mb-2">Create Account</h1>
          <p className="text-gray-500 text-[14px]">Join Hasty Tasty to place orders and more.</p>
        </div>

        <div className="flex bg-[#F0EBE1] p-1 rounded-xl mb-6">
          <button 
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${!isB2B ? 'bg-white shadow-sm text-[#3A1E14]' : 'text-gray-500 hover:text-[#3A1E14]'}`}
            onClick={() => setIsB2B(false)}
          >
            Customer
          </button>
          <button 
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${isB2B ? 'bg-white shadow-sm text-[#3A1E14]' : 'text-gray-500 hover:text-[#3A1E14]'}`}
            onClick={() => setIsB2B(true)}
          >
            Wholesale / B2B
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] p-3 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl text-center border border-green-100">
            {success}
            <div className="mt-4">
              <Link href="/login" className="text-[#C89F5F] font-semibold hover:underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 relative">
              <label className="text-[13px] font-semibold text-[#3A1E14]">Full Name *</label>
              <input 
                type="text" 
                name="name"
                required
                placeholder="John Doe"
                className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[13px] font-semibold text-[#3A1E14]">Email Address *</label>
              <input 
                type="email" 
                name="email"
                required
                placeholder="hello@example.com"
                className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[13px] font-semibold text-[#3A1E14]">Phone Number *</label>
              <input 
                type="tel" 
                name="phone"
                required
                placeholder="+91 98765 43210"
                className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#3A1E14]">Password *</label>
              <input 
                type="password" 
                name="password"
                required
                placeholder="Create a password"
                minLength={6}
                className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
              />
            </div>

            {isB2B && (
              <div className="pt-4 mt-4 border-t border-[#F0EBE1] space-y-4">
                <h3 className="text-sm font-bold text-[#3A1E14]">Business Information</h3>
                
                <div className="space-y-1.5 relative">
                  <label className="text-[13px] font-semibold text-[#3A1E14]">Registered Business Name *</label>
                  <input 
                    type="text" 
                    name="businessName"
                    required
                    placeholder="XYZ Enterprises Pvt Ltd"
                    className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 relative">
                    <label className="text-[13px] font-semibold text-[#3A1E14]">GST Number *</label>
                    <input 
                      type="text" 
                      name="gstNumber"
                      required
                      placeholder="22AAAAA0000A1Z5"
                      className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
                    />
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-[13px] font-semibold text-[#3A1E14]">Trade License</label>
                    <input 
                      type="text" 
                      name="tradeLicense"
                      placeholder="Optional"
                      className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[13px] font-semibold text-[#3A1E14]">Contact Person *</label>
                  <input 
                    type="text" 
                    name="contactPerson"
                    required
                    placeholder="John Doe"
                    className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C89F5F] transition-colors bg-[#FAF8F5]" 
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-[#4A171E] hover:bg-[#330F13] disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium text-[15px] py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-6"
            >
              {isPending ? 'Submitting...' : (isB2B ? 'Submit B2B Application' : 'Sign Up')} <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-[13px] text-gray-500">
          Already have an account?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-[#4A171E] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
