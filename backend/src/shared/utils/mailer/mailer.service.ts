/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import * as fs from 'fs';
import ejs from 'ejs';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

export interface WelcomeEmailContext {
  name: string;
  email: string;
  projectName?: string;
  supportEmail?: string;
  loginUrl?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;
  private templatesPath: string;

  constructor(private configService: ConfigService) {
    this.templatesPath = path.join(__dirname, '../../../templates/email');
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get<string>('SMTP_PORT', '587')),
      secure: this.configService.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false, // Add this for Gmail
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
    this.logger.log('Email transporter initialized successfully');
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let html = options.html;

      if (options.template && options.context) {
        html = await this.renderTemplate(options.template, options.context);
      }

      const mailOptions = {
        from: this.configService.get<string>(
          'SMTP_FROM',
          'noreply@project-management.com',
        ),
        to: options.to,
        subject: options.subject,
        html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${options.to}: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
      );
    }
  }

  async sendWelcomeEmail(
    to: string,
    context: WelcomeEmailContext,
  ): Promise<void> {
    const emailOptions: EmailOptions = {
      to,
      subject: `Welcome to ${context.projectName || 'the Project Management System'}`,
      template: 'welcome',
      context: {
        ...context,
        loginUrl:
          context.loginUrl ||
          `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000/login')}`,
        supportEmail:
          context.supportEmail ||
          `${this.configService.get<string>('SUPPORT_EMAIL', 'support@project-management.com')}`,
        projectName: context.projectName || 'Project Management System',
        currentYear: new Date().getFullYear(),
      },
    };
    await this.sendEmail(emailOptions);
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);

      if (!fs.existsSync(templatePath)) {
        throw new Error(
          `Template ${templateName} not found at ${templatePath}`,
        );
      }

      const templateOptions = {
        filename: templatePath,
        cache: process.env.NODE_ENV === 'production',
        compileDebug: process.env.NODE_ENV !== 'production',
      };

      const html = await ejs.renderFile(templatePath, context, templateOptions);

      return html;
    } catch (error) {
      this.logger.error(
        `Template rendering failed for ${templateName}: ${error.message}`,
      );
      throw error;
    }
  }
}
