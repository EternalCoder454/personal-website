/** The one-time password email for QuickScript. Plain on purpose. */
export function quickscriptPasswordEmail(password: string) {
  const subject = "Your QuickScript password";
  const text = `${password}\n\nExpires in 10 minutes. Works once.\nIf you did not ask for this, ignore it.\n`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#1c1f22;padding:24px">
<p style="margin:0 0 12px">Your QuickScript password</p>
<p style="margin:0 0 16px;font-family:'Courier New',monospace;font-size:24px;letter-spacing:2px;color:#1c1f22">${password}</p>
<p style="margin:0 0 4px;color:#5f6b70">Expires in 10 minutes. Works once.</p>
<p style="margin:0;color:#5f6b70">If you did not ask for this, ignore it.</p>
</div>`;
  return { subject, text, html };
}
