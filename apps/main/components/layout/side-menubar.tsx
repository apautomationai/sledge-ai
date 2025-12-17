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
  Package2,
  FileCheck,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";
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

const NavLink = ({ href, icon: Icon, children, isActive, isCollapsed }: any) => (
  <TooltipProvider delayDuration={0}>
    {isCollapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "group flex justify-center rounded-xl p-3 text-muted-foreground hover:bg-accent hover:text-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isActive && "bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold shadow-sm border-l-4 border-l-primary"
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="bg-popover text-popover-foreground border shadow-lg">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {children}
          </div>
        </TooltipContent>
      </Tooltip>
    ) : (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground hover:bg-accent hover:text-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isActive && "bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold shadow-sm border-l-4 border-l-primary"
        )}
      >
        <Icon className={cn("h-5 w-5", isActive && "scale-110", "group-hover:scale-105")} />
        <span className="truncate">{children}</span>
        {!isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </Link>
    )}
  </TooltipProvider>
);

export default function SideMenuBar({
  userName,
  userEmail,
  isCollapsed = false,
  onToggleCollapse,
  isOnboardingComplete = false,
}: {
  userName: string;
  userEmail: string;
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
  isOnboardingComplete?: boolean
}) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [isCol, setIsCol] = useState(isCollapsed);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState) setIsCol(savedState === "true");
  }, []);

  const toggleCollapse = () => {
    setIsCol((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", newState.toString());
      return newState;
    });
    onToggleCollapse();
  };

  return (
    <div
      className={cn(
        "fixed md:relative inset-y-0 left-0 z-40 bg-gradient-to-b from-background to-muted/20 backdrop-blur-sm border-r border-border/40 transition-all duration-300 ease-in-out shadow-lg md:shadow-none",
        isCol ? "w-16" : "w-72"
      )}
    >
      <div className="flex h-full max-h-screen flex-col">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 lg:h-[60px]">
          <Link
            href="/dashboard"
            className={cn("flex items-center gap-2 font-bold text-xl transition-all duration-300 hover:opacity-80 active:scale-95", isCol && "justify-center w-full")}
          >
            <Image src={"/images/logos/sledge.png"} alt="logo" width={50} height={50} />
            {!isCol && <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent transition-all duration-300">SLEDGE</span>}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn("h-8 w-8 transition-all duration-300 hover:bg-accent hover:scale-105 hidden md:flex", isCol && "mx-auto")}
          >
            {isCol ? <PanelRightClose className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid items-start gap-1 px-3 text-sm font-medium">
            <NavLink href="/dashboard" icon={LayoutDashboard} isActive={pathname === "/dashboard"} isCollapsed={isCol}>Overview</NavLink>
            <NavLink href="/jobs" icon={FileText} isActive={pathname.startsWith("/jobs")} isCollapsed={isCol}>Invoices</NavLink>
            <NavLink href="/integrations" icon={Settings} isActive={pathname.startsWith("/integrations")} isCollapsed={isCol}>Integrations</NavLink>
            <NavLink href="/projects" icon={Package2} isActive={pathname.startsWith("/projects")} isCollapsed={isCol}>Projects</NavLink>
            <NavLink href="/lien-waiver" icon={FileCheck} isActive={pathname.startsWith("/lien-waiver")} isCollapsed={isCol}>Lien Waivers</NavLink>
            <NavLink href="/vendors" icon={Users} isActive={pathname.startsWith("/vendors")} isCollapsed={isCol}>Vendors</NavLink>
          </nav>
        </div>

        {/* Footer */}
        <div className="flex flex-col border-t border-border/40 p-3">
          {/* Footer: Report + Support */}
          <div className="mt-4 flex flex-col gap-2">

            {/* Report a Bug */}
            <Link
              href="/report"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-300",
                pathname.startsWith("/report") &&
                "bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-normal shadow-sm border-l-4 border-l-primary",
                isCol && "justify-center px-3" // center icon when collapsed
              )}
            >
              <Bug className="h-4 w-4 flex-shrink-0" /> 
              {!isCol && <span className="truncate text-sm">Report a Bug</span>} {/* same size as support text */}
            </Link>

            {/* Support */}
            <Link
              href="mailto:support@getsledge.com"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-300",
                isCol && "justify-center px-3" 
              )}
            >
              <Mail className="h-4 w-4 flex-shrink-0" /> 
              {!isCol && <span className="truncate text-sm">support@getsledge.com</span>} {/* same size as report text */}
            </Link>
          </div>

          {/* User */}
          <div className="border-t border-border/40 mt-auto mb-[40px] pr-3 pb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start h-auto p-2 transition-all duration-200 hover:bg-accent hover:shadow-sm rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2", isCol && "w-auto justify-center rounded-full p-2")}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 ring-2 ring-border/50 transition-all duration-200 group-hover:ring-primary/50">
                      <AvatarImage src="/images/avatar.png" alt={userName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                        <span suppressHydrationWarning>{userName.charAt(0).toUpperCase()}</span>
                      </AvatarFallback>
                    </Avatar>
                    {!isCol && (
                      <div className="flex flex-col items-start truncate transition-all duration-300">
                        <span className="text-sm font-semibold leading-tight truncate max-w-[120px]">{userName}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{userEmail}</span>
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2 ml-2 shadow-xl border-border/50" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
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
                      {theme === "dark" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                      <span>Theme</span>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="shadow-xl border-border/50">
                      <DropdownMenuItem onClick={() => setTheme("light")} className="p-2 cursor-pointer">
                        <Sun className="h-4 w-4 mr-2" /> Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")} className="p-2 cursor-pointer">
                        <Moon className="h-4 w-4 mr-2" /> Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")} className="p-2 cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" /> System
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-2 cursor-pointer text-destructive focus:text-destructive" onSelect={() => (document.getElementById("logout-form") as HTMLFormElement)?.requestSubmit()}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <form id="logout-form" action={logoutAction} className="hidden" />
    </div>
  );
}
