import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASSWORD;
    const senderEmail = process.env.SMTP_USER || "system@ljvetclinic.com";

    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing" }, { status: 500 });
    }

    const htmlContent = `
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
            <h2 style='color: #FF4FA3; text-align: center;'>LJ Veterinary Clinic</h2>
            <p>Hello,</p>
            <p>You recently requested to reset your password. Here is your 6-digit One-Time Password (OTP):</p>
            <div style='background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;'>
                <h1 style='margin: 0; color: #333; letter-spacing: 5px;'>${otp}</h1>
            </div>
            <p style='color: #666; font-size: 14px;'>This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
            <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;' />
            <p style='color: #999; font-size: 12px; text-align: center;'>Compassionate Care for Every Paw</p>
        </div>
    `;

    let response;
    if (apiKey.startsWith("re_")) {
      // Use Resend API
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: senderEmail === "system@ljvetclinic.com" ? "onboarding@resend.dev" : senderEmail,
          to: email,
          subject: "Your Password Reset OTP - LJ Veterinary Clinic",
          html: htmlContent
        })
      });
    } else {
      // Use Brevo API
      if (apiKey.startsWith("xsmtpsib-")) {
        return NextResponse.json({ error: "You are using a Brevo SMTP password instead of an API key. Please generate an API Key from the 'API Keys' tab in Brevo." }, { status: 400 });
      }
      response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": apiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: "LJ Veterinary Clinic", email: senderEmail },
          to: [{ email: email }],
          subject: "Your Password Reset OTP - LJ Veterinary Clinic",
          htmlContent: htmlContent
        })
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("[EMAIL ERROR]", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
