import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

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
    const decoded = jwt.verify(token, secret) as any;

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
    if (!this.transporter) {
      // If no SMTP configured, just log the invitation link
      const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite?token=${invitationToken}`;
      console.log('=== INVITATION EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`From: ${inviterName}`);
      console.log(`Tenant: ${tenantName}`);
      console.log(`Invitation Link: ${invitationLink}`);
      console.log('========================');
      return;
    }

    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite?token=${invitationToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@worklamp.com',
      to: email,
      subject: `You've been invited to join ${tenantName} on Worklamp`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to join ${tenantName}</h2>
          <p>${inviterName} has invited you to join their team on Worklamp.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${invitationLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Accept Invitation
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${invitationLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            This invitation will expire in 7 days.
          </p>
        </div>
      `,
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
    if (!this.transporter) {
      // If no SMTP configured, just log the verification link
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      console.log('=== VERIFICATION EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Verification Link: ${verificationLink}`);
      console.log('==========================');
      return;
    }

    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@worklamp.com',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email address</h2>
          <p>Thank you for signing up for Worklamp! Please verify your email address by clicking the button below:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationLink}</p>
        </div>
      `,
      text: `
        Verify your email address
        
        Thank you for signing up for Worklamp! Please verify your email address by clicking this link:
        ${verificationLink}
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
