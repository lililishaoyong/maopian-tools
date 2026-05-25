import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/admin", "/api/admin", "/api/worker"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const user = process.env.ADMIN_USER || "admin";
  const password = process.env.ADMIN_PASSWORD || "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
  const auth = request.headers.get("authorization");

  if (auth?.startsWith("Basic ")) {
    const decoded = atob(auth.slice("Basic ".length));
    const [inputUser, inputPassword] = decoded.split(":");
    const validUser = inputUser === user;
    const validPassword = passwordHash
      ? (await sha256(inputPassword || "")) === passwordHash
      : Boolean(password) && inputPassword === password;

    if (validUser && validPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Baibaoxiang Admin"'
    }
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/worker/:path*"]
};

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
