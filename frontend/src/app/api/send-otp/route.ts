import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // CAPSTONE BYPASS: Since the email provider is blocking the sending due to domain authentication issues,
    // we bypass the actual API call. The OTP is already being returned to the frontend and displayed on screen.
    console.log(`[OTP SENT (BYPASSED)] To: ${email} | Code: ${otp}`);
    
    return NextResponse.json({ success: true, message: "Email bypassed for development" });
  } catch (error: any) {
    console.error("[EMAIL ERROR]", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
