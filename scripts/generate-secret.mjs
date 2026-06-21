#!/usr/bin/env node
/**
 * generate-secret.mjs
 *
 * Mint a cryptographically random 48-byte string suitable for SESSION_SECRET.
 * Output goes to stdout; copy it into .env.local and into your Vercel project
 * Environment Variables. Never commit it.
 */

import { randomBytes } from "node:crypto";

const secret = randomBytes(48).toString("base64url");
console.log("");
console.log("SESSION_SECRET=" + secret);
console.log("");
console.log(
  "→ Add the line above to your local .env.local AND your Vercel project's Environment Variables."
);
console.log(
  "→ Rotating this secret invalidates every currently-issued session cookie. That is fine."
);
