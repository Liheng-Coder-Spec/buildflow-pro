#!/usr/bin/env node

import { createHash } from "node:crypto";

function deriveWebhookSecret(apiKey) {
  return createHash("sha256")
    .update(`telegram-webhook:${apiKey}`)
    .digest("base64url");
}

async function main() {
  const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;

  if (!TELEGRAM_API_KEY) {
    console.error("Error: TELEGRAM_API_KEY environment variable is required.");
    console.error("  set TELEGRAM_API_KEY=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11");
    process.exit(1);
  }
  if (!SUPABASE_URL) {
    console.error("Error: SUPABASE_URL environment variable is required.");
    console.error("  set SUPABASE_URL=https://your-project.supabase.co");
    process.exit(1);
  }

  const functionUrl = `${SUPABASE_URL.replace(/\/+$/, "")}/functions/v1/telegram-webhook`;
  const secret = deriveWebhookSecret(TELEGRAM_API_KEY);

  console.log("Registering Telegram bot webhook...");
  console.log(`  Endpoint: ${functionUrl}`);

  const setRes = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_API_KEY}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: functionUrl,
        secret_token: secret,
        allowed_updates: ["message", "edited_message", "callback_query", "inline_query"],
      }),
    },
  );

  const setData = await setRes.json();

  if (!setData.ok) {
    console.error(`\nFailed to register webhook:`);
    console.error(`  Error code:    ${setData.error_code ?? "unknown"}`);
    console.error(`  Description:   ${setData.description ?? "unknown"}`);
    process.exit(1);
  }

  console.log("Webhook registered successfully.\n");

  const getRes = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_API_KEY}/getWebhookInfo`,
  );
  const getData = await getRes.json();

  if (getData.ok) {
    const info = getData.result;
    console.log("Current webhook status:");
    console.log(`  URL:                ${info.url}`);
    console.log(`  Pending updates:    ${info.pending_update_count}`);
    console.log(`  Last error:         ${info.last_error_message ?? "(none)"}`);
    if (info.last_error_date) {
      const d = new Date(info.last_error_date * 1000);
      console.log(`  Last error date:    ${d.toISOString()}`);
    }
    console.log(`  Max connections:    ${info.max_connections}`);
  }
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
