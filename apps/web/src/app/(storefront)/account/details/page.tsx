"use client";

import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AccountDetailsPage() {
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        // Fetch from custom User table which stores phone
        const { data: dbUser } = await supabase.from('User').select('*').eq('id', user.id).single();
        
        if (dbUser) {
          const names = dbUser.name ? dbUser.name.split(' ') : [""];
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(' ') || "");
          setPhone(dbUser.phone || "");
        } else {
          // Fallback to auth metadata if User table record missing
          const names = user.user_metadata?.name ? user.user_metadata.name.split(' ') : [""];
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(' ') || "");
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg("");
    
    const fullName = `${firstName} ${lastName}`.trim();
    const supabase = createClient();

    try {
      // 1. Update Custom User Table
      const { error: dbError } = await supabase
        .from('User')
        .update({ name: fullName, phone: phone })
        .eq('id', user.id);

      if (dbError) throw new Error(dbError.message);

      // 2. Update Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: fullName }
      });

      if (authError) throw new Error(authError.message);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-bold text-3xl text-[#5c2a1c]">Account Details</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <form className="space-y-8" onSubmit={handleSubmit}>
          
          {/* Personal Information */}
          <div>
            <h3 className="font-bold text-[#3A1E14] mb-4 pb-2 border-b border-gray-50 text-lg">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F] transition-shadow text-[#3A1E14]"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F] transition-shadow text-[#3A1E14]"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-bold text-[#3A1E14] mb-4 pb-2 border-b border-gray-50 text-lg">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  Email Address
                  <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px]">Verified</span>
                </label>
                <input 
                  type="email" 
                  value={user?.email || ""}
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Email address cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F] transition-shadow text-[#3A1E14]"
                />
              </div>
            </div>
          </div>

          {/* Password (UI Only for now, backend logic would require separate auth endpoint) */}
          <div>
            <h3 className="font-bold text-[#3A1E14] mb-4 pb-2 border-b border-gray-50 text-lg">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                  disabled
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Coming soon..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions & Feedback */}
          {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}
          
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            {saveSuccess && (
              <span className="text-green-600 text-sm font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={16} /> Saved Successfully
              </span>
            )}
            
            <button type="submit" disabled={isSaving} className="px-6 py-3 bg-[#5c2a1c] text-white font-bold text-sm rounded-xl hover:bg-[#3A1E14] transition-colors flex items-center gap-2 shadow-lg shadow-[#5c2a1c]/20 disabled:opacity-70">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
