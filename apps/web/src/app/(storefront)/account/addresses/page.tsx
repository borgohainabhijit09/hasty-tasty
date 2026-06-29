"use client";

import { Plus, Edit2, Trash2, Home, Briefcase, MapPin, Loader2, X, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function AddressesPage() {
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "HOME",
    address: "",
    city: "",
    state: "Maharashtra",
    pinCode: ""
  });

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAddresses = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase.from('Address').select('*').eq('userId', user.id).order('type', { ascending: true });
      if (data) setAddresses(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenEdit = (addr: any) => {
    setEditId(addr.id);
    setFormData({
      type: addr.type,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({ type: "HOME", address: "", city: "", state: "Maharashtra", pinCode: "" });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    const supabase = createClient();
    
    if (editId) {
      // Update
      const { error } = await supabase.from('Address').update({
        type: formData.type,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode
      }).eq('id', editId);
      
      if (!error) {
        setIsModalOpen(false);
        fetchAddresses();
      } else {
        alert("Failed to update address");
      }
    } else {
      // Insert
      const cuid = 'a' + Math.random().toString(36).substring(2, 10);
      const { error } = await supabase.from('Address').insert({
        id: cuid,
        userId: user.id,
        type: formData.type,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode
      });
      
      if (!error) {
        setIsModalOpen(false);
        fetchAddresses();
      } else {
        alert("Failed to save address");
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const supabase = createClient();
    await supabase.from('Address').delete().eq('id', deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    fetchAddresses();
  };

  const getIcon = (type: string) => {
    if (type === 'HOME') return <Home size={16} />;
    if (type === 'WORK') return <Briefcase size={16} />;
    return <MapPin size={16} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#C89F5F]">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl text-[#3A1E14]">My Addresses</h2>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#3A1E14] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#2A140B] transition-colors"
        >
          <Plus size={16} /> Add New Address
        </button>
      </div>
      
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#FAF8F5] rounded-full text-[#C89F5F] flex items-center justify-center mb-4">
            <MapPin size={24} />
          </div>
          <h3 className="font-bold text-lg text-[#3A1E14] mb-2">No Saved Addresses</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">You haven't added any addresses yet. Add one now to make your checkout experience faster!</p>
          <button 
            onClick={handleOpenAdd}
            className="border-2 border-[#C89F5F] text-[#5c2a1c] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#C89F5F] hover:text-white transition-colors"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr, idx) => (
            <div key={addr.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative flex flex-col group">
              {idx === 0 && (
                <span className="absolute top-0 right-0 bg-[#C89F5F] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg rounded-tr-xl">
                  Default
                </span>
              )}
              <h3 className="font-bold text-[#3A1E14] mb-2 flex items-center gap-2">
                {getIcon(addr.type)} {addr.type}
              </h3>
              <div className="text-gray-600 text-sm space-y-1 mb-6 flex-1">
                <p className="font-bold text-[#3A1E14]">{user?.user_metadata?.name || "Customer"}</p>
                <p>{addr.address}</p>
                <p>{addr.city}, {addr.state} - {addr.pinCode}</p>
              </div>
              <div className="flex gap-4 border-t border-gray-100 pt-4">
                <button 
                  onClick={() => handleOpenEdit(addr)}
                  className="text-sm font-medium text-[#C89F5F] flex items-center gap-1 hover:text-[#5c2a1c] transition-colors"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => setDeleteId(addr.id)}
                  className="text-sm font-medium text-gray-600 flex items-center gap-1 hover:text-red-500 ml-auto transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}

          {/* Add New Card Slot */}
          <button 
            onClick={handleOpenAdd}
            className="bg-[#FAF8F5] rounded-2xl border-2 border-dashed border-[#EAE2DB] flex flex-col items-center justify-center text-gray-400 hover:text-[#C89F5F] hover:border-[#C89F5F] transition-colors p-6 min-h-[200px] group"
          >
            <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="font-bold text-sm text-[#3A1E14] group-hover:text-[#5c2a1c]">Add New Address</span>
          </button>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-heading font-bold text-xl text-[#3A1E14]">
                  {editId ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Address Type</label>
                  <select 
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Street Address</label>
                  <textarea 
                    value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                    rows={2} required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                    <input 
                      type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Pincode</label>
                    <input 
                      type="text" value={formData.pinCode} onChange={(e) => setFormData({...formData, pinCode: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">State</label>
                  <select
                    value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                    required
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" disabled={isSaving}
                  className="w-full mt-4 bg-[#5c2a1c] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#3A1E14] flex justify-center disabled:opacity-70"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : (editId ? 'Save Changes' : 'Save Address')}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-xl z-50 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertTriangle size={28} />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#3A1E14] mb-2">Delete Address?</h3>
              <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this address? This action cannot be undone.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-colors flex justify-center items-center"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
