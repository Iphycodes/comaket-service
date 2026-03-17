/**
 * notifications/notifications.service.ts - Email Notification Service
 * =====================================================================
 * Sends transactional emails via Resend (HTTP API) or Nodemailer (SMTP).
 *
 * This is a pure service (no controller) — other modules call it
 * when they need to send an email:
 *
 *   AuthService       → sendVerificationOtp(), sendPasswordReset()
 *   OrdersService     → sendOrderConfirmation(), sendNewOrderAlert()
 *   ListingsService   → sendListingApproved(), sendListingRejected()
 *
 * PROVIDER SELECTION (automatic):
 *   - If RESEND_API_KEY is set → uses Resend (HTTP, works on all cloud providers)
 *   - Else if MAIL_HOST/USER/PASSWORD → falls back to Nodemailer (SMTP)
 *   - Else → logs emails to console (dev fallback)
 *
 * RESEND SETUP:
 *   1. Sign up at https://resend.com
 *   2. Add & verify your domain (or use onboarding@resend.dev for testing)
 *   3. Get your API key from the dashboard
 *   4. Set RESEND_API_KEY in .env
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';
import {
  EmailBrand,
  verificationOtpTemplate,
  welcomeTemplate,
  passwordResetTemplate,
  orderConfirmationTemplate,
  newOrderAlertTemplate,
  orderStatusUpdateTemplate,
  listingApprovedTemplate,
  listingRejectedTemplate,
} from './templates/email-templates';

type EmailProvider = 'resend' | 'nodemailer' | 'none';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromAddress: string;
  private readonly adminEmail: string | null;
  private readonly isConfigured: boolean;
  private readonly provider: EmailProvider;
  private readonly brand: EmailBrand;

  constructor(private configService: ConfigService) {
    const appName = this.configService.get<string>('app.name') || 'Kraft';
    const logoUrl = this.configService.get<string>('app.logoUrl') || null;
    const frontendUrl =
      this.configService.get<string>('app.frontendUrl') ||
      'http://localhost:3000';

    this.brand = { appName, logoUrl, frontendUrl };

    const resendApiKey = this.configService.get<string>('app.resendApiKey');
    const host = this.configService.get<string>('app.mail.host');
    const port = this.configService.get<number>('app.mail.port');
    const user = this.configService.get<string>('app.mail.user');
    const password = this.configService.get<string>('app.mail.password');
    this.fromAddress =
      this.configService.get<string>('app.mail.from') ||
      `${appName} <noreply@kraft.ng>`;
    this.adminEmail = this.configService.get<string>('app.adminEmail') || null;

    // Pick provider: Resend (HTTP) > Nodemailer (SMTP) > none
    if (resendApiKey) {
      this.provider = 'resend';
      this.isConfigured = true;
      this.resend = new Resend(resendApiKey);
      this.logger.log('══════════════════════════════════════════');
      this.logger.log('✅ MAIL: Resend (HTTP API) configured');
      this.logger.log(`   From: ${this.fromAddress}`);
      this.logger.log(
        `   Admin email: ${this.adminEmail || 'NOT SET — add ADMIN_EMAIL to .env'}`,
      );
      this.logger.log('══════════════════════════════════════════');
    } else if (host && user && password) {
      this.provider = 'nodemailer';
      this.isConfigured = true;
      // Resolve SMTP host to IPv4, then create transporter
      (async () => {
        let resolvedHost = host;
        try {
          const addresses = await dns.promises.resolve4(host);
          if (addresses?.length) {
            resolvedHost = addresses[0];
            this.logger.log(`Resolved ${host} → ${resolvedHost} (IPv4)`);
          }
        } catch {
          this.logger.warn(`Could not resolve ${host} to IPv4, using hostname directly`);
        }

        this.transporter = nodemailer.createTransport({
          host: resolvedHost,
          port: port || 587,
          secure: port === 465,
          auth: { user, pass: password },
          tls: { servername: host },
        } as Record<string, any>);

        this.transporter
          .verify()
          .then(() => {
            this.logger.log('══════════════════════════════════════════');
            this.logger.log('✅ MAIL: SMTP connected and ready to send');
            this.logger.log(`   Host: ${resolvedHost}:${port || 587}`);
            this.logger.log(`   From: ${this.fromAddress}`);
            this.logger.log(
              `   Admin email: ${this.adminEmail || 'NOT SET — add ADMIN_EMAIL to .env'}`,
            );
            this.logger.log('══════════════════════════════════════════');
          })
          .catch((err) => {
            this.logger.error('══════════════════════════════════════════');
            this.logger.error(`❌ MAIL: SMTP connection FAILED — ${err.message}`);
            this.logger.error('    order receipts will NOT be sent!');
            this.logger.error(
              `   Check MAIL_HOST, MAIL_USER, MAIL_PASSWORD in .env`,
            );
            this.logger.error('══════════════════════════════════════════');
          });
      })();
    } else {
      this.provider = 'none';
      this.isConfigured = false;
      this.logger.warn('══════════════════════════════════════════');
      this.logger.warn(
        '⚠️  MAIL: NOT CONFIGURED — emails will only log to console',
      );
      this.logger.warn('    order receipts will NOT be sent!');
      this.logger.warn(
        '   To fix: set RESEND_API_KEY (recommended) or MAIL_HOST/MAIL_USER/MAIL_PASSWORD in .env',
      );
      this.logger.warn(`   Admin email: ${this.adminEmail || 'NOT SET'}`);
      this.logger.warn('══════════════════════════════════════════');
    }
  }

  // ─── Core Send Method ────────────────────────────────────

  private async send(
    to: string,
    subject: string,
    html: string,
    options?: { bccAdmin?: boolean },
  ): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.warn(`📧 EMAIL NOT SENT (not configured)`);
      this.logger.warn(`   To: ${to}`);
      this.logger.warn(`   Subject: ${subject}`);
      this.logger.warn(
        '   ⚠️  Set RESEND_API_KEY or MAIL_HOST/MAIL_USER/MAIL_PASSWORD in .env',
      );
      this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }

    try {
      if (this.provider === 'resend' && this.resend) {
        const payload: any = {
          from: this.fromAddress,
          to: [to],
          subject,
          html,
        };
        if (options?.bccAdmin && this.adminEmail) {
          payload.bcc = [this.adminEmail];
        }
        const { error } = await this.resend.emails.send(payload);
        if (error) {
          throw new Error(error.message);
        }
        this.logger.log(`📧 Email sent to ${to} via Resend`);
      } else if (this.provider === 'nodemailer' && this.transporter) {
        const mailOptions: any = {
          from: this.fromAddress,
          to,
          subject,
          html,
        };
        if (options?.bccAdmin && this.adminEmail) {
          mailOptions.bcc = this.adminEmail;
        }
        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(`📧 Email sent to ${to} — MessageId: ${info.messageId}`);
      } else {
        this.logger.warn(`📧 Email provider not ready yet, retrying in 3s...`);
        // Transporter might not be initialized yet (async DNS resolution)
        await new Promise((r) => setTimeout(r, 3000));
        if (this.transporter) {
          const info = await this.transporter.sendMail({
            from: this.fromAddress,
            to,
            subject,
            html,
          });
          this.logger.log(`📧 Email sent to ${to} (retry) — MessageId: ${info.messageId}`);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
    }
  }

  // ─── Public Raw Email Method ─────────────────────────────

  async sendRawEmail(to: string, subject: string, html: string): Promise<void> {
    await this.send(to, subject, html);
  }

  // ═══════════════════════════════════════════════════════════
  // AUTH EMAILS
  // ═══════════════════════════════════════════════════════════

  async sendVerificationOtp(
    email: string,
    firstName: string,
    otp: string,
  ): Promise<void> {
    const { subject, html } = verificationOtpTemplate(this.brand, {
      firstName,
      otp,
    });
    await this.send(email, subject, html);
  }

  async sendWelcome(email: string, firstName: string): Promise<void> {
    const { subject, html } = welcomeTemplate(this.brand, { firstName });
    await this.send(email, subject, html);
  }

  async sendPasswordReset(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('app.frontendUrl') ||
      'http://localhost:3000';

    const { subject, html } = passwordResetTemplate(this.brand, {
      firstName,
      resetToken,
      frontendUrl,
    });
    await this.send(email, subject, html);
  }

  // ═══════════════════════════════════════════════════════════
  // ORDER EMAILS
  // ═══════════════════════════════════════════════════════════

  async sendOrderConfirmation(
    buyerEmail: string,
    data: {
      buyerName: string;
      orderNumber: string;
      items: Array<{ itemName: string; quantity: number; unitPrice: number }>;
      totalAmount: number;
      shippingAddress: {
        fullName: string;
        address: string;
        city: string;
        state: string;
      };
    },
  ): Promise<void> {
    const { subject, html } = orderConfirmationTemplate(this.brand, data);
    await this.send(buyerEmail, subject, html);
  }

  async sendAdminOrderCopy(data: {
    buyerName: string;
    orderNumber: string;
    items: Array<{ itemName: string; quantity: number; unitPrice: number }>;
    totalAmount: number;
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      state: string;
    };
  }): Promise<void> {
    if (!this.adminEmail) return;

    const { subject, html } = orderConfirmationTemplate(this.brand, data);
    await this.send(this.adminEmail, `[Admin Copy] ${subject}`, html);
  }

  async sendNewOrderAlert(
    sellerEmail: string,
    data: {
      sellerName: string;
      orderNumber: string;
      itemName: string;
      quantity: number;
      sellerPayout: number;
      buyerName: string;
    },
  ): Promise<void> {
    const { subject, html } = newOrderAlertTemplate(this.brand, data);
    await this.send(sellerEmail, subject, html);
  }

  async sendOrderStatusUpdate(
    buyerEmail: string,
    data: {
      buyerName: string;
      orderNumber: string;
      status: string;
      trackingNumber?: string;
      carrier?: string;
    },
  ): Promise<void> {
    const { subject, html } = orderStatusUpdateTemplate(this.brand, data);
    await this.send(buyerEmail, subject, html);
  }

  // ═══════════════════════════════════════════════════════════
  // LISTING EMAILS
  // ═══════════════════════════════════════════════════════════

  async sendListingApproved(
    sellerEmail: string,
    sellerName: string,
    itemName: string,
  ): Promise<void> {
    const { subject, html } = listingApprovedTemplate(this.brand, {
      sellerName,
      itemName,
    });
    await this.send(sellerEmail, subject, html);
  }

  async sendListingRejected(
    sellerEmail: string,
    sellerName: string,
    itemName: string,
    reason: string,
  ): Promise<void> {
    const { subject, html } = listingRejectedTemplate(this.brand, {
      sellerName,
      itemName,
      reason,
    });
    await this.send(sellerEmail, subject, html);
  }
}
