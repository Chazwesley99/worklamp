import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import mjml2html from 'mjml';
import fs from 'fs';
import path from 'path';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Initialize transporter if SMTP is configured
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            }
          : undefined,
      });
    }
  }

  /**
   * Load and compile MJML template
   */
  private loadTemplate(templateName: string, variables: Record<string, string>): string {
    const templatePath = path.join(__dirname, '../templates/email', `${templateName}.mjml`);
    let mjmlContent = fs.readFileSync(templatePath, 'utf-8');

    // Replace variables in template
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      mjmlContent = mjmlContent.replace(regex, variables[key]);
    });

    const { html } = mjml2html(mjmlContent);
    return html;
  }

  /**
   * Generate email verification token
   */
  generateVerificationToken(userId: string, email: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign(
      {
        type: 'email_verification',
        userId,
        email,
      },
      secret,
      { expiresIn: '24h' } // Verification valid for 24 hours
    );
  }

  /**
   * Verify email verification token
   */
  verifyVerificationToken(token: string): {
    userId: string;
    email: string;
  } {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as {
      type: string;
      userId: string;
      email: string;
    };

    if (decoded.type !== 'email_verification') {
      throw new Error('INVALID_TOKEN_TYPE');
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  }

  /**
   * Generate invitation token
   */
  generateInvitationToken(tenantId: string, email: string, role: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign(
      {
        type: 'invitation',
        tenantId,
        email,
        role,
      },
      secret,
      { expiresIn: '7d' } // Invitation valid for 7 days
    );
  }

  /**
   * Verify invitation token
   */
  verifyInvitationToken(token: string): {
    tenantId: string;
    email: string;
    role: string;
  } {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as {
      type: string;
      tenantId: string;
      email: string;
      role: string;
    };

    if (decoded.type !== 'invitation') {
      throw new Error('INVALID_TOKEN_TYPE');
    }

    return {
      tenantId: decoded.tenantId,
      email: decoded.email,
      role: decoded.role,
    };
  }

  /**
   * Send invitation email
   */
  async sendInvitationEmail(
    email: string,
    inviterName: string,
    tenantName: string,
    invitationToken: string
  ) {
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite?token=${invitationToken}`;

    if (!this.transporter) {
      // If no SMTP configured, just log the invitation link
      console.log('=== INVITATION EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`From: ${inviterName}`);
      console.log(`Tenant: ${tenantName}`);
      console.log(`Invitation Link: ${invitationLink}`);
      console.log('========================');
      return;
    }

    const html = this.loadTemplate('invitation', {
      tenantName,
      inviterName,
      invitationLink,
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@worklamp.com',
      to: email,
      subject: `You've been invited to join ${tenantName} on Worklamp`,
      html,
      text: `
        You've been invited to join ${tenantName}
        
        ${inviterName} has invited you to join their team on Worklamp.
        
        Click this link to accept the invitation:
        ${invitationLink}
        
        This invitation will expire in 7 days.
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, verificationToken: string) {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    if (!this.transporter) {
      // If no SMTP configured, just log the verification link
      console.log('=== VERIFICATION EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Verification Link: ${verificationLink}`);
      console.log('==========================');
      return;
    }

    const html = this.loadTemplate('verification', {
      verificationLink,
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@worklamp.com',
      to: email,
      subject: 'Verify your email address',
      html,
      text: `
        Verify your email address
        
        Thank you for signing up for Worklamp! Please verify your email address by clicking this link:
        ${verificationLink}
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send newsletter email
   */
  async sendNewsletterEmail(
    email: string,
    subject: string,
    title: string,
    content: string,
    unsubscribeToken: string
  ) {
    const unsubscribeLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?token=${unsubscribeToken}`;

    if (!this.transporter) {
      console.log('=== NEWSLETTER EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Unsubscribe Link: ${unsubscribeLink}`);
      console.log('========================');
      return;
    }

    const html = this.loadTemplate('newsletter', {
      subject,
      title,
      content,
      unsubscribeLink,
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@worklamp.com',
      to: email,
      subject,
      html,
      text: `
        ${title}
        
        ${content}
        
        ---
        You're receiving this email because you opted in to receive communications from Worklamp.
        Unsubscribe: ${unsubscribeLink}
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send welcome email to new newsletter subscriber
   */
  async sendWelcomeEmail(email: string, name: string, unsubscribeToken: string) {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
    const unsubscribeLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?token=${unsubscribeToken}`;

    if (!this.transporter) {
      console.log('=== WELCOME EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Dashboard: ${dashboardUrl}`);
      console.log(`Unsubscribe Link: ${unsubscribeLink}`);
      console.log('=====================');
      return;
    }

    const html = this.loadTemplate('welcome', {
      name,
      dashboardUrl,
      unsubscribeLink,
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@worklamp.com',
      to: email,
      subject: 'Welcome to Worklamp! 🎉',
      html,
      text: `
        Hi ${name},
        
        Thank you for subscribing to the Worklamp newsletter! We're excited to have you join our community of developers and project managers.
        
        You'll receive updates about:
        • New features and improvements
        • Tips and best practices for project management
        • Developer productivity insights
        • Exclusive early access to new releases
        
        Get Started: ${dashboardUrl}
        
        Worklamp is a project management platform built specifically for development teams. With features like real-time collaboration, bug tracking, milestone management, and team communication, we help you ship better software faster.
        
        Ready to streamline your workflow? Start with our free tier—no credit card required.
        
        ---
        You're receiving this email because you subscribed to the Worklamp newsletter.
        Unsubscribe: ${unsubscribeLink}
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send contact form email to admin
   */
  async sendContactFormEmail(name: string, email: string, message: string) {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.log('=== CONTACT FORM SUBMISSION ===');
      console.log(`From: ${name} (${email})`);
      console.log(`Message: ${message}`);
      console.log('================================');
      return;
    }

    if (!this.transporter) {
      console.log('=== CONTACT FORM EMAIL ===');
      console.log(`To: ${adminEmail}`);
      console.log(`From: ${name} (${email})`);
      console.log(`Message: ${message}`);
      console.log('==========================');
      return;
    }

    const html = this.loadTemplate('contact', {
      name,
      email,
      message,
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@worklamp.com',
      to: adminEmail,
      replyTo: email,
      subject: `Contact Form Submission from ${name}`,
      html,
      text: `
        New Contact Form Submission
        
        From: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Generate unsubscribe token
   */
  generateUnsubscribeToken(userId: string, email: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign(
      {
        type: 'unsubscribe',
        userId,
        email,
      },
      secret,
      { expiresIn: '90d' } // Long-lived token for unsubscribe
    );
  }

  /**
   * Verify unsubscribe token
   */
  verifyUnsubscribeToken(token: string): {
    userId: string;
    email: string;
  } {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as {
      type: string;
      userId: string;
      email: string;
    };

    if (decoded.type !== 'unsubscribe') {
      throw new Error('INVALID_TOKEN_TYPE');
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  }
}

export const emailService = new EmailService();
