import { NextRequest, NextResponse } from "next/server";

const SUPPORT_EMAIL = "support@noormexa.com";
const SENDER_EMAIL = "NOORMEXA Website <noreply@auth.noormexa.com>";

const MAX_NAME = 100;
const MAX_EMAIL = 160;
const MAX_TYPE = 120;
const MAX_MESSAGE = 4000;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("NOORMEXA contact: RESEND_API_KEY is not configured");
      return NextResponse.json({ error: "mail_not_configured" }, { status: 503 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "invalid_content_type" }, { status: 415 });
    }

    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const inquiryType = String(body?.inquiryType ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const website = String(body?.website ?? "").trim();
    const language = body?.language === "en" ? "en" : "ar";

    if (website) {
      return NextResponse.json({ ok: true });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid =
      !name ||
      !emailPattern.test(email) ||
      !inquiryType ||
      !message ||
      name.length > MAX_NAME ||
      email.length > MAX_EMAIL ||
      inquiryType.length > MAX_TYPE ||
      message.length > MAX_MESSAGE;

    if (invalid) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeType = escapeHtml(inquiryType);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

    const subject = `NOORMEXA Contact — ${inquiryType}`;
    const intro = language === "ar" ? "رسالة جديدة من صفحة التواصل الرسمية" : "New message from the official contact page";

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [SUPPORT_EMAIL],
        reply_to: email,
        subject,
        text: `${intro}\n\nName: ${name}\nEmail: ${email}\nType: ${inquiryType}\n\n${message}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#0f172a;line-height:1.7">
            <div style="border-bottom:3px solid #f97316;padding-bottom:14px;margin-bottom:24px">
              <strong style="font-size:24px">NOORMEXA</strong>
              <div style="color:#64748b;font-size:13px">${intro}</div>
            </div>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Inquiry type:</strong> ${safeType}</p>
            <div style="margin-top:24px;padding:18px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc">${safeMessage}</div>
          </div>
        `,
      }),
      cache: "no-store",
    });

    if (!resendResponse.ok) {
      const details = await resendResponse.text();
      console.error("NOORMEXA contact: Resend rejected request", resendResponse.status, details.slice(0, 500));
      return NextResponse.json({ error: "mail_send_failed" }, { status: 502 });
    }

    const result = (await resendResponse.json()) as { id?: string };
    console.info("NOORMEXA contact: message accepted", result.id ?? "unknown");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("NOORMEXA contact: unexpected error", error);
    return NextResponse.json({ error: "unexpected_error" }, { status: 500 });
  }
}
