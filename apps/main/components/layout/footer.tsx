"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40 w-full px-6 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground max-w-full mx-auto">
        {/* Copyright */}
        <p className="text-center sm:text-left text-xs truncate">
          &copy; {new Date().getFullYear()} SLEDGE. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-0">
          <Link
            href="/terms-conditions"
            target="_blank"
            className="hover:text-primary transition-colors text-xs truncate"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/privacy-policy"
            target="_blank"
            className="hover:text-primary transition-colors text-xs truncate"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact-us"
            target="_blank"
            className="hover:text-primary transition-colors text-xs truncate"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
