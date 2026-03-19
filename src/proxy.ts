import nextAuthMiddleware from "next-auth/middleware";

// Explicitly export the function so Turbopack doesn't crash
export default nextAuthMiddleware;

export const config = {
  // Protects EVERY page, except for the internal Next.js files and the login API
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};