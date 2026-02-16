"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  ClipboardList,
  LogOut,
  Menu,
  X,
  CalendarDays,
  Tags,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logout, fetchCurrentUser } from "@/store/slices/authSlice";
import { toggleSidebar, setSidebarOpen } from "@/store/slices/uiSlice";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: Record<UserRole, NavItem[]> = {
  "super-admin": [
    {
      label: "Dashboard",
      href: "/dashboard/super-admin",
      icon: LayoutDashboard,
    },
    {
      label: "Departments",
      href: "/dashboard/super-admin/departments",
      icon: Building2,
    },
    {
      label: "Categories",
      href: "/dashboard/super-admin/categories",
      icon: Tags,
    },
    { label: "Users", href: "/dashboard/super-admin/users", icon: Users },
    {
      label: "Complaints",
      href: "/dashboard/super-admin/complaints",
      icon: FileText,
    },
    { label: "Map View", href: "/dashboard/super-admin/map", icon: MapPin },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    {
      label: "Complaints",
      href: "/dashboard/admin/complaints",
      icon: FileText,
    },
    { label: "Workers", href: "/dashboard/admin/workers", icon: Users },
    { label: "Leaves", href: "/dashboard/admin/leaves", icon: CalendarDays },
    { label: "Map View", href: "/dashboard/admin/map", icon: MapPin },
  ],
  worker: [
    { label: "Dashboard", href: "/dashboard/worker", icon: LayoutDashboard },
    { label: "My Tasks", href: "/dashboard/worker/tasks", icon: ClipboardList },
    { label: "Leave", href: "/dashboard/worker/leave", icon: CalendarDays },
  ],
  citizen: [
    { label: "Dashboard", href: "/dashboard/citizen", icon: LayoutDashboard },
    {
      label: "My Complaints",
      href: "/dashboard/citizen/complaints",
      icon: FileText,
    },
    {
      label: "New Complaint",
      href: "/dashboard/citizen/complaints/new",
      icon: ClipboardList,
    },
  ],
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((s) => s.auth);
  const { sidebarOpen } = useAppSelector((s) => s.ui);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    dispatch(logout());
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const items = navItems[user.role] || [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href={items[0]?.href || "/"}
            className="flex items-center gap-2"
          >
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">SCM</span>
          </Link>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-1 rounded-md hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== items[0].href && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => dispatch(setSidebarOpen(false))}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="border-t p-3">
          <div className="mb-2 px-3">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role.replace("-", " ")}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-1 rounded-md hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
