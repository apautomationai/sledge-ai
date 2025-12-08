"use client";

import React, { useState, useEffect, ReactNode } from "react";
import SideMenuBar from "@/components/layout/side-menubar";
import Footer from "@/components/layout/footer";
import { cn } from "@workspace/ui/lib/utils";

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

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Mobile: collapsed overlay, Desktop: expanded by default
      setIsCollapsed(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div
      className={cn(
        "grid min-h-screen w-full transition-[grid-template-columns] duration-300 ease-in-out",
        isMobile
          ? "grid-cols-1" 
          : isCollapsed
          ? "md:grid-cols-[72px_1fr]" 
          : "md:grid-cols-[280px_1fr]" 
      )}
    >
      <SideMenuBar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        userName={userName}
        userEmail={userEmail}
        isOnboardingComplete={isOnboardingComplete}
      />

      <div className="flex flex-col max-h-screen overflow-hidden w-full transition-all duration-300">
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 w-full">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
