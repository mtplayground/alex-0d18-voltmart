type EmailEnvironment = Readonly<Record<string, string | undefined>> &
  Readonly<{
    MCTAI_EMAIL_URL?: string;
    MCTAI_EMAIL_APP_TOKEN?: string;
    ADMIN_EMAIL?: string;
  }>;

type EmailPayload = Readonly<{
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}>;

export type EmailSendResult =
  | Readonly<{
      status: "sent";
      id?: string;
    }>
  | Readonly<{
      status: "skipped";
      reason: string;
    }>;

export function getAdminEmailRecipient(env: EmailEnvironment = process.env) {
  return env.ADMIN_EMAIL?.trim() || null;
}

export async function sendEmail(
  payload: EmailPayload,
  env: EmailEnvironment = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<EmailSendResult> {
  const emailUrl = env.MCTAI_EMAIL_URL?.trim();
  const appToken = env.MCTAI_EMAIL_APP_TOKEN?.trim();

  if (!emailUrl || !appToken) {
    return {
      status: "skipped",
      reason: "email service not configured",
    };
  }

  if (!payload.html && !payload.text) {
    throw new Error("email requires html or text content");
  }

  const response = await fetchImpl(emailUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: payload.to,
      subject: payload.subject,
      ...(payload.html ? { html: payload.html } : {}),
      ...(payload.text ? { text: payload.text } : {}),
      ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
    }),
  });

  if (response.status === 429) {
    throw new Error("email rate limited - back off and retry");
  }

  if (!response.ok) {
    throw new Error(`email send failed: ${response.status} ${await response.text()}`);
  }

  const responseBody = (await response.json().catch(() => ({}))) as { id?: unknown };

  return {
    status: "sent",
    id: typeof responseBody.id === "string" ? responseBody.id : undefined,
  };
}
