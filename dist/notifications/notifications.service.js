"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const email_templates_1 = require("./templates/email-templates");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        const appName = this.configService.get('app.name') || 'Kraft';
        const logoUrl = this.configService.get('app.logoUrl') || null;
        const frontendUrl = this.configService.get('app.frontendUrl') ||
            'http://localhost:3000';
        this.brand = { appName, logoUrl, frontendUrl };
        const host = this.configService.get('app.mail.host');
        const port = this.configService.get('app.mail.port');
        const user = this.configService.get('app.mail.user');
        const password = this.configService.get('app.mail.password');
        this.fromAddress =
            this.configService.get('app.mail.from') ||
                `${appName} <noreply@kraft.ng>`;
        this.adminEmail = this.configService.get('app.adminEmail') || null;
        this.isConfigured = !!(host && user && password);
        if (this.isConfigured) {
            this.transporter = nodemailer.createTransport({
                host,
                port: port || 587,
                secure: port === 465,
                auth: { user, pass: password },
            });
            this.transporter
                .verify()
                .then(() => {
                this.logger.log('══════════════════════════════════════════');
                this.logger.log('✅ MAIL: SMTP connected and ready to send');
                this.logger.log(`   Host: ${host}:${port || 587}`);
                this.logger.log(`   From: ${this.fromAddress}`);
                this.logger.log(`   Admin email: ${this.adminEmail || 'NOT SET — add ADMIN_EMAIL to .env'}`);
                this.logger.log('══════════════════════════════════════════');
            })
                .catch((err) => {
                this.logger.error('══════════════════════════════════════════');
                this.logger.error(`❌ MAIL: SMTP connection FAILED — ${err.message}`);
                this.logger.error('    order receipts will NOT be sent!');
                this.logger.error(`   Check MAIL_HOST, MAIL_USER, MAIL_PASSWORD in .env`);
                this.logger.error('══════════════════════════════════════════');
            });
        }
        else {
            this.logger.warn('══════════════════════════════════════════');
            this.logger.warn('⚠️  MAIL: NOT CONFIGURED — emails will only log to console');
            this.logger.warn('    order receipts will NOT be sent!');
            this.logger.warn('   To fix: set MAIL_HOST, MAIL_USER, MAIL_PASSWORD in .env');
            this.logger.warn('   For Gmail: use App Password (not your regular password)');
            this.logger.warn(`   Admin email: ${this.adminEmail || 'NOT SET'}`);
            this.logger.warn('══════════════════════════════════════════');
        }
    }
    async send(to, subject, html, options) {
        if (!this.isConfigured) {
            this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            this.logger.warn(`📧 EMAIL NOT SENT (SMTP not configured)`);
            this.logger.warn(`   To: ${to}`);
            this.logger.warn(`   Subject: ${subject}`);
            this.logger.warn('   ⚠️  Set MAIL_HOST/MAIL_USER/MAIL_PASSWORD in .env to send for real');
            this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return;
        }
        try {
            const mailOptions = {
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
        }
        catch (error) {
            this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
        }
    }
    async sendRawEmail(to, subject, html) {
        await this.send(to, subject, html);
    }
    async sendVerificationOtp(email, firstName, otp) {
        const { subject, html } = (0, email_templates_1.verificationOtpTemplate)(this.brand, {
            firstName,
            otp,
        });
        await this.send(email, subject, html);
    }
    async sendWelcome(email, firstName) {
        const { subject, html } = (0, email_templates_1.welcomeTemplate)(this.brand, { firstName });
        await this.send(email, subject, html);
    }
    async sendPasswordReset(email, firstName, resetToken) {
        const frontendUrl = this.configService.get('app.frontendUrl') ||
            'http://localhost:3000';
        const { subject, html } = (0, email_templates_1.passwordResetTemplate)(this.brand, {
            firstName,
            resetToken,
            frontendUrl,
        });
        await this.send(email, subject, html);
    }
    async sendOrderConfirmation(buyerEmail, data) {
        const { subject, html } = (0, email_templates_1.orderConfirmationTemplate)(this.brand, data);
        await this.send(buyerEmail, subject, html);
    }
    async sendAdminOrderCopy(data) {
        if (!this.adminEmail)
            return;
        const { subject, html } = (0, email_templates_1.orderConfirmationTemplate)(this.brand, data);
        await this.send(this.adminEmail, `[Admin Copy] ${subject}`, html);
    }
    async sendNewOrderAlert(sellerEmail, data) {
        const { subject, html } = (0, email_templates_1.newOrderAlertTemplate)(this.brand, data);
        await this.send(sellerEmail, subject, html);
    }
    async sendOrderStatusUpdate(buyerEmail, data) {
        const { subject, html } = (0, email_templates_1.orderStatusUpdateTemplate)(this.brand, data);
        await this.send(buyerEmail, subject, html);
    }
    async sendListingApproved(sellerEmail, sellerName, itemName) {
        const { subject, html } = (0, email_templates_1.listingApprovedTemplate)(this.brand, {
            sellerName,
            itemName,
        });
        await this.send(sellerEmail, subject, html);
    }
    async sendListingRejected(sellerEmail, sellerName, itemName, reason) {
        const { subject, html } = (0, email_templates_1.listingRejectedTemplate)(this.brand, {
            sellerName,
            itemName,
            reason,
        });
        await this.send(sellerEmail, subject, html);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map