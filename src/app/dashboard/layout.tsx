"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  History,
  Key,
  Activity,
  Webhook,
  Settings,
  ChevronRight,
  Menu,
  X,
  Zap,
  LogOut,
  Wand2
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/analyze", icon: FileText, label: "Analyze" },
  { href: "/dashboard/enhance", icon: Wand2, label: "Enhance" },
  { href: "/dashboard/history", icon: History, label: "History" },
  { href: "/dashboard/api-keys", icon: Key, label: "API Keys" },
  { href: "/dashboard/api-usage", icon: Activity, label: "API Usage" },
  { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold">
              <div className="relative flex h-9 w-9 items-center justify-center">
                <img src="/logo.svg" alt="ContentLens" className="h-9 w-9" />
              </div>
              <span className="hidden sm:inline">ContentLens</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/analyze"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Zap className="h-4 w-4" />
              New Analysis
            </Link>
            <div className="h-8 w-px bg-border mx-1 hidden sm:block" />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9"
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 border-r bg-background transition-transform duration-300 lg:translate-x-0 pt-16 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "" : "opacity-70"}`} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom section */}
          <div className="border-t p-4">
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">Quick Actions</p>
              <Link
                href="/dashboard/analyze"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                New Analysis
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile navigation overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background lg:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 pb-16 lg:pb-0">
        <div className="p-4 lg:p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
