import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  const searchParamsObject = Object.fromEntries(searchParams.entries());
  const objectKeys = Object.keys(searchParamsObject);

  const cleanUrl = `${url.origin}${url.pathname}`;

  // Protect /content routes - require authentication
  if (pathname.startsWith("/vomsauterhof/content")) {
    const session = request.cookies.get("session");
    const userData = request.cookies.get("user-data");

    if (!session || !userData) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/vomsauterhof/auth/login", url.origin);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect /content to /content/news/
    if (
      pathname === "/vomsauterhof/content" ||
      pathname === "/vomsauterhof/content/"
    ) {
      const redirectUrl = url.clone();
      redirectUrl.pathname = "/vomsauterhof/content/news/";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  // Handle mode and category query parameters
  const allowedParams = ["mode", "category"];
  const hasInvalidParams = objectKeys.some(
    (key) => !allowedParams.includes(key)
  );

  if (hasInvalidParams) {
    // Remove invalid params but keep allowed ones
    const newUrl = url.clone();
    for (const key of objectKeys) {
      if (!allowedParams.includes(key)) {
        newUrl.searchParams.delete(key);
      }
    }
    return NextResponse.redirect(newUrl);
  }

  // Validate mode parameter if present
  if (searchParamsObject["mode"]) {
    const mode = searchParamsObject["mode"];
    if (mode !== "view" && mode !== "edit") {
      const newUrl = url.clone();
      newUrl.searchParams.delete("mode");
      return NextResponse.redirect(newUrl);
    }
    const session = request.cookies.get("session");

    if (!session) {
      const newUrl = url.clone();
      newUrl.searchParams.delete("mode");
      return NextResponse.redirect(newUrl);
    }
  }

  if (
    request.nextUrl.pathname === "/vomsauterhof/auth" ||
    request.nextUrl.pathname === "/vomsauterhof/auth/"
  ) {
    return NextResponse.redirect(
      new URL("/vomsauterhof/auth/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
