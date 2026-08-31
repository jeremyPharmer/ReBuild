import type { ReminderKind } from "./reminders";
import { buildReminderDigest } from "./digest-email";
import type { RebuildState } from "./types";

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; status?: number };

function fromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() || "JeremyOS <onboarding@resend.dev>"
  );
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return {
      ok: false,
      error: "RESEND_API_KEY is not configured on this environment",
      status: 503,
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [opts.to.trim()],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
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

export async function sendReminderEmail(opts: {
  to: string;
  kind: ReminderKind;
  state: RebuildState;
}): Promise<SendEmailResult> {
  const digest = buildReminderDigest(opts.kind, opts.state);
  return sendEmail({
    to: opts.to,
    subject: digest.subject,
    html: digest.html,
    text: digest.text,
  });
}
