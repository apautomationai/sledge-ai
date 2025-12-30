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
  ],
  industries: [
    { name: "Construction", href: "/#construction" },
    { name: "Concrete", href: "/#concrete" },
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
    <footer className="bg-neutral-900 text-gray-300 relative overflow-hidden">
      {/* Diamond plate texture - ROUGHER */}
      <div />

      {/* Animated Background Elements */}

      {/* Newsletter Section */}

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex flex-col gap-2 mb-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-full h-full rounded-lg flex items-center justify-center shadow-lg">
                    <Image
                      src={"/images/logos/logosledge.png"}
                      alt="logo"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full animate-pulse" />
                </div>
                <span
                  className="uppercase"
                  style={{
                    color: "#FFF",
                    fontSize: "24px",
                    fontStyle: "normal",
                    fontWeight: "700",
                    lineHeight: "24px",
                  }}
                >
                  SLEDGE
                </span>
              </Link>
              <h3 className="text-lg font-semibold text-white">
                The Builder's AI Office.
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Sledge simplifies back-office work so contractors, concrete
                teams, and builders can spend less time chasing paperwork and
                more time building.
              </p>
              <p className="text-sm text-gray-400">
                © 2025 SLEDGE. All rights reserved.
              </p>
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
            <h3 className="text-sm font-semibold text-white mb-4">
              Industries
            </h3>
            <ul className="space-y-3">
              {navigation.industries.map((item) => (
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

      {/* Animated Wave at Bottom */}
      {/* <ProfessionalWave /> */}
    </footer>
  );
}
