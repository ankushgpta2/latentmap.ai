#!/usr/bin/env node
/**
 * generate-hash.mjs
 *
 * Generate the SHA-256 hex digest of a chosen invite code. The plaintext
 * never leaves the local shell; only the digest goes into INVITE_CODE_HASH.
 *
 * Usage:
 *   npm run generate-hash                     # prompts for the code interactively
 *   npm run generate-hash -- "my code here"   # one-shot, non-interactive
 *
 * For maximum hygiene, use the interactive mode so the plaintext never
 * lands in shell history.
 */

import { createHash } from "node:crypto";
import readline from "node:readline";

async function promptHidden(prompt) {
  process.stdout.write(prompt);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  // Hide input by re-rendering as we receive keystrokes.
  const stdin = process.stdin;
  if (stdin.isTTY) stdin.setRawMode(true);

  return await new Promise((resolve) => {
    let buf = "";
    const onData = (ch) => {
      const s = ch.toString("utf8");
      if (s === "\u0003") {
        // Ctrl-C
        process.stdout.write("\n");
        process.exit(130);
      }
      if (s === "\r" || s === "\n") {
        if (stdin.isTTY) stdin.setRawMode(false);
        stdin.removeListener("data", onData);
        rl.close();
        process.stdout.write("\n");
        resolve(buf);
        return;
      }
      if (s === "\u007f") {
        // backspace
        if (buf.length > 0) {
          buf = buf.slice(0, -1);
          process.stdout.write("\b \b");
        }
        return;
      }
      buf += s;
      process.stdout.write("•");
    };
    stdin.on("data", onData);
  });
}

async function main() {
  let code = process.argv[2];
  if (!code) {
    code = await promptHidden("Invite code: ");
  }
  code = (code ?? "").trim();
  if (!code) {
    console.error("error: empty invite code");
    process.exit(1);
  }
  if (code.length < 12) {
    console.error(
      "error: invite codes should be at least 12 characters for reasonable entropy"
    );
    process.exit(1);
  }
  const hash = createHash("sha256").update(code, "utf8").digest("hex");
  console.log("");
  console.log("INVITE_CODE_HASH=" + hash);
  console.log("");
  console.log(
    "→ Add the line above to your local .env.local AND your Vercel project's Environment Variables."
  );
  console.log("→ Distribute the *plaintext* invite code only to trusted recipients.");
  console.log("→ Never commit either the plaintext or this hash to a public repo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
