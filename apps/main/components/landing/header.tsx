"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Menu, X, CreditCard, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { checkSession } from "./action";

const navigation = [
  { name: "Features", href: "/#features" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Use Cases", href: "/#use-cases" },
  { name: "About", href: "/#about" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const bodyRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const verifySession = async () => {
      const { isLoggedIn } = await checkSession();
      setIsLoggedIn(isLoggedIn);
    };
    verifySession();

    // Get the body element
    bodyRef.current = document.body;

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll without causing jump to top
  useEffect(() => {
    if (!bodyRef.current) return;

    if (mobileMenuOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY;

      // Add a class to body that prevents scrolling
      bodyRef.current.classList.add("no-scroll");

      // Set the top position to maintain scroll position visually
      bodyRef.current.style.top = `-${scrollY}px`;
    } else {
      // Get the saved scroll position from the top style
      const scrollY = Math.abs(parseInt(bodyRef.current.style.top || "0"));

      // Remove the no-scroll class
      bodyRef.current.classList.remove("no-scroll");

      // Reset the top style
      bodyRef.current.style.top = "";

      // Restore the scroll position
      window.scrollTo(0, scrollY);
    }

    return () => {
      if (bodyRef.current) {
        bodyRef.current.classList.remove("no-scroll");
        bodyRef.current.style.top = "";
      }
    };
  }, [mobileMenuOpen]);

  const AuthButtons = () =>
    isLoggedIn ? (
      <Button
        asChild
        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 font-bold px-6 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-400/40 transition-all duration-300 group uppercase border-2 border-yellow-600"
      >
        <Link href={"/dashboard"}>
          Go To Dashboard
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </Button>
    ) : (
      <>
        <Button
          asChild
          variant="ghost"
          className="text-gray-300 hover:text-yellow-400 font-medium hover:bg-gray-800 transition-colors duration-300"
        >
          <Link href={"/sign-in"}>Sign In</Link>
        </Button>
        <Button
          asChild
          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 font-bold px-6 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-400/40 transition-all duration-300 group uppercase border-2 border-yellow-600"
        >
          <Link href={"/sign-up"}>
            Start Free Trial
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </Button>
      </>
    );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b-4 ${
          scrolled
            ? "bg-gray-950/98 backdrop-blur-none shadow-[0_4px_20px_rgba(0,0,0,0.9),0_0_30px_rgba(253,176,34,0.2)] border-yellow-600/50"
            : "bg-gray-950/80 backdrop-blur-none border-yellow-600/20"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Global">
          <div className="flex items-center justify-between py-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-full h-full rounded-xl flex items-center justify-center">
                <Image
                  src={"/images/logos/sledge.png"}
                  alt="Logo"
                  width={70}
                  height={50}
                />
              </div>
              <div>
                {/* <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase">
                  SLEDGE
                </span> */}
              </div>
            </Link>

            <div className="hidden lg:flex lg:items-center lg:gap-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-300 uppercase text-sm"
                >
                  {item.name}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex lg:items-center lg:gap-4">
              <AuthButtons />
            </div>

            <div className="flex lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-300 hover:text-yellow-400 z-50 relative"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            </motion.div>

            {/* Mobile menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-gray-900 shadow-2xl shadow-yellow-500/20 border-l-4 border-yellow-600/30 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-yellow-600/30 bg-gray-900">
                  <Link
                    href="/"
                    className="flex items-center gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CreditCard className="h-8 w-8 text-yellow-500" />
                    <span className="text-xl font-bold text-white uppercase">
                      SLEDGE
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 bg-gray-900">
                  <div className="px-6 space-y-2">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block rounded-lg px-4 py-3 text-lg font-semibold text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors duration-200 border-2 border-transparent hover:border-yellow-600/30 uppercase"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          // Wait for menu to close before scrolling
                          setTimeout(() => {
                            const target = document.querySelector(item.href);
                            if (target) {
                              target.scrollIntoView({ behavior: "smooth" });
                            }
                          }, 300);
                        }}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Auth Buttons */}
                <div className="p-6 border-t-2 border-yellow-600/30 bg-gray-800">
                  <div className="space-y-3">
                    <AuthButtons />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add this CSS to your global styles */}
      <style jsx global>{`
        body.no-scroll {
          position: fixed;
          width: 100%;
          overflow-y: scroll;
        }
      `}</style>
    </>
  );
}
