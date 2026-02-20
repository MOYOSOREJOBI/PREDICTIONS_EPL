import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get("sessionKey")?.value) {
    res.cookies.set("sessionKey", crypto.randomUUID(), { httpOnly: true, sameSite: "lax", path: "/" });
  }
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
