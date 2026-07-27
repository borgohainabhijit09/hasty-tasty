"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDownToLine, Share, PlusSquare, Info } from "lucide-react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered successfully:", reg.scope))
        .catch((err) => console.error("Service Worker registration failed:", err));
    }

    // 2. Check if already running in standalone mode (installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("pwa_dismissed") === "true";
    setDismissed(isDismissed);

    // 3. Detect iOS
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);
    };
    detectIOS();

    // 4. Listen for browser's install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.matchMedia("(display-mode: standalone)").addListener((e) => {
      setIsStandalone(e.matches);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If the browser hasn't fired the event, show a helpful tip
      setShowTip(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_dismissed", "true");
    setDismissed(true);
  };

  // Prevent rendering on server or if already installed/dismissed in this session
  if (!mounted || isStandalone || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-[#21050A] z-[99999] flex flex-col items-center justify-center p-6 text-center text-[#FAF8F5]">
      {/* Decorative background elements */}
      <div className="absolute top-10 w-[300px] h-[300px] rounded-full border border-[#C89F5F]/10 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-10 w-[400px] h-[400px] rounded-full border border-[#C89F5F]/5 translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="relative w-48 h-20 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <Image
              src="/images/logo.png"
              alt="Hasty Tasty Logo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <p className="text-[#C89F5F] tracking-[0.2em] text-[11px] font-bold uppercase">
            Premium Luxury Bakery
          </p>
          <h2 className="text-3xl font-heading font-bold text-white leading-tight">
            Install the App <br />
            to Continue
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed max-w-xs mx-auto">
            To enjoy a faster, offline-capable, and premium experience, please install the Hasty Tasty app on your device.
          </p>
        </div>

        {/* Content depending on OS */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 space-y-5">
          {isIOS ? (
            // iOS Instructions
            <div className="space-y-4 text-left">
              <p className="text-sm font-semibold text-[#C89F5F] border-b border-white/10 pb-2">
                How to install on iOS (Safari):
              </p>
              <ol className="text-xs space-y-3 text-gray-200 list-decimal pl-4">
                <li className="leading-relaxed">
                  Tap the <strong className="text-white inline-flex items-center gap-1">Share <Share size={14} className="text-[#C89F5F]" /></strong> button at the bottom of your Safari screen.
                </li>
                <li className="leading-relaxed">
                  Scroll down and tap <strong className="text-white inline-flex items-center gap-1">Add to Home Screen <PlusSquare size={14} className="text-[#C89F5F]" /></strong>.
                </li>
                <li className="leading-relaxed">
                  Tap <strong className="text-white">Add</strong> in the top-right corner to confirm.
                </li>
              </ol>
            </div>
          ) : (
            // Android / Desktop Install Button
            <div className="space-y-4">
              <button
                onClick={handleInstallClick}
                className="w-full bg-[#C89F5F] hover:bg-[#b0884b] text-[#21050A] font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02]"
              >
                <ArrowDownToLine size={18} />
                Install Hasty Tasty
              </button>

              {showTip && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2 text-left">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p>
                    If the prompt didn't open, look for the <strong>Install</strong> icon in your browser's address bar, or open your browser menu (three dots) and select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </p>
                </div>
              )}

              <p className="text-[10px] text-gray-400">
                Installs instantly as a lightweight app on your home screen.
              </p>
            </div>
          )}
        </div>

        {/* Temporary Dismiss Link for this Session */}
        <div>
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-white transition-colors underline cursor-pointer"
          >
            Or, continue in browser
          </button>
        </div>
      </div>
    </div>
  );
}
