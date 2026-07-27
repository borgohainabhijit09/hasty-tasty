"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SuggestionWidget() {
  const [userId, setUserId] = useState<string>("guest");
  const [suggestionCategory, setSuggestionCategory] = useState("Recipe Idea");
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    } else {
      setUserId("guest");
    }
  }, [session]);

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionMessage.trim()) return;

    setIsSubmittingSuggestion(true);
    setSuggestionError("");
    setSuggestionSuccess(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const notesPrefix = userId === "guest" ? "[GUEST SUGGESTION]" : "[SUGGESTION]";
      const res = await fetch(`${apiUrl}/api/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          notes: `${notesPrefix} Category: ${suggestionCategory}\nMessage: ${suggestionMessage}`,
          items: []
        })
      });

      if (res.ok) {
        setSuggestionSuccess(true);
        setSuggestionMessage("");
      } else {
        setSuggestionError("Failed to submit your suggestion. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setSuggestionError("An error occurred. Please check your internet connection.");
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  return (
    <>
      {/* Floating Suggestion Button */}
      <button
        onClick={() => setIsSuggestionModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#C89F5F] hover:bg-[#b08b50] text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group focus:outline-none"
        title="Send Suggestion"
      >
        <Lightbulb size={24} className="transition-transform group-hover:rotate-12 duration-200" />
        <span className="absolute right-16 bg-[#3A1E14] text-white text-[10px] px-3 py-1.5 rounded-lg shadow-md font-bold whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none origin-right">
          Suggestions Box
        </span>
      </button>

      {/* Suggestion Modal */}
      {isSuggestionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-250">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAE2DB]/40 flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Lightbulb size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#3A1E14]">Baker's Suggestion Box</h3>
                  <p className="text-[10px] text-gray-500 font-medium">We read every idea to improve Hasty Tasty</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSuggestionModalOpen(false);
                  setSuggestionSuccess(false);
                  setSuggestionError("");
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {suggestionSuccess ? (
                <div className="text-center py-6 animate-in fade-in duration-300">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="font-bold text-[#3A1E14] text-base">Thank You for Your Suggestion!</h4>
                  <p className="text-gray-500 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                    We appreciate you taking the time to share your feedback. Our team will review your ideas shortly!
                  </p>
                  <button
                    onClick={() => setSuggestionSuccess(false)}
                    className="mt-6 bg-[#C89F5F] hover:bg-[#b08b50] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors"
                  >
                    Write Another Suggestion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                  {suggestionError && (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-2 text-rose-700 font-medium">
                      <AlertTriangle size={16} />
                      {suggestionError}
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={suggestionCategory}
                      onChange={(e) => setSuggestionCategory(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-[#3A1E14] font-medium focus:outline-none focus:border-[#C89F5F] text-xs"
                    >
                      <option value="Recipe Idea">Recipe Idea (e.g. Sugar-free cakes)</option>
                      <option value="Packaging Suggestion">Packaging Suggestion</option>
                      <option value="Delivery Feedback">Delivery & Shipping Feedback</option>
                      <option value="Website Improvement">Website Feature Request</option>
                      <option value="General Feedback">General Feedback & Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">Your Suggestion / Feedback</label>
                    <textarea
                      rows={5}
                      value={suggestionMessage}
                      onChange={(e) => setSuggestionMessage(e.target.value)}
                      placeholder="Share your ideas to help us improve..."
                      required
                      maxLength={1000}
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#C89F5F] placeholder-gray-400 leading-relaxed text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuggestionModalOpen(false);
                        setSuggestionError("");
                      }}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingSuggestion || !suggestionMessage.trim()}
                      className="bg-[#C89F5F] hover:bg-[#b08b50] text-white px-6 py-2 rounded-xl font-bold shadow-sm disabled:opacity-50 transition-all flex items-center gap-2 text-xs"
                    >
                      {isSubmittingSuggestion ? "Submitting..." : (
                        <>
                          <Send size={12} />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
