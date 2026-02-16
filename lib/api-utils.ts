import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import type { JwtPayload, UserRole, ApiResponse } from "@/types";

export function apiResponse<T>(
  data: T,
  message: string = "Success",
  status: number = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function apiError(
  message: string,
  status: number = 400,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, message, error: message },
    { status },
  );
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies.get("token")?.value ?? null;
}

export function authenticate(req: NextRequest): JwtPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function authorize(
  req: NextRequest,
  ...roles: UserRole[]
): JwtPayload | null {
  const user = authenticate(req);
  if (!user) return null;
  if (roles.length > 0 && !roles.includes(user.role)) return null;
  return user;
}

export function getPaginationParams(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit")) || 10),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
