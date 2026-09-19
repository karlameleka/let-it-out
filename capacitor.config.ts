import type { CapacitorConfig } from "@capacitor/cli";

// appId is a placeholder — before running `npx cap sync`, change this to
// the real reverse-DNS bundle identifier registered for this app in the
// Apple Developer account (App Store Connect requires it to match exactly,
// and it can't be changed once the app record is created there).
const config: CapacitorConfig = {
  appId: "com.letitout.app",
  appName: "Let It Out",
  // Required by Capacitor's config schema, but not what actually renders —
  // see www/index.html for why. The real content comes from server.url.
  webDir: "www",
  server: {
    // The native shell loads the live production site directly rather than
    // a bundled static copy — this app is server-rendered (Server
    // Components, Server Actions, API routes, middleware), none of which a
    // static `webDir` export could serve. This is the standard Capacitor
    // pattern for wrapping an existing server-rendered web app natively
    // (sometimes called a "hosted" or "remote" Capacitor app), and is what
    // lets the exact same backend/database/session cookies serve both the
    // website and the native app with zero duplication.
    //
    // Change this if the production domain ever changes; it must always be
    // a real, reachable HTTPS origin — Apple's review team loads this URL
    // directly and will reject the build if it doesn't resolve.
    url: "https://letitouteg.org",
    cleartext: false,
  },
  ios: {
    // Matches the app's own status-bar theming (see viewport.themeColor in
    // src/app/layout.tsx) instead of Capacitor's default black-translucent,
    // so the native chrome doesn't visually clash with the web content on
    // first paint.
    backgroundColor: "#1e5b73",
  },
  plugins: {
    SplashScreen: {
      // Kept visible until native-app-init.tsx explicitly hides it once the
      // web content has actually painted, instead of the default
      // auto-hide-after-500ms — the remote page (server.url) takes longer
      // than that to load than a bundled local webDir would, and
      // auto-hiding early would flash an empty WebView before content
      // arrives.
      launchAutoHide: false,
      backgroundColor: "#1e5b73",
    },
  },
};

export default config;
