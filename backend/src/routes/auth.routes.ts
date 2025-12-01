import { Router } from 'express';
import passport from '../config/passport';
import { authController } from '../controllers/auth.controller';
import { generateTokens } from '../utils/jwt';
import { authLimiter } from '../middleware/ratelimit.middleware';

const router = Router();

// Email/password authentication routes with rate limiting
router.post('/signup', authLimiter, (req, res) => authController.signup(req, res));
router.post('/verify-email', authLimiter, (req, res) => authController.verifyEmail(req, res));
router.post('/login', authLimiter, (req, res) => authController.login(req, res));
router.post('/refresh', authLimiter, (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/accept-invitation', authLimiter, (req, res) =>
  authController.acceptInvitation(req, res)
);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = req.user as any;

      if (!user) {
        return res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_user`
        );
      }

      // Get user's primary tenant membership
      const primaryMembership = user.tenantMemberships?.[0];
      if (!primaryMembership) {
        return res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_tenant`
        );
      }

      // Generate tokens
      const tokens = await generateTokens({
        userId: user.id,
        tenantId: primaryMembership.tenantId,
        role: primaryMembership.role,
        email: user.email,
      });

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Redirect to frontend with access token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${tokens.accessToken}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=callback_failed`
      );
    }
  }
);

export default router;
