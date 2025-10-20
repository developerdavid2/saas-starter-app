import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook/register",
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Handle authenticated users
  if (userId) {
    try {
      // Get the user's role from session claims metadata
      const role = (sessionClaims?.metadata as { role?: string })?.role;

      // ROLE-BASED ACCESS CONTROL

      // 1. Admin role redirection - redirect admins from /dashboard to /admin/dashboard
      if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      // 2. Prevent non-admin users from accessing admin routes
      if (isAdminRoute(req) && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // 3. Redirect authenticated users trying to access public routes (sign-in/sign-up pages)
      if (
        isPublicRoute(req) &&
        (req.nextUrl.pathname.startsWith("/sign-in") ||
          req.nextUrl.pathname.startsWith("/sign-up"))
      ) {
        return NextResponse.redirect(
          new URL(
            role === "admin" ? "/admin/dashboard" : "/dashboard",
            req.url,
          ),
        );
      }
    } catch (error) {
      console.error("Error in middleware:", error);
      return NextResponse.redirect(new URL("/error", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
