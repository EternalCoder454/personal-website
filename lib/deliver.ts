import "server-only";
import { start } from "@/lib/perf";
import { site } from "@/lib/site";

/**
 * Where a beta request goes.
 *
 * Two ways to deliver, checked in order:
 *
 *   1. RESEND_API_KEY  emails the address to you
 *   2. WAITLIST_WEBHOOK_URL  posts the JSON anywhere that accepts a POST
 *
 * Resend wins when both are set. Neither set is a configuration error,
 * not a silent success: the caller fails closed and tells the visitor to
 * email instead, because losing a lead quietly is worse than saying so.
 *
 * Resend needs its own shape rather than an arbitrary POST body, which
 * is why it cannot just be pointed at WAITLIST_WEBHOOK_URL.
 */

export type Lead = { email: string; receivedAt: string; source: string };

export type Delivery =
  | { kind: "sent"; via: "resend" | "webhook" }
  | { kind: "logged" }
  | { kind: "unconfigured" }
  | { kind: "failed"; via: "resend" | "webhook"; detail: string };

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function viaResend(lead: Lead, apiKey: string): Promise<Delivery> {
  /* The from address has to sit on a domain verified in Resend. The
     panel already sends through eterneon.net, so the same key and the
     same verified domain work here with nothing new to set up. */
  const from = process.env.RESEND_FROM || "Eterneon beta <beta@eterneon.net>";
  const to = process.env.WAITLIST_TO || site.contactEmail;

  try {
    const done = start("waitlist:resend");
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        /* So the invitation is one reply away. Safe to interpolate: the
           address already passed a validator whose character class
           excludes whitespace, and \s covers CR and LF, so there is no
           header to inject here. */
        reply_to: lead.email,
        subject: `Beta request: ${lead.email}`,
        /* Text only. Nothing here needs markup, and a plain body has no
           escaping to get wrong. */
        text: [
          `${lead.email} asked for beta access.`,
          ``,
          `Received: ${lead.receivedAt}`,
          `Source:   ${lead.source}`,
          ``,
          `Reply to this email to answer them directly.`,
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(8000),
    });
    /* A non-2xx resolves rather than throws, so the span has to be told.
       Without this a wholly broken integration reported errors: 0. */
    done(response.ok);

    if (!response.ok) {
      /* Resend puts the reason in the body, and it is usually the one
         thing you need: an unverified domain or a bad key. */
      const detail = await response.text().catch(() => "");
      return {
        kind: "failed",
        via: "resend",
        detail: `${response.status} ${detail.slice(0, 300)}`,
      };
    }

    return { kind: "sent", via: "resend" };
  } catch (error) {
    return { kind: "failed", via: "resend", detail: String(error) };
  }
}

async function viaWebhook(lead: Lead, url: string): Promise<Delivery> {
  try {
    const done = start("waitlist:webhook");
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8000),
    });
    done(response.ok);

    if (!response.ok) {
      return { kind: "failed", via: "webhook", detail: String(response.status) };
    }

    return { kind: "sent", via: "webhook" };
  } catch (error) {
    return { kind: "failed", via: "webhook", detail: String(error) };
  }
}

export async function deliver(lead: Lead): Promise<Delivery> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) return viaResend(lead, resendKey);

  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (webhook) return viaWebhook(lead, webhook);

  /* Nothing configured. In development that is normal and the console is
     the destination. In production it is a mistake worth shouting about. */
  if (process.env.NODE_ENV !== "production") {
    console.info("[waitlist] nothing configured, logging instead:", lead);
    return { kind: "logged" };
  }

  return { kind: "unconfigured" };
}
