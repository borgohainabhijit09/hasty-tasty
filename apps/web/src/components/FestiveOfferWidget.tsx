"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import Link from "next/link";

export default function FestiveOfferWidget() {
  const [modalState, setModalState] = useState<"loading" | "open" | "closed">("loading");
  const [hasMounted, setHasMounted] = useState(false);
  
  // Banner Settings State
  const [bannerConfig, setBannerConfig] = useState({
    bannerActive: false,
    bannerTitle: "",
    bannerSubtitle: "",
    bannerText: "",
    bannerImageUrl: "",
    bannerLinkUrl: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    let timer: NodeJS.Timeout;
    
    const fetchSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        // prevent caching to ensure live updates
        const res = await fetch(`${apiUrl}/api/settings`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setBannerConfig(data);
          
          if (data.bannerActive) {
            const dismissedState = sessionStorage.getItem("festive-modal-dismissed");
            if (!dismissedState) {
              // Delay modal entrance, keep icon hidden during delay
              timer = setTimeout(() => setModalState("open"), 800);
            } else {
              setModalState("closed");
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch banner settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    setModalState("closed");
    sessionStorage.setItem("festive-modal-dismissed", "true");
  };

  const handleReopen = () => {
    setModalState("open");
  };

  if (!hasMounted || isLoading || !bannerConfig.bannerActive) return null;

  return (
    <>
      {/* FULL SCREEN MODAL */}
      <AnimatePresence>
        {modalState === "open" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[800px] h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/20"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Left Side - Image */}
              <div className="w-full md:w-1/2 h-[200px] md:h-full relative shrink-0">
                <img 
                  src={bannerConfig.bannerImageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1089&auto=format&fit=crop"} 
                  alt={bannerConfig.bannerTitle} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
              </div>

              {/* Right Side - Content */}
              <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-[#2A140B] to-[#1A0C06] flex flex-col items-center justify-center p-8 md:p-12 text-center">
                <Gift size={48} className="text-[#C89F5F] mb-6 animate-pulse hidden md:block" />
                
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
                  {bannerConfig.bannerTitle}
                </h2>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#C89F5F] mb-6">
                  {bannerConfig.bannerSubtitle}
                </h3>
                
                <p className="text-gray-300 text-sm md:text-base mb-8 leading-relaxed max-w-[280px]">
                  {bannerConfig.bannerText}
                </p>

                <Link 
                  href={bannerConfig.bannerLinkUrl || "/shop"}
                  onClick={handleDismiss} 
                  className="w-full sm:w-auto px-8 py-3 bg-[#C89F5F] hover:bg-white text-[#3A1E14] font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  Shop The Offer
                </Link>
                
                <button onClick={handleDismiss} className="mt-6 text-gray-400 hover:text-white text-xs underline underline-offset-4 transition-colors">
                  No thanks, continue shopping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING PERSISTENT WIDGET */}
      <AnimatePresence>
        {modalState === "closed" && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            onClick={handleReopen}
            className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 w-14 h-14 bg-gradient-to-br from-[#C89F5F] to-[#A67E43] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform group border-2 border-white/50"
            aria-label="Reopen Festive Offer"
          >
            <Gift size={24} className="group-hover:animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
