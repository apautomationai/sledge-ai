"use client";

import React, { useEffect, useState, ReactNode } from "react";
import SideMenuBar from "@/components/layout/side-menubar";
import Footer from "@/components/layout/footer";
import { cn } from "@workspace/ui/lib/utils";
import { debugLogger } from "@/lib/debug-logger";
import { Menu } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

// Initialize debug logger early to capture all console logs
debugLogger.init();

interface DashboardClientLayoutProps {
  userName: string;
  userEmail: string;
  isOnboardingComplete: boolean;
  children: ReactNode;
}

export default function DashboardClientLayout({
  userName,
  userEmail,
  isOnboardingComplete,
  children,
}: DashboardClientLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
        setIsMobileMenuOpen(false);
      } else {
        setIsCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Mobile Backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <SideMenuBar
        userName={userName}
        userEmail={userEmail}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isOnboardingComplete={isOnboardingComplete}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={closeMobileMenu}
      />

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-all duration-300",
        )}
      >
        {/* Mobile Header with Hamburger */}
        {isMobile && (
          <div className="flex items-center gap-3 p-4 border-b border-border/40 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SLEDGE
            </h1>
          </div>
        )}

        <main className="flex-1 overflow-auto min-w-0 p-4 pl-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
