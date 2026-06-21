import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `"LJ Veterinary Clinic" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Password Reset OTP - LJ Veterinary Clinic',
      html: `
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
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully via Nodemailer" });
  } catch (error: any) {
    console.error("[NODEMAILER ERROR]", error);
    return NextResponse.json(
      { error: "Failed to send email via Nodemailer", details: error.message },
      { status: 500 }
    );
  }
}
