"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";
import { Menu, X, CreditCard, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { checkSession } from "./action";

const navigation = [
  { name: "Products", href: "/#products" },
  { name: "Industries", href: "/#industries" },
  { name: "Pricing", href: "/pricing" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [industriesDropdownOpen, setIndustriesDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [mobileIndustriesDropdownOpen, setMobileIndustriesDropdownOpen] = useState(false);
  const bodyRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const industriesDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const verifySession = async () => {
      const { isLoggedIn } = await checkSession();
      setIsLoggedIn(isLoggedIn);
      setIsAuthLoading(false);
    };
    verifySession();

    // Get the body element
    bodyRef.current = document.body;

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        industriesDropdownRef.current &&
        !industriesDropdownRef.current.contains(event.target as Node)
      ) {
        setIndustriesDropdownOpen(false);
      }
    };

    if (dropdownOpen || industriesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, industriesDropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (!bodyRef.current) return;

    if (mobileMenuOpen) {
      // Add a class to body that prevents scrolling
      bodyRef.current.classList.add("no-scroll");
    } else {
      // Remove the no-scroll class
      bodyRef.current.classList.remove("no-scroll");
    }

    return () => {
      if (bodyRef.current) {
        bodyRef.current.classList.remove("no-scroll");
      }
    };
  }, [mobileMenuOpen]);

  const AuthButtons = () => {
    if (isAuthLoading) {
      // Reserve space with invisible placeholder to prevent layout shift
      return (
        <div className="inline-flex justify-end items-center gap-4 opacity-0 pointer-events-none">
          <span className="text-base font-medium leading-6">Log In</span>
          <div className="px-4 py-3 rounded">
            <span className="text-base font-bold uppercase leading-6">
              start a free trial
            </span>
          </div>
        </div>
      );
    }

    return isLoggedIn ? (
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
      <div
        data-state="Default"
        className="inline-flex justify-end items-center gap-4"
      >
        <Link
          href="/sign-in"
          className="text-white text-base font-medium font-['Inter'] leading-6  "
        >
          Log In
        </Link>
        <Link href="/sign-up">
          <div className="px-4 py-3 bg-[#e3b02f] rounded flex justify-start items-start gap-2 overflow-hidden hover:bg-amber-500 transition-colors">
            <div className="text-center justify-start text-stone-800 text-base font-bold font-['Inter'] uppercase leading-6">
              start a free trial
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <>
      <header className="w-full bg-[#141414] backdrop-blur-none shadow-[0_4px_20px_rgba(0,0,0,0.9),0_0_30px_rgba(253,176,34,0.2)] border-yellow-600/50 relative z-[9999]">
        <nav className="w-full px-4 md:px-12" aria-label="Global">
          <div className="relative flex items-center justify-between py-3 md:py-[13px]">
            <Link href="/" className="flex items-center gap-3 z-10">
              <div className="w-full h-full rounded-xl flex items-center justify-center">
                <Image
                  src={"/images/logos/logosledge.png"}
                  alt="Logo"
                  width={48}
                  height={48}
                />
              </div>
              <span className="uppercase text-white text-2xl font-bold font-['League_Spartan'] leading-6">
                SLEDGE
              </span>
            </Link>

            <div className="hidden lg:flex lg:items-center lg:gap-8 2xl:gap-12 absolute left-1/2 -translate-x-1/2">
              {navigation.map((item) =>
                item.name === "Products" ? (
                  <div key={item.name} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="text-white font-medium transition-colors duration-300 uppercase text-sm flex items-center gap-2 cursor-pointer"
                    >
                      {item.name}
                      <img
                        src="/images/logos/arrow-down.svg"
                        alt="dropdown arrow"
                        className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                        style={{
                          filter: "invert(1) brightness(0.8)",
                        }}
                      />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 z-[9999] w-64 p-4 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800">
                        <Link
                          href="/product"
                          onClick={(e) => {
                            setDropdownOpen(false);
                          }}
                          className="w-56 p-4 rounded-lg inline-flex justify-start items-center gap-2 hover:bg-amber-400/10 transition-colors cursor-pointer"
                        >
                          <img
                            src="/images/logos/roadmap.svg"
                            alt="roadmap"
                            className="w-6 h-6"
                            style={{
                              filter:
                                "brightness(0) saturate(100%) invert(72%) sepia(68%) saturate(1455%) hue-rotate(4deg)",
                            }}
                          />
                          <div className="justify-start text-amber-400 text-base font-medium font-sans capitalize leading-6">
                            Product overview
                          </div>
                        </Link>
                        <Link
                          href="/product/ai-accounts-payable"
                          onClick={(e) => {
                            setDropdownOpen(false);
                          }}
                          className="w-56 p-4 rounded-lg inline-flex justify-start items-center gap-2 hover:bg-amber-400/10 transition-colors cursor-pointer"
                        >
                          <img
                            src="/images/logos/DocumentScan.svg"
                            alt="document scan"
                            className="w-6 h-6"
                            style={{
                              filter:
                                "brightness(0) saturate(100%) invert(72%) sepia(68%) saturate(1455%) hue-rotate(4deg)",
                            }}
                          />
                          <div className="justify-start text-amber-400 text-base font-medium font-sans capitalize leading-6">
                            AI Accounts Payable
                          </div>
                        </Link>
                        <Link
                          href="/integration"
                          onClick={(e) => {
                            setDropdownOpen(false);
                          }}
                          className="w-56 p-4 rounded-lg inline-flex justify-start items-center gap-2 hover:bg-amber-400/10 transition-colors cursor-pointer"
                        >
                          <img
                            src="/images/logos/Connect.svg"
                            alt="connect"
                            className="w-6 h-6"
                            style={{
                              filter:
                                "brightness(0) saturate(100%) invert(72%) sepia(68%) saturate(1455%) hue-rotate(4deg)",
                            }}
                          />
                          <div className="justify-start text-amber-400 text-base font-medium font-sans capitalize leading-6">
                            Integrations
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : item.name === "Industries" ? (
                  <div
                    key={item.name}
                    className="relative"
                    ref={industriesDropdownRef}
                  >
                    <button
                      onClick={() =>
                        setIndustriesDropdownOpen(!industriesDropdownOpen)
                      }
                      className="text-white font-medium transition-colors duration-300 uppercase text-sm flex items-center gap-2 cursor-pointer"
                    >
                      {item.name}
                      <img
                        src="/images/logos/arrow-down.svg"
                        alt="dropdown arrow"
                        className={`w-4 h-4 transition-transform duration-300 ${
                          industriesDropdownOpen ? "rotate-180" : ""
                        }`}
                        style={{
                          filter: "invert(1) brightness(0.8)",
                        }}
                      />
                    </button>
                    {industriesDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 z-[9999] w-64 p-4 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 inline-flex flex-col justify-start items-start overflow-hidden">
                        <Link
                          href="/industries/construction"
                          onClick={(e) => {
                            setIndustriesDropdownOpen(false);
                          }}
                          className="w-56 p-4 rounded-lg inline-flex justify-start items-center gap-2 hover:bg-amber-400/10 transition-colors cursor-pointer"
                        >
                          <div className="justify-start text-amber-400 text-base font-medium font-sans capitalize leading-6">
                            Construction
                          </div>
                        </Link>
                        <Link
                          href="/industries/concrete"
                          onClick={(e) => {
                            setIndustriesDropdownOpen(false);
                          }}
                          className="w-56 p-4 rounded-lg inline-flex justify-start items-center gap-2 hover:bg-amber-400/10 transition-colors cursor-pointer"
                        >
                          <div className="justify-start text-amber-400 text-base font-medium font-sans capitalize leading-6">
                            Concrete
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-white font-medium transition-colors duration-300 uppercase text-sm"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>

            <div className="hidden lg:flex lg:items-center lg:gap-4 2xl:gap-6 z-10">
              <AuthButtons />
            </div>

            <div className="flex lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2.5 text-white hover:text-yellow-400 z-50 relative"
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
              className="fixed inset-0 z-40 lg:hidden pointer-events-none"
            >
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                onClick={() => setMobileMenuOpen(false)}
              />
            </motion.div>

            {/* Mobile menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-neutral-900 shadow-2xl shadow-yellow-500/20 border-l-4 border-yellow-600/30 lg:hidden pointer-events-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-yellow-600/30 bg-neutral-900">
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
                    className="rounded-md p-2 text-gray-300 hover:bg-neutral-800 hover:text-yellow-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 bg-neutral-900">
                  <div className="px-6 space-y-2">
                    {navigation.map((item) =>
                      item.name === "Products" ? (
                        <div key={item.name}>
                          <button
                            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                            className="w-full text-left block rounded-lg px-4 py-3 text-lg font-semibold text-gray-300 hover:bg-neutral-800 transition-colors duration-200 border-2 border-transparent hover:border-yellow-600/30 uppercase flex items-center justify-between"
                          >
                            {item.name}
                            <img
                              src="/images/logos/arrow-down.svg"
                              alt="dropdown arrow"
                              className={`w-4 h-4 transition-transform duration-300 ${mobileDropdownOpen ? "rotate-180" : ""}`}
                              style={{
                                filter: "invert(1) brightness(0.8)",
                              }}
                            />
                          </button>
                          {mobileDropdownOpen && (
                            <div className="mt-2 ml-4 space-y-2">
                              <Link
                                href="/product"
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-amber-400 hover:bg-neutral-800 transition-colors duration-200 border-2 border-transparent hover:border-yellow-600/30"
                              >
                                <img
                                  src="/images/logos/roadmap.svg"
                                  alt="roadmap"
                                  className="w-5 h-5"
                                  style={{
                                    filter:
                                      "brightness(0) saturate(100%) invert(72%) sepia(68%) saturate(1455%) hue-rotate(4deg)",
                                  }}
                                />
                                Product overview
                              </Link>
                              <Link
                                href="/product/ai-accounts-payable"
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-amber-400 hover:bg-neutral-800 transition-colors duration-200 border-2 border-transparent hover:border-yellow-600/30"
                              >
                                <img
                                  src="/images/logos/DocumentScan.svg"
                                  alt="document scan"
                                  className="w-5 h-5"
                                  style={{
                                    filter:
                                      "brightness(0) saturate(100%) invert(72%) sepia(68%) saturate(1455%) hue-rotate(4deg)",
                                  }}
                                />
                                AI Accounts Payable
                              </Link>
                              <Link
                                href="/integration"
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-amber-400 hover:bg-neutral-800 transition-colors duration-200 border-2 border-transparent hover:border-yellow-600/30"
                              >
                                <img
                                  src="/images/logos/Connect.svg"
                                  alt="connect"
                                  className="w-5 h-5"
                                  style={{
                                    filter:
                                      "brightness(0) saturate(100%) invert(72%) sepia(68%) saturate(1455%) hue-rotate(4deg)",
                                  }}
                                />
                                Integrations
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : item.name === "Industries" ? (
                        <div key={item.name}>
                          <button
                            onClick={() =>
                              setMobileIndustriesDropdownOpen(!mobileIndustriesDropdownOpen)
                            }
                            className="w-full text-left block rounded-lg px-4 py-3 text-lg font-semibold text-gray-300 hover:bg-neutral-800 transition-colors duration-200 border-2 border-transparent hover:border-yellow-600/30 uppercase flex items-center justify-between"
                          >
                            {item.name}
                            <img
                              src="/images/logos/arrow-down.svg"
                              alt="dropdown arrow"
                              className={`w-4 h-4 transition-transform duration-300 ${
                                mobileIndustriesDropdownOpen ? "rotate-180" : ""
                              }`}
                              style={{
                                filter: "invert(1) brightness(0.8)",
                              }}
                            />
                          </button>
                          {mobileIndustriesDropdownOpen && (
                            <div className="mt-2 ml-4 space-y-2">
                              <Link
                                href="/industries/construction"
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileIndustriesDropdownOpen(false);
                                }}
                                className="block rounded-lg px-4 py-3 text-base font-semibold text-amber-400 hover:bg-neutral-800 transition-colors duration-200 border-2 border-transparent hover:border-yellow-600/30"
                              >
                                Construction
                              </Link>
                              <Link
                                href="/industries/concrete"
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileIndustriesDropdownOpen(false);
                                }}
                                className="block rounded-lg px-4 py-3 text-base font-semibold text-amber-400 hover:bg-neutral-800 transition-colors duration-200 border-2 border-transparent hover:border-yellow-600/30"
                              >
                                Concrete
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-lg px-4 py-3 text-lg font-semibold text-gray-300 hover:bg-neutral-800 transition-colors duration-200 border-2 border-transparent hover:border-yellow-600/30 uppercase"
                        >
                          {item.name}
                        </Link>
                      )
                    )}
                  </div>
                </div>

                {/* Auth Buttons */}
                <div className="p-6 border-t-2 border-yellow-600/30 bg-neutral-800">
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
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
