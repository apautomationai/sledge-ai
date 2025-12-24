"use client";

import React, { useEffect, useState, ReactNode } from "react";
import SideMenuBar from "@/components/layout/side-menubar";
import Footer from "@/components/layout/footer";
import { cn } from "@workspace/ui/lib/utils";
import { debugLogger } from "@/lib/debug-logger";

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsCollapsed(false);
      else setIsCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <SideMenuBar
        userName={userName}
        userEmail={userEmail}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isOnboardingComplete={isOnboardingComplete}
      />

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-all duration-300",
        )}
      >
        <main className="flex-1 overflow-auto min-w-0 p-4 pl-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
