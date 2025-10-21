import { Resend } from "resend";
import nodemailer from "nodemailer";
import { render } from "@vue-email/render";
import type { H3Event } from "h3";
import welcomeEmail from "~~/server/emails/welcomeEmail.vue";
import verifyOtp from "~~/server/emails/verifyOtp.vue";

export class EmailService {
  private readonly resend: Resend | null = null;
  private readonly transporter: nodemailer.Transporter | null = null;
  private readonly sender: string;

  constructor(event: H3Event) {
    const config = useRuntimeConfig(event);
    const { private: priv } = config;

    if (priv.resendApiKey) {
      this.resend = new Resend(priv.resendApiKey);
    } else if (priv.smtp?.host) {
      this.transporter = nodemailer.createTransport({
        host: priv.smtp.host,
        port: Number(priv.smtp.port || 587),
        secure: Number(priv.smtp.port) === 465,
        auth: {
          user: priv.smtp.user,
          pass: priv.smtp.pass,
        },
      });
    }

    this.sender = priv.senderEmail || priv.smtp.user || "noreply@example.com";
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (this.resend) {
      await this.resend.emails.send({
        from: this.sender,
        to: [to],
        subject,
        html,
      });
    } else if (this.transporter) {
      await this.transporter.sendMail({
        from: this.sender,
        to,
        subject,
        html,
      });
    } else {
      console.warn(
        "No email provider configured. Set either NUXT_PRIVATE_RESEND_API_KEY or SMTP credentials."
      );
    }
  }

  async sendOtp(email: string, otp: string, redirectUrl: string) {
    const html = await this.generateOtpTemplate(otp, redirectUrl);
    await this.sendEmail(email, "Your Login Code", html);
  }

  async sendWelcomeEmail(email: string, username: string, appUrl: string) {
    const html = await this.generateWelcomeTemplate(username, appUrl);
    await this.sendEmail(email, "Welcome to Shelve!", html);
  }

  private async generateOtpTemplate(otp: string, redirectUrl: string): Promise<string> {
    try {
      return await render(verifyOtp, {
        otp,
        redirectUrl,
      })
    } catch (error) {
      console.error(error)
      return `<h1>OTP: ${otp}</h1>`
    }
  }

  private async generateWelcomeTemplate(username: string, appUrl: string): Promise<string> {
    try {
      return await render(welcomeEmail, {
        username: username,
        redirectUrl: appUrl,
      })
    } catch (error) {
      console.error(error)
      return `<h1>Welcome to Shelve, ${username}!</h1>`
    }
  }
}
