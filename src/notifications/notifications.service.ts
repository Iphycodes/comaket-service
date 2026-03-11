/**
 * notifications/notifications.service.ts - Email Notification Service
 * =====================================================================
 * Sends transactional emails using Nodemailer.
 *
 * This is a pure service (no controller) — other modules call it
 * when they need to send an email:
 *
 *   AuthService       → sendVerificationOtp(), sendPasswordReset()
 *   OrdersService     → sendOrderConfirmation(), sendNewOrderAlert()
 *   ListingsService   → sendListingApproved(), sendListingRejected()
 *
 * SETUP:
 *   npm install nodemailer
 *   npm install -D @types/nodemailer
 *
 * GMAIL SETUP (for development):
 *   1. Enable 2FA on your Google account
 *   2. Go to: https://myaccount.google.com/apppasswords
 *   3. Create an "App Password" for "Mail"
 *   4. Use that password as MAIL_PASSWORD in .env
 *   5. Use your Gmail as MAIL_USER
 *
 * PRODUCTION:
 *   Use a proper email service like SendGrid, Mailgun, or Amazon SES.
 *   Just change the transport config — the templates stay the same.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
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

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;
  private readonly fromAddress: string;
  private readonly adminEmail: string | null;
  private readonly isConfigured: boolean;
  private readonly brand: EmailBrand;

  constructor(private configService: ConfigService) {
    const appName = this.configService.get<string>('app.name') || 'Kraft';
    const logoUrl = this.configService.get<string>('app.logoUrl') || null;
    const frontendUrl =
      this.configService.get<string>('app.frontendUrl') ||
      'http://localhost:3000';

    this.brand = { appName, logoUrl, frontendUrl };

    const host = this.configService.get<string>('app.mail.host');
    const port = this.configService.get<number>('app.mail.port');
    const user = this.configService.get<string>('app.mail.user');
    const password = this.configService.get<string>('app.mail.password');
    this.fromAddress =
      this.configService.get<string>('app.mail.from') ||
      `${appName} <noreply@kraft.ng>`;
    this.adminEmail = this.configService.get<string>('app.adminEmail') || null;

    // Only create transporter if mail credentials are configured
    this.isConfigured = !!(host && user && password);

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass: password },
      });

      // Verify connection on startup
      this.transporter
        .verify()
        .then(() => {
          this.logger.log('══════════════════════════════════════════');
          this.logger.log('✅ MAIL: SMTP connected and ready to send');
          this.logger.log(`   Host: ${host}:${port || 587}`);
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
    } else {
      this.logger.warn('══════════════════════════════════════════');
      this.logger.warn(
        '⚠️  MAIL: NOT CONFIGURED — emails will only log to console',
      );
      this.logger.warn('    order receipts will NOT be sent!');
      this.logger.warn(
        '   To fix: set MAIL_HOST, MAIL_USER, MAIL_PASSWORD in .env',
      );
      this.logger.warn(
        '   For Gmail: use App Password (not your regular password)',
      );
      this.logger.warn(`   Admin email: ${this.adminEmail || 'NOT SET'}`);
      this.logger.warn('══════════════════════════════════════════');
    }
  }

  // ─── Core Send Method ────────────────────────────────────

  /**
   * Send an email. If mail isn't configured, logs to console instead.
   * Optionally BCC the admin email on order-related notifications.
   */
  private async send(
    to: string,
    subject: string,
    html: string,
    options?: { bccAdmin?: boolean },
  ): Promise<void> {
    if (!this.isConfigured) {
      // Development fallback: log to console — EMAIL IS NOT ACTUALLY SENT
      this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.warn(`📧 EMAIL NOT SENT (SMTP not configured)`);
      this.logger.warn(`   To: ${to}`);
      this.logger.warn(`   Subject: ${subject}`);
      this.logger.warn(
        '   ⚠️  Set MAIL_HOST/MAIL_USER/MAIL_PASSWORD in .env to send for real',
      );
      this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }

    try {
      const mailOptions: any = {
        from: this.fromAddress,
        to,
        subject,
        html,
      };

      // BCC admin on order emails
      if (options?.bccAdmin && this.adminEmail) {
        mailOptions.bcc = this.adminEmail;
      }

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Email sent to ${to} — MessageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
    }
  }

  // ─── Public Raw Email Method ─────────────────────────────

  /**
   * Send a raw HTML email. Used by services that need to send
   * custom one-off emails (e.g., admin invites).
   */
  async sendRawEmail(to: string, subject: string, html: string): Promise<void> {
    await this.send(to, subject, html);
  }

  // ═══════════════════════════════════════════════════════════
  // AUTH EMAILS
  // ═══════════════════════════════════════════════════════════

  /**
   * Send verification OTP after registration.
   * Called by AuthService.register() and AuthService.resendVerification()
   */
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

  /**
   * Send welcome email after email verification.
   * Called by AuthService.verifyEmail()
   */
  async sendWelcome(email: string, firstName: string): Promise<void> {
    const { subject, html } = welcomeTemplate(this.brand, { firstName });
    await this.send(email, subject, html);
  }

  /**
   * Send password reset link.
   * Called by AuthService.forgotPassword()
   *
   * NOTE: We send the RAW (unhashed) token in the email link.
   * The hashed version is stored in the database.
   * When the user clicks the link, we hash what they send and compare.
   */
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

  /**
   * Send order confirmation to the BUYER after payment.
   * Called by OrdersService.confirmPayment()
   */
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

  /**
   * Send a copy of the order confirmation to the admin email.
   * Sent as a separate email (not BCC) to guarantee delivery.
   */
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

  /**
   * Alert the SELLER that someone bought their item.
   * Called by OrdersService.confirmPayment()
   */
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

  /**
   * Notify buyer when order status changes.
   * Called by OrdersService.updateStatus()
   */
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

  /**
   * Notify seller when their listing is approved.
   * Called by ListingsService.adminReview()
   */
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

  /**
   * Notify seller when their listing is rejected.
   * Called by ListingsService.adminReview()
   */
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