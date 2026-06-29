"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Save, Map, Search } from 'lucide-react';
import { saveShippingRates } from './actions';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", " तेलंगाना", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function AdminShippingPage() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRates = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('ShippingRate').select('*');
      if (data) {
        const rateMap: Record<string, number> = {};
        data.forEach(r => {
          rateMap[r.state] = r.rate;
        });
        setRates(rateMap);
      }
      setLoading(false);
    };
    fetchRates();
  }, []);

  const handleRateChange = (state: string, val: string) => {
    const numericVal = val === "" ? 0 : parseFloat(val);
    setRates(prev => ({
      ...prev,
      [state]: isNaN(numericVal) ? 0 : numericVal
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Use the Prisma Server Action which automatically handles IDs correctly
    const result = await saveShippingRates(rates);

    setSaving(false);
    
    if (!result.success) {
      alert("Failed to save shipping rates: " + result.error);
    } else {
      alert("Shipping rates updated successfully!");
    }
  };

  const filteredStates = INDIAN_STATES.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#C89F5F] w-10 h-10" />
          <p className="text-gray-500 font-medium">Loading Shipping Configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Rates</h1>
          <p className="text-sm text-gray-500">Configure flat shipping fees for each state. Set to 0 for Free Shipping.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#21050A] hover:bg-[#3D141C] text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-[#FAF8F5] flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search states..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C89F5F]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-8 md:col-span-6 pl-2 flex items-center gap-2">
            <Map size={14} /> State / Union Territory
          </div>
          <div className="col-span-4 md:col-span-6 text-right pr-4">
            Shipping Fee (₹)
          </div>
        </div>

        <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filteredStates.map(state => {
            const currentRate = rates[state] ?? 0;
            return (
              <div key={state} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#FAF8F5]/30 transition-colors">
                <div className="col-span-8 md:col-span-6 pl-2 font-medium text-gray-700">
                  {state}
                  {currentRate === 0 && <span className="ml-3 inline-flex px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold">FREE</span>}
                </div>
                <div className="col-span-4 md:col-span-6 flex justify-end pr-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input 
                      type="number" 
                      value={rates[state] ?? ''} 
                      onChange={(e) => handleRateChange(state, e.target.value)}
                      placeholder="0"
                      className="w-28 pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-[#C89F5F] font-medium"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
