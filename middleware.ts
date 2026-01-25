// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ✅ REQUIRED middleware function (empty pass-through)
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// ✅ Apply middleware only on admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
