import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter;
  private fromAddress: string;

  constructor() {
    this.fromAddress = config.email.from;
    
    // Create transporter with SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  /**
   * Send email with error handling
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    
    const html = this.getPasswordResetTemplate(resetUrl);
    const text = `
      Password Reset Request
      
      You requested to reset your password for your Ghostypedia account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      The Ghostypedia Team
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Ghostypedia Password',
      html,
      text,
    });
  }

  /**
   * Get HTML template for password reset email
   */
  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #6b46c1;
            margin: 0;
          }
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 6px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #6b46c1;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #553c9a;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            border-radius: 4px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👻 Ghostypedia</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password for your Ghostypedia account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b46c1;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p style="margin-top: 20px;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>This is an automated email from Ghostypedia. Please do not reply to this email.</p>
            <p>&copy; 2024 Ghostypedia. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
