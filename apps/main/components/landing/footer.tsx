import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  ProfessionalWave,
  FloatingElements,
  GeometricPattern,
  ProfessionalIcons,
} from "./animated-icons";
import {
  Twitter,
  Linkedin,
  Github,
  Mail,
  ArrowRight,
  Heart,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navigation = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Use Cases", href: "/#use-cases" },
  ],
  company: [
    { name: "About", href: "/#about" },
    { name: "Contact", href: "/contact-us" },
  ],

  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms and Conditions", href: "/terms-conditions" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300 relative overflow-hidden border-t-4 border-yellow-600/30">
      {/* Diamond plate texture - ROUGHER */}
      <div className="absolute inset-0 opacity-[0.1]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, #FDB022 0, #FDB022 2px, transparent 0, transparent 40px),
                         repeating-linear-gradient(-45deg, #FDB022 0, #FDB022 2px, transparent 0, transparent 40px)`,
        backgroundSize: '40px 40px'
      }} />
      
      {/* Animated Background Elements */}
      <GeometricPattern />
      <FloatingElements />
      <ProfessionalIcons />

      {/* Newsletter Section */}
      <div className="border-b border-gray-800 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 uppercase">
              Ready to Transform Your AP Process?
            </h2>
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8">
              Join hundreds of businesses that have already streamlined their
              accounts payable with Sledge
            </p>
            <div className="flex flex-col items-stretch sm:items-center sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 px-6 py-3 rounded-lg font-bold transition-all duration-300 group shadow-lg shadow-yellow-500/50 border-2 border-yellow-600 uppercase">
                Subscribe
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="w-full h-full rounded-lg flex items-center justify-center shadow-lg">
                  <Image
                    src={"/images/logos/sledge.png"}
                    alt="logo"
                    width={40}
                    height={40}
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full animate-pulse" />
              </div>
              {/* <span className="text-xl font-bold text-white">SLEDGE</span> */}
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Intelligent accounts payable automation for modern businesses.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant="outline"
                className="text-xs font-medium border-yellow-600 bg-yellow-500/20 text-yellow-400 uppercase"
              >
                AI-Powered
              </Badge>
            </div>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Navigation Sections */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* <div>
            <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2025 SLEDGE. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            Made with{" "}
            <Heart className="w-4 h-4 text-red-500 fill-current mx-1" /> by
            <Link href="https://bluubery.com/" target="_blank">
              Bluubery Technologies
            </Link>
          </div>
        </div>
      </div>

      {/* Animated Wave at Bottom */}
      {/* <ProfessionalWave /> */}
    </footer>
  );
}
