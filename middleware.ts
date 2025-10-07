import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserMeLoader } from "@/app/data/services/get-user-me-loader";

export async function middleware(request: NextRequest) {
  const user = await getUserMeLoader();
  console.log(user,"middle")
  const currentPath = request.nextUrl.pathname;

  // Allow unauthenticated access to auth pages
  if (currentPath.startsWith("/signin") || currentPath.startsWith("/signup")) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users away from protected pages
  if (currentPath.startsWith("/") && user.ok === false) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

// Skip middleware for static assets and API routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};