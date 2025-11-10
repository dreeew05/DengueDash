import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  return NextResponse.json({
    accessToken: accessToken,
    status: 200,
  });
}
