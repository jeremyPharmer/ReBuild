import type { ReminderKind } from "./reminders";
import { reminderLink } from "./reminders";

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; status?: number };

function fromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() || "REBUILD <onboarding@resend.dev>"
  );
}

export async function sendReminderEmail(opts: {
  to: string;
  kind: ReminderKind;
  displayName?: string;
}): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return {
      ok: false,
      error: "RESEND_API_KEY is not configured on this environment",
      status: 503,
    };
  }

  const link = reminderLink(opts.kind);
  const isMorning = opts.kind === "morning";
  const subject = isMorning
    ? "REBUILD — Start the day"
    : "REBUILD — Close the day";
  const greeting = opts.displayName?.trim()
    ? `Hey ${opts.displayName.trim()},`
    : "Hey,";
  const bodyLine = isMorning
    ? "Open Start the day and set your intention. Don’t skip the loop."
    : "Open Close the day and check in. Finish today’s Rebuild.";
  const cta = isMorning ? "Start the day →" : "Close the day →";

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.5;color:#0f1c18;max-width:520px">
      <p style="letter-spacing:0.12em;text-transform:uppercase;font-size:12px;color:#5a6b63;margin:0 0 12px">REBUILD</p>
      <h1 style="font-size:28px;margin:0 0 12px">${isMorning ? "Start the day" : "Close the day"}</h1>
      <p style="margin:0 0 16px">${greeting}</p>
      <p style="margin:0 0 20px">${bodyLine}</p>
      <p style="margin:0 0 28px">
        <a href="${link}" style="display:inline-block;background:#1f6b4a;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">${cta}</a>
      </p>
      <p style="margin:0;font-size:13px;color:#5a6b63">
        Or open <a href="${link}" style="color:#1f6b4a">${link}</a>
      </p>
    </div>
  `;

  const text = `${greeting}\n\n${bodyLine}\n\n${link}\n`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [opts.to.trim()],
      subject,
      html,
      text,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: { message?: string };
  };

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error:
        data.error?.message ||
        data.message ||
        `Resend failed (${res.status})`,
    };
  }

  return { ok: true, id: data.id };
}
