import { NextRequest, NextResponse } from "next/server";
import {
  getDataFromToken,
  validateToken,
  verifyTokenSignature,
} from "./lib/token";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const refreshToken = cookieStore.get("refresh_token");

  const deleteCookies = () => {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
  };

  // Check if tokens exist
  if (!accessToken || !refreshToken) {
    deleteCookies();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify the signature of refresh token
  const isRefreshTokenSignatureValid = await verifyTokenSignature(
    refreshToken.value,
    "REFRESH" // FOR DEBUGGING PURPOSES
  );
  if (!isRefreshTokenSignatureValid) {
    deleteCookies();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify if refresh token is expired
  const isRefreshTokenExpired = await validateToken(refreshToken.value);
  if (isRefreshTokenExpired) {
    deleteCookies();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const adminPath = "/user/admin";
  const encoderPath = "/user/encoder";
  const adminDashboardPath = adminPath.concat("/accounts/manage");
  const encoderDashboardPath = encoderPath.concat("/analytics/dashboard");

  const dataFromToken = await getDataFromToken(accessToken.value);
  if (!dataFromToken) {
    deleteCookies();
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const isAdmin = dataFromToken.is_admin;
  if (request.nextUrl.pathname.startsWith(adminPath) && !isAdmin) {
    return NextResponse.redirect(new URL(encoderDashboardPath, request.url));
  }
  if (request.nextUrl.pathname.startsWith(encoderPath) && isAdmin) {
    return NextResponse.redirect(new URL(adminDashboardPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*"],
};
