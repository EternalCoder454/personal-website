import type { Lead } from "@/lib/deliver";

/**
 * The email that lands when somebody asks for beta access.
 *
 * Built to match the panel's invitation email, because those two are the
 * only mail Eterneon sends and they should read as one company.
 *
 * Email is not the web. Everything here is a table with inline styles:
 * no flex, no grid, no stylesheet, no custom font. Outlook renders with
 * Word's engine and will silently drop most of what a browser accepts,
 * and a "clean" layout that collapses in one client is not clean.
 *
 * Light only, and explicitly so. Some clients invert an email whose
 * colours they cannot work out, which turns a careful palette into
 * whatever the client guessed. Every surface here states its background.
 */

/* The address is validated before it gets here, but that validator only
   rules out whitespace and a missing @. It happily allows < > " and &,
   so anything interpolated into markup still has to be escaped. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Kit values. The deep cyan is the same one the brand tokens call
   primary-container, and the ink is the kit's dark ink. */
const ink = "#1c1f22";
const muted = "#5f6b70";
const teal = "#156d7f";
const hairline = "#e3e7e9";
const panel = "#f4f6f7";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  });
}

type Row = { n: number; title: string; body: string };

function rowsHtml(rows: Row[]): string {
  return rows
    .map(
      (row) => `
              <tr>
                <td style="padding:0 12px 14px 0;vertical-align:top;width:20px;font:600 13px/20px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${teal};">${row.n}</td>
                <td style="padding:0 0 14px 0;vertical-align:top;font:400 14px/20px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${ink};">
                  <strong style="font-weight:600;">${row.title}</strong><br />
                  <span style="color:${muted};">${row.body}</span>
                </td>
              </tr>`,
    )
    .join("");
}

export function betaRequestEmail(lead: Lead) {
  const address = escapeHtml(lead.email);
  const when = escapeHtml(formatWhen(lead.receivedAt));
  const source = escapeHtml(lead.source);
  const mailto = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(
    "Your Eterneon beta invitation",
  )}`;

  const rows: Row[] = [
    {
      n: 1,
      title: "Reply to invite them",
      body: "This email replies straight to them, so there is nothing to copy across.",
    },
    {
      n: 2,
      title: "Add them to a workspace",
      body: "Their address is what grants access. No password to issue, no code to send.",
    },
    {
      n: 3,
      title: "They keep it",
      body: "A beta workspace stays free for life, with four seats at no cost.",
    },
  ];

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>New beta request</title>
  </head>
  <body style="margin:0;padding:0;background-color:#eef1f2;">
    <!-- Shown in the inbox list under the subject, and nowhere else. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${address} asked for beta access.</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f2;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:14px;">
            <tr>
              <td style="padding:32px 32px 0 32px;">

                <!-- Brand row -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="width:44px;vertical-align:middle;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:44px;height:44px;background-color:${teal};border-radius:10px;">
                        <tr>
                          <td align="center" style="font:700 15px/44px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#ffffff;letter-spacing:0.02em;">ET</td>
                        </tr>
                      </table>
                    </td>
                    <td style="padding-left:12px;vertical-align:middle;font:600 14px/44px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${muted};">Eterneon</td>
                  </tr>
                </table>

                <h1 style="margin:26px 0 0 0;font:700 24px/31px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${ink};">New beta request</h1>

                <p style="margin:14px 0 0 0;font:400 15px/23px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${muted};">
                  <a href="${mailto}" style="color:${teal};text-decoration:underline;">${address}</a>
                  asked for access to the Eterneon beta. Replying to this email goes straight to them.
                </p>

                <!-- A padded anchor inside a coloured table cell, which is
                     the shape Outlook renders. It loses the corner radius
                     there and stays a solid rectangle, which is fine. -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0 0;">
                  <tr>
                    <td style="background-color:${teal};border-radius:8px;">
                      <a href="${mailto}" style="display:inline-block;padding:13px 24px;font:600 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#ffffff;text-decoration:none;">Reply to them</a>
                    </td>
                  </tr>
                </table>

                <!-- Details -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0 0;background-color:${panel};border-radius:10px;">
                  <tr>
                    <td style="padding:20px 22px;">
                      <div style="font:600 11px/16px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${muted};letter-spacing:0.09em;text-transform:uppercase;">What happens next</div>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                        ${rowsHtml(rows)}
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Facts -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0 0;">
                  <tr>
                    <td style="font:400 13px/20px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${muted};">
                      Received ${when} &middot; from the ${source} page
                    </td>
                  </tr>
                </table>

                <hr style="border:none;border-top:1px solid ${hairline};margin:26px 0 0 0;" />

                <p style="margin:18px 0 32px 0;font:400 13px/20px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${muted};">
                  You are getting this because somebody submitted the beta form on eterneon.net.
                  Nothing has been sent to them and no account exists yet.
                </p>

              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  /* Sent alongside the HTML. Some clients prefer it, some people set it,
     and a message with no text part looks worse to a spam filter. */
  const text = [
    `New beta request`,
    ``,
    `${lead.email} asked for access to the Eterneon beta.`,
    `Replying to this email goes straight to them.`,
    ``,
    `Received ${formatWhen(lead.receivedAt)} from the ${lead.source} page.`,
    ``,
    `What happens next`,
    `1. Reply to invite them. This email replies straight to them.`,
    `2. Add them to a workspace. Their address is what grants access.`,
    `3. They keep it. A beta workspace stays free for life, with four seats.`,
    ``,
    `You are getting this because somebody submitted the beta form on`,
    `eterneon.net. Nothing has been sent to them and no account exists yet.`,
  ].join("\n");

  return { subject: `Beta request: ${lead.email}`, html, text };
}
