"use client";

import { useState, useEffect } from "react";
import { Settings, X, Check } from "lucide-react";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    // Cookies will continue to work as they are currently implemented
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setIsVisible(false);
    // Cookies will continue to work as they are currently implemented
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="w-full">
        <div className="relative bg-[#141414] border-t border-gray-800 shadow-2xl overflow-hidden">

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 pr-16 md:pr-20">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[#e3b02f]/10 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-[#e3b02f] animate-[spin_8s_linear_infinite]" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold font-['Inter'] text-white">
                We Use Cookies to enhance your experience.{" "}
                <a
                  href="/privacy-policy"
                  className="text-[#e3b02f] hover:text-amber-400 underline underline-offset-2 transition-colors"
                >
                  Privacy Policy
                </a>
              </h3>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={handleReject}
                className="px-4 py-3 bg-transparent border border-gray-600 rounded flex justify-center items-center gap-2 hover:bg-gray-800 hover:border-gray-500 transition-all group cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                <span className="text-center text-gray-300 text-sm font-bold font-['Inter'] uppercase group-hover:text-white transition-colors">
                  Decline
                </span>
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-3 bg-[#e3b02f] rounded flex justify-center items-center gap-2 hover:bg-amber-500 transition-all group cursor-pointer"
              >
                <Check className="w-4 h-4 text-stone-800" />
                <span className="text-center text-stone-800 text-sm font-bold font-['Inter'] uppercase">
                  Accept
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
