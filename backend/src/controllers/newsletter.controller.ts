import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { emailService } from '../services/email.service';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

const unsubscribeSchema = z.object({
  token: z.string(),
});

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export class NewsletterController {
  /**
   * POST /api/newsletter/subscribe
   * Subscribe to newsletter
   */
  async subscribe(req: Request, res: Response) {
    try {
      const { email, name } = subscribeSchema.parse(req.body);

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Update existing user to opt in
        await prisma.user.update({
          where: { id: user.id },
          data: { emailOptIn: true },
        });
      } else {
        // Create a newsletter-only user record
        user = await prisma.user.create({
          data: {
            email,
            name: name || 'Newsletter Subscriber',
            emailOptIn: true,
            emailVerified: false,
            authProvider: 'email',
          },
        });
      }

      res.json({
        message: 'Successfully subscribed to newsletter',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      console.error('Newsletter subscription error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during subscription',
        },
      });
    }
  }

  /**
   * POST /api/newsletter/unsubscribe
   * Unsubscribe from newsletter
   */
  async unsubscribe(req: Request, res: Response) {
    try {
      const { token } = unsubscribeSchema.parse(req.body);

      // Verify unsubscribe token
      const { userId, email } = emailService.verifyUnsubscribeToken(token);

      // Update user to opt out
      await prisma.user.update({
        where: { id: userId, email },
        data: { emailOptIn: false },
      });

      res.json({
        message: 'Successfully unsubscribed from newsletter',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_TOKEN_TYPE') {
        return res.status(400).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid unsubscribe token',
          },
        });
      }

      console.error('Newsletter unsubscribe error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during unsubscribe',
        },
      });
    }
  }

  /**
   * POST /api/contact
   * Send contact form message
   */
  async contact(req: Request, res: Response) {
    try {
      const { name, email, message } = contactSchema.parse(req.body);

      // Send contact form email to admin
      await emailService.sendContactFormEmail(name, email, message);

      res.json({
        message: 'Your message has been sent successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      console.error('Contact form error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while sending your message',
        },
      });
    }
  }

  /**
   * POST /api/newsletter/send
   * Send newsletter to all opted-in users (admin only)
   */
  async sendNewsletter(req: Request, res: Response) {
    try {
      // Check if user is admin
      const authReq = req as { user?: { userId: string; email: string } };
      const adminEmail = process.env.ADMIN_EMAIL;

      if (!authReq.user || authReq.user.email !== adminEmail) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Only administrators can send newsletters',
          },
        });
      }

      const { subject, title, content } = req.body;

      if (!subject || !title || !content) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Subject, title, and content are required',
          },
        });
      }

      // Get all users who opted in
      const users = await prisma.user.findMany({
        where: {
          emailOptIn: true,
          emailVerified: true,
        },
        select: {
          id: true,
          email: true,
        },
      });

      // Send newsletter to each user
      const sendPromises = users.map(async (user: { id: string; email: string }) => {
        const unsubscribeToken = emailService.generateUnsubscribeToken(user.id, user.email);
        await emailService.sendNewsletterEmail(
          user.email,
          subject,
          title,
          content,
          unsubscribeToken
        );
      });

      await Promise.all(sendPromises);

      res.json({
        message: `Newsletter sent to ${users.length} subscribers`,
        count: users.length,
      });
    } catch (error) {
      console.error('Send newsletter error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while sending newsletter',
        },
      });
    }
  }
}

export const newsletterController = new NewsletterController();
