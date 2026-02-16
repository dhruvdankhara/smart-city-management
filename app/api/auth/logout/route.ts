import { apiResponse } from "@/lib/api-utils";

export async function POST() {
  const response = apiResponse(null, "Logged out successfully");

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
