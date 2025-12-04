"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Bug,
  LogOut,
  Mail,
  User,
  Moon,
  Sun,
  PanelLeftClose,
  PanelRightClose,
  ChevronRight,
  Menu,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { logoutAction } from "@/app/(auth)/logout/acttion";
import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";

const NavLink = ({
  href,
  icon: Icon,
  children,
  isActive,
  isCollapsed,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
}) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-all duration-200",
            "hover:bg-accent hover:text-primary hover:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isActive &&
              "bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold shadow-sm border-l-4 border-l-primary",
            isCollapsed ? "justify-center px-2" : "pl-4"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive && "scale-110",
                "group-hover:scale-105"
              )}
            />
            <span
              className={cn(
                "truncate transition-all duration-200",
                isCollapsed ? "hidden" : "opacity-100 translate-x-0"
              )}
            >
              {children}
            </span>
          </div>

          {!isCollapsed && isActive && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          )}

          {!isCollapsed && !isActive && (
            <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-0.5" />
          )}
        </Link>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent
          side="right"
          sideOffset={10}
          className="bg-popover text-popover-foreground border shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {children}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);

export default function SideMenuBar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", newState.toString());
      return newState;
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          !isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleCollapse}
      />

      {/* Mobile Menu Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={toggleCollapse}
        className={cn(
          "fixed top-4 left-4 z-50 h-10 w-10 rounded-lg shadow-lg md:hidden",
          "transition-all duration-300 hover:scale-105 bg-background border",
          isCollapsed
            ? "opacity-100 scale-100"
            : "opacity-0 scale-50 pointer-events-none"
        )}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-40",
          "bg-gradient-to-b from-background to-muted/20 backdrop-blur-sm",
          "border-r border-border/40",
          "transition-all duration-300 ease-in-out",
          "shadow-lg md:shadow-none",
          isCollapsed
            ? "w-16 -translate-x-full md:translate-x-0"
            : "w-72 translate-x-0"
        )}
      >
        <div className="flex h-full max-h-screen flex-col">
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 lg:h-[60px]">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 font-bold text-xl transition-all duration-300",
                "hover:opacity-80 active:scale-95",
                isCollapsed && "justify-center w-full"
              )}
            >
              <div className="relative transition-all duration-300">
                <Image
                  src={"/images/logos/sledge.png"}
                  alt="logo"
                  width={50}
                  height={50}
                />
              </div>
              <span
                className={cn(
                  "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent",
                  "transition-all duration-300 overflow-hidden",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                SLEDGE
              </span>
            </Link>

            {/* Desktop Collapse Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className={cn(
                "h-8 w-8 transition-all duration-300 hover:bg-accent hover:scale-105",
                "hidden md:flex",
                isCollapsed && "mx-auto"
              )}
            >
              {isCollapsed ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </Button>

            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className={cn(
                "h-8 w-8 md:hidden transition-all duration-300",
                isCollapsed && "hidden"
              )}
            >
              <PanelLeftClose className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="grid items-start gap-1 px-3 text-sm font-medium">
              <NavLink
                href="/dashboard"
                icon={LayoutDashboard}
                isActive={pathname === "/dashboard"}
                isCollapsed={isCollapsed}
              >
                Overview
              </NavLink>
              <NavLink
                href="/jobs"
                icon={FileText}
                isActive={pathname.startsWith("/jobs")}
                isCollapsed={isCollapsed}
              >
                Invoices
              </NavLink>
              <NavLink
                href="/integrations"
                icon={Settings}
                isActive={pathname.startsWith("/integrations")}
                isCollapsed={isCollapsed}
              >
                Integrations
              </NavLink>
            </nav>
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-border/40">
            <NavLink
              href="/report"
              icon={Bug}
              isActive={pathname.startsWith("/report")}
              isCollapsed={isCollapsed}
            >
              Report a Bug
            </NavLink>

            {/* Support Link */}
            <div className={cn("p-3", isCollapsed && "px-2 py-3")}>
              <Link
                href="mailto:support@getsledge.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                  "text-muted-foreground transition-all duration-200",
                  "hover:bg-accent hover:text-primary hover:shadow-sm",
                  "group border border-transparent hover:border-border",
                  isCollapsed && "justify-center"
                )}
              >
                <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span
                  className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  support@getsledge.com
                </span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="border-t border-border/40 p-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-2 transition-all duration-200",
                      "hover:bg-accent hover:shadow-sm rounded-xl",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      isCollapsed && "w-auto justify-center rounded-full p-2"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-border/50 transition-all duration-200 group-hover:ring-primary/50">
                        <AvatarImage src="/images/avatar.png" alt={userName} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                          <span suppressHydrationWarning>
                            {userName.charAt(0).toUpperCase()}
                          </span>
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "flex flex-col items-start truncate transition-all duration-300",
                          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        )}
                      >
                        <span className="text-sm font-semibold leading-tight truncate max-w-[120px]">
                          {userName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {userEmail}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mb-2 ml-2 shadow-xl border-border/50"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer p-2">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="p-2 cursor-pointer">
                      <div className="flex items-center">
                        {theme === "dark" ? (
                          <Moon className="h-4 w-4 mr-2" />
                        ) : (
                          <Sun className="h-4 w-4 mr-2" />
                        )}
                        <span>Theme</span>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="shadow-xl border-border/50">
                        <DropdownMenuItem
                          onClick={() => setTheme("light")}
                          className="p-2 cursor-pointer"
                        >
                          <Sun className="h-4 w-4 mr-2" />
                          <span>Light</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTheme("dark")}
                          className="p-2 cursor-pointer"
                        >
                          <Moon className="h-4 w-4 mr-2" />
                          <span>Dark</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTheme("system")}
                          className="p-2 cursor-pointer"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          <span>System</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="p-2 cursor-pointer text-destructive focus:text-destructive"
                    onSelect={() =>
                      (document.getElementById("logout-form") as HTMLFormElement)
                        ?.requestSubmit()
                    }
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <form id="logout-form" action={logoutAction} className="hidden" />
    </>
  );
}
