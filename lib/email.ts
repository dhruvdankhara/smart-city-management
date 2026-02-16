import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: EmailOptions): Promise<void> {
  await transporter.sendMail({
    from: `"Smart City Management" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export function generateInviteEmail(
  name: string,
  role: string,
  setupLink: string,
): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a1a;">Welcome to Smart City Management</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>You have been invited to join as a <strong>${role}</strong>.</p>
      <p>Please click the link below to set up your account and create a password:</p>
      <a href="${setupLink}"
         style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; border-radius: 8px; text-decoration: none; margin: 16px 0;">
        Set Up Account
      </a>
      <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
    </div>
  `;
}
