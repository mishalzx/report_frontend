import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  (await cookies()).set("jwt", "", { path: "/", maxAge: 0 });
  const url = new URL("/", request.url);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  // Allow GET for convenience if form accidentally uses GET
  return POST(request);
}


