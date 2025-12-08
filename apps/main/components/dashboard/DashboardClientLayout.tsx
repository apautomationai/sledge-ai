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
  // On mobile, start with sidebar collapsed (hidden)
  // On desktop, start with sidebar expanded
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
      // On mobile, always start collapsed; on desktop, start expanded
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
      } else {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        "grid min-h-screen w-full transition-[grid-template-columns] duration-300 ease-in-out",
        isCollapsed ? "md:grid-cols-[72px_1fr]" : "md:grid-cols-[280px_1fr]"
      )}
    >
      <SideMenuBar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        userName={userName}
        userEmail={userEmail}
        isOnboardingComplete={isOnboardingComplete}
      />
      <div className="flex flex-col max-h-screen overflow-hidden w-full">
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 w-full">{children}</main>
        <Footer />
      </div>
    </div>
  );
}