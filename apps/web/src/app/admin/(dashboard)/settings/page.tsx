"use client";

import React from 'react';
import { 
  Store, CreditCard, Bell, Shield, MapPin, Save
} from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Settings</span>
          </div>
        </div>
        <button className="bg-[#3A1E14] hover:bg-[#2A080C] text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Navigation Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-white text-[#C89F5F] shadow-sm border border-gray-100 min-w-fit">
              <Store size={18} /> Store Details
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm hover:border hover:border-gray-100 border border-transparent transition-all min-w-fit">
              <MapPin size={18} /> Locations
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm hover:border hover:border-gray-100 border border-transparent transition-all min-w-fit">
              <CreditCard size={18} /> Payments
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm hover:border hover:border-gray-100 border border-transparent transition-all min-w-fit">
              <Bell size={18} /> Notifications
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm hover:border hover:border-gray-100 border border-transparent transition-all min-w-fit">
              <Shield size={18} /> Security
            </button>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">General Information</h2>
              <p className="text-sm text-gray-500">Update your store's basic details and branding.</p>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                  <input type="text" defaultValue="Hasty Tasty - Taster's Pride" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                  <input type="email" defaultValue="support@hastytasty.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input type="text" defaultValue="+91 98765 43210" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                <textarea rows={4} defaultValue="Premium luxury bakery offering fresh artisanal bread, rich chocolates, and customized cakes." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Store Status</h2>
                <p className="text-sm text-gray-500">Control if your store is visible to customers.</p>
              </div>
              <div className="w-12 h-6 bg-[#3A1E14] rounded-full flex items-center p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-6"></div>
              </div>
            </div>
            <div className="p-6">
               <p className="text-sm text-gray-600 bg-orange-50 border border-orange-100 rounded-lg p-4">
                 Your store is currently <strong>Online</strong>. Customers can view products and place orders. If you set it to Offline, customers will see a maintenance page.
               </p>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
