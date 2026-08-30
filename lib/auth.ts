import { betterAuth } from "better-auth";
import { username, twoFactor } from "better-auth/plugins";
import { pool } from "./db";
import { profile, siteUrl } from "./site";

/* The one account allowed into /panel. Compared against the session user's
   username, so a second user existing would still not get in. */
export const ADMIN_USERNAME = "eternalhell";

export const auth = betterAuth({
  appName: profile.name,
  database: pool,

  /* Derived from VERCEL_PROJECT_PRODUCTION_URL in production, localhost in
     development, so BETTER_AUTH_URL never has to be set by hand. */
  baseURL: process.env.BETTER_AUTH_URL ?? siteUrl,
  trustedOrigins: [siteUrl],

  emailAndPassword: {
    /* Stage 1. Once social login and 2FA are set up, flip this to false and
       the password path disappears without touching anything else. */
    enabled: true,
    minPasswordLength: 12,
  },

  socialProviders: {
    /* Stage 2. Fill the two env vars in and this turns on by itself. */
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? {
          discord: {
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
          },
        }
      : {}),
  },

  /* Stage 3. The tables ship now so enabling 2FA later needs no migration. */
  plugins: [username(), twoFactor({ issuer: profile.name })],

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  /* A public login form is worth rate limiting. */
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
    customRules: {
      "/sign-in/username": { window: 60, max: 5 },
      "/sign-in/email": { window: 60, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
    },
  },

  advanced: {
    cookiePrefix: "eternalhell",
  },
});

export type Session = typeof auth.$Infer.Session;
