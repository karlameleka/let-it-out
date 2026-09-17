import { initBotId } from "botid/client/core";

// Registers Vercel BotID's invisible challenge on every page that hosts a
// state-changing, unauthenticated (or pre-auth) form — the routes bots
// actually target: lead-capture forms, checkout, and every auth flow
// (credential stuffing, OTP/email-bombing, password-reset abuse, 2FA brute
// force). The matching server-side checkBotId() calls live in
// lib/anti-spam.ts's screenSubmission() (covers every lead-capture form in
// one place) and directly in auth-actions.ts / therapist-auth-actions.ts.
//
// `path` here is the *page* a Server Action is invoked from, not the
// action's own name — Next.js POSTs a Server Action call back to the page
// that rendered it, which is what BotID's client script actually
// intercepts. Admin/therapist-portal pages aren't listed: they're already
// behind session + role checks (see proxy.ts), so an invisible bot
// challenge adds nothing there.
initBotId({
  protect: [
    { path: "/contact", method: "POST" },
    { path: "/workshops", method: "POST" },
    { path: "/resources/*", method: "POST" },
    { path: "/counseling/*", method: "POST" },
    { path: "/checkout", method: "POST" },
    { path: "/login", method: "POST" },
    { path: "/login/verify", method: "POST" },
    { path: "/signup", method: "POST" },
    { path: "/forgot-password", method: "POST" },
    { path: "/reset-password", method: "POST" },
    { path: "/therapist/login", method: "POST" },
    { path: "/therapist/forgot-password", method: "POST" },
    { path: "/therapist/reset-password", method: "POST" },
  ],
});
