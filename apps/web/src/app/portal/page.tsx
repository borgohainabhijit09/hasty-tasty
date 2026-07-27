"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, ArrowRight, Home } from 'lucide-react';
import Image from 'next/image';

export default function PortalPage() {
  const portals = [
    {
      title: "Customer Storefront",
      description: "Browse the menu, place orders, and manage your account.",
      icon: <ShoppingBag size={32} className="text-[#C89F5F]" />,
      href: "/",
      color: "bg-[#FDFBF7]",
      borderColor: "border-[#C89F5F]/20"
    },
    {
      title: "Admin Dashboard",
      description: "Manage products, orders, categories, and staff.",
      icon: <ShieldCheck size={32} className="text-[#4A171E]" />,
      href: "/admin",
      color: "bg-red-50",
      borderColor: "border-[#4A171E]/20"
    },
    {
      title: "Delivery Portal",
      description: "View assigned orders and update delivery statuses in real-time.",
      icon: <Truck size={32} className="text-orange-600" />,
      href: "/delivery",
      color: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-3xl shadow-sm border border-[#C89F5F]/20 flex items-center justify-center overflow-hidden p-2">
          {/* Fallback icon if logo image fails, but using the existing logo path */}
          <Image 
            src="/images/logo.png" 
            alt="Hasty Tasty Logo" 
            width={80} 
            height={80} 
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl font-black text-[#21050A] mb-3 tracking-tight">Hasty Tasty Portal</h1>
        <p className="text-gray-600 max-w-sm mx-auto">
          Select your destination below to securely access your dedicated workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        {portals.map((portal, idx) => (
          <Link 
            key={idx} 
            href={portal.href}
            className={`group flex flex-col items-center text-center p-8 rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${portal.color} ${portal.borderColor}`}
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 transition-transform group-hover:scale-110">
              {portal.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{portal.title}</h2>
            <p className="text-sm text-gray-600 mb-8 flex-grow leading-relaxed">
              {portal.description}
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-bold bg-white px-5 py-2.5 rounded-full shadow-sm text-gray-900 group-hover:bg-[#21050A] group-hover:text-white transition-colors">
              Access Portal
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Hasty Tasty. All rights reserved.</p>
      </div>

    </div>
  );
}
