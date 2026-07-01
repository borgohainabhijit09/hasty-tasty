"use client";
 
import React, { useState } from 'react';
import { 
  Store, CreditCard, Bell, Shield, MapPin, Save, Lock, Mail, Phone, ToggleLeft, ToggleRight, Map, Check
} from 'lucide-react';
import Link from 'next/link';
 
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'locations' | 'payments' | 'notifications' | 'security'>('general');
  const [storeStatus, setStoreStatus] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [upiEnabled, setUpiEnabled] = useState(false);
  const [cardEnabled, setCardEnabled] = useState(false);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [b2bAlerts, setB2bAlerts] = useState(true);
  
  const [notification, setNotification] = useState<string | null>(null);

  const handleSave = () => {
    setNotification("Settings updated successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  const getTabClass = (tab: typeof activeTab) => {
    return activeTab === tab
      ? "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-white text-[#C89F5F] shadow-sm border border-gray-100 min-w-fit transition-all duration-200"
      : "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm hover:border hover:border-gray-100 border border-transparent transition-all min-w-fit duration-200";
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Settings</span>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-[#3A1E14] hover:bg-[#2A080C] text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all self-end shadow-sm"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Navigation Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-thin">
            <button onClick={() => setActiveTab('general')} className={getTabClass('general')}>
              <Store size={18} /> Store Details
            </button>
            <button onClick={() => setActiveTab('locations')} className={getTabClass('locations')}>
              <MapPin size={18} /> Locations
            </button>
            <button onClick={() => setActiveTab('payments')} className={getTabClass('payments')}>
              <CreditCard size={18} /> Payments
            </button>
            <button onClick={() => setActiveTab('notifications')} className={getTabClass('notifications')}>
              <Bell size={18} /> Notifications
            </button>
            <button onClick={() => setActiveTab('security')} className={getTabClass('security')}>
              <Shield size={18} /> Security
            </button>
          </nav>
        </div>
 
        {/* Settings Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
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
                      <input type="email" defaultValue="hastytastyglt@gmail.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                      <input type="text" defaultValue="+91 98644 02305" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" />
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
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Store Status</h2>
                    <p className="text-sm text-gray-500">Control if your store is visible to customers.</p>
                  </div>
                  <button 
                    onClick={() => setStoreStatus(!storeStatus)}
                    className="text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    {storeStatus ? (
                      <ToggleRight size={44} className="text-[#3A1E14]" />
                    ) : (
                      <ToggleLeft size={44} className="text-gray-300" />
                    )}
                  </button>
                </div>
                <div className="p-6">
                   <p className="text-sm text-gray-600 bg-orange-50/50 border border-orange-100 rounded-lg p-4">
                     Your store is currently <strong>{storeStatus ? "Online" : "Offline"}</strong>. Customers can {storeStatus ? "view products and place orders." : "only view a maintenance window."}
                   </p>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Store Locations</h2>
                <p className="text-sm text-gray-500">Configure physical store outlets and service regions.</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin size={16} className="text-[#C89F5F]" /> Base Headquarters Address
                  </h3>
                  <div className="grid grid-cols-1 gap-4 bg-[#FAF8F5] p-5 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <label className="block text-gray-500 font-medium mb-1">Full Physical Address</label>
                      <input type="text" defaultValue="Hasty Tasty, Main Road, Golaghat, Assam" className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-xs font-bold focus:outline-none focus:border-[#C89F5F]" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-500 font-medium mb-1">City</label>
                        <input type="text" defaultValue="Golaghat" className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-xs font-bold focus:outline-none focus:border-[#C89F5F]" />
                      </div>
                      <div>
                        <label className="block text-gray-500 font-medium mb-1">State</label>
                        <input type="text" defaultValue="Assam" className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-xs font-bold focus:outline-none focus:border-[#C89F5F]" />
                      </div>
                      <div>
                        <label className="block text-gray-500 font-medium mb-1">Pincode</label>
                        <input type="text" defaultValue="785621" className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-xs font-bold focus:outline-none focus:border-[#C89F5F]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Map size={16} className="text-[#C89F5F]" /> Delivery Zones & Location Pricing
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Product prices adjust dynamically based on shipping rates set in the <Link href="/admin/shipping" className="text-[#C89F5F] font-bold hover:underline">Shipping Rates panel</Link>. Delivery to the Golaghat pincode <strong>785***</strong> is always exempt from markup.
                  </p>
                  <div className="bg-yellow-50/50 border border-yellow-100 text-yellow-800 p-4 rounded-xl text-xs space-y-2 leading-relaxed">
                    <p><strong>💡 Dynamic Pricing Logic Activated:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Local (Starts with 785): Standard Base Prices.</li>
                      <li>Outside Local Pincode: Standard Base Price + (State Shipping Fee / Total Quantity).</li>
                      <li>Calculated in storefront Checkout, displaying <strong>FREE Shipping</strong> to customers.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Payment Gateways</h2>
                <p className="text-sm text-gray-500">Configure how customers pay for orders.</p>
              </div>
              <div className="p-6 space-y-4">
                
                {/* Method 1 */}
                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">₹</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-500">Accept cash or payment on delivery.</p>
                    </div>
                  </div>
                  <button onClick={() => setCodEnabled(!codEnabled)}>
                    {codEnabled ? <ToggleRight size={38} className="text-[#3A1E14]" /> : <ToggleLeft size={38} className="text-gray-300" />}
                  </button>
                </div>

                {/* Method 2 */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><CreditCard size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Credit / Debit Card <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal ml-1">COMING SOON</span></p>
                      <p className="text-xs text-gray-500">Authorize credit card payments via Razorpay.</p>
                    </div>
                  </div>
                  <button onClick={() => setCardEnabled(!cardEnabled)} disabled>
                    {cardEnabled ? <ToggleRight size={38} className="text-gray-300" /> : <ToggleLeft size={38} className="text-gray-200" />}
                  </button>
                </div>

                {/* Method 3 */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">UPI</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">UPI / QR Code <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal ml-1">COMING SOON</span></p>
                      <p className="text-xs text-gray-500">Accept direct payment via GooglePay, PhonePe, Paytm.</p>
                    </div>
                  </div>
                  <button onClick={() => setUpiEnabled(!upiEnabled)} disabled>
                    {upiEnabled ? <ToggleRight size={38} className="text-gray-300" /> : <ToggleLeft size={38} className="text-gray-200" />}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Email Notifications</h2>
                <p className="text-sm text-gray-500">Manage dispatch triggers and system alert configurations.</p>
              </div>
              <div className="p-6 space-y-6">
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Recipient Admin Email</label>
                  <input type="email" defaultValue="hastytastyglt@gmail.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" />
                  <p className="text-[11px] text-gray-400 mt-1">This email receives B2B applications and new order details.</p>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Notification Triggers</h3>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-gray-900">New Order Alert</p>
                      <p className="text-[11px] text-gray-500">Email full B2C invoice and address details on order placement.</p>
                    </div>
                    <button onClick={() => setOrderAlerts(!orderAlerts)}>
                      {orderAlerts ? <ToggleRight size={38} className="text-[#3A1E14]" /> : <ToggleLeft size={38} className="text-gray-300" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-gray-900">New B2B Inquiry Alert</p>
                      <p className="text-[11px] text-gray-500">Email complete wholesale registration sheets and GST specifications.</p>
                    </div>
                    <button onClick={() => setB2bAlerts(!b2bAlerts)}>
                      {b2bAlerts ? <ToggleRight size={38} className="text-[#3A1E14]" /> : <ToggleLeft size={38} className="text-gray-300" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Update password and configure portal authentication details.</p>
              </div>
              <div className="p-6 space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-xs focus:outline-none focus:border-[#C89F5F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">New Password</label>
                  <input type="password" placeholder="Min. 8 characters" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-xs focus:outline-none focus:border-[#C89F5F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-xs focus:outline-none focus:border-[#C89F5F]" />
                </div>
                <button 
                  onClick={handleSave}
                  className="bg-[#3A1E14] text-white px-5 py-2.5 rounded-lg text-xs font-bold mt-2 hover:bg-[#2A080C] transition-all"
                >
                  Change Password
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Save Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5 duration-350">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-lg">
            <Check size={16} />
            <span>{notification}</span>
          </div>
        </div>
      )}
      
    </div>
  );
}
