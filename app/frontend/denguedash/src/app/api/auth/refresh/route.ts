import { generateNewAccessToken } from "@/lib/token";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      // Todo: Logout user
      return NextResponse.json({
        message: "No refresh token found",
        status: 401,
      });
    }

    const newAccessToken = await generateNewAccessToken(refreshToken);
    if (!newAccessToken) {
      cookieStore.delete("refresh_token");
      return NextResponse.json({
        message: "Invalid refresh token",
        status: 401,
      });
    }

    cookieStore.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      accessToken: newAccessToken,
      status: 200,
    });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}
