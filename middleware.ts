import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/types";

// Routes that require authentication and their allowed roles
const protectedRoutes: Record<string, UserRole[]> = {
  "/dashboard/super-admin": ["super-admin"],
  "/dashboard/admin": ["admin"],
  "/dashboard/worker": ["worker"],
  "/dashboard/citizen": ["citizen"],
};

const publicRoutes = ["/login", "/register", "/setup-account"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Allow API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If user is on a public route and has a token, redirect to dashboard
  if (publicRoutes.some((route) => pathname.startsWith(route)) && token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role as UserRole;
      const dashboardPath = getDashboardPath(role);
      return NextResponse.redirect(new URL(dashboardPath, req.url));
    } catch {
      // Invalid token, let them stay on public page
      return NextResponse.next();
    }
  }

  // Check protected routes
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userRole = payload.role as UserRole;

        if (!roles.includes(userRole)) {
          // Redirect to their correct dashboard
          const dashboardPath = getDashboardPath(userRole);
          return NextResponse.redirect(new URL(dashboardPath, req.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }

  return NextResponse.next();
}

function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "super-admin":
      return "/dashboard/super-admin";
    case "admin":
      return "/dashboard/admin";
    case "worker":
      return "/dashboard/worker";
    case "citizen":
      return "/dashboard/citizen";
    default:
      return "/login";
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
