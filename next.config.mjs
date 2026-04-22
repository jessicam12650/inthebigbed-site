/** @type {import('next').NextConfig} */
//
// Note: this app intentionally has NO middleware.ts. An earlier middleware
// imported @supabase/ssr, which webpack bundled with `__nccwpck_require__.ab =
// __dirname + "/"`. On Vercel's Edge Runtime that emits a
// `ReferenceError: __dirname is not defined` and every request becomes 500.
// Auth gating is enforced client-side in /profile, /login and /signup via
// lib/useUser. If you re-add middleware, do not import @supabase/ssr.
//
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
