import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './database';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Extract user data from Google profile
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || 'User';
        const avatarUrl = profile.photos?.[0]?.value;

        console.log('[OAUTH DEBUG] Google profile data:', {
          email,
          name,
          avatarUrl,
          hasPhoto: !!profile.photos?.[0]?.value,
        });

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email },
          include: {
            tenantMemberships: {
              include: {
                tenant: true,
              },
            },
          },
        });

        if (user) {
          // User exists, update profile if needed
          // Always update avatarUrl if provided by Google (it may have changed)
          const shouldUpdate =
            user.authProvider !== 'google' || (avatarUrl && user.avatarUrl !== avatarUrl);

          if (shouldUpdate) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                authProvider: 'google',
                emailVerified: true, // Google emails are pre-verified
                avatarUrl: avatarUrl || user.avatarUrl,
              },
              include: {
                tenantMemberships: {
                  include: {
                    tenant: true,
                  },
                },
              },
            });
          }

          // Check if user has a tenant (newsletter-only users won't have one)
          if (!user.tenantMemberships || user.tenantMemberships.length === 0) {
            console.log('[OAUTH DEBUG] User exists but has no tenant, creating one...');

            // Create tenant for the user
            const tenant = await prisma.tenant.create({
              data: {
                name: `${user.name}'s Workspace`,
                ownerId: user.id,
                subscriptionTier: 'free',
                maxProjects: 1,
                maxTeamMembers: 1,
              },
            });

            // Add user as tenant member with owner role
            await prisma.tenantMember.create({
              data: {
                tenantId: tenant.id,
                userId: user.id,
                role: 'owner',
              },
            });

            // Reload user with tenant memberships
            const reloadedUser = await prisma.user.findUnique({
              where: { id: user.id },
              include: {
                tenantMemberships: {
                  include: {
                    tenant: true,
                  },
                },
              },
            });

            if (reloadedUser) {
              user = reloadedUser;
            }
          }
        } else {
          // Create new user
          console.log('[OAUTH DEBUG] Creating new user with avatarUrl:', avatarUrl);
          user = await prisma.user.create({
            data: {
              email,
              name,
              avatarUrl,
              authProvider: 'google',
              emailVerified: true, // Google emails are pre-verified
              emailOptIn: false, // Default to false for OAuth users
            },
            include: {
              tenantMemberships: {
                include: {
                  tenant: true,
                },
              },
            },
          });
          console.log('[OAUTH DEBUG] User created with avatarUrl:', user.avatarUrl);

          // Create tenant for the user
          const tenant = await prisma.tenant.create({
            data: {
              name: `${name}'s Workspace`,
              ownerId: user.id,
              subscriptionTier: 'free',
              maxProjects: 1,
              maxTeamMembers: 1,
            },
          });

          // Add user as tenant member with owner role
          await prisma.tenantMember.create({
            data: {
              tenantId: tenant.id,
              userId: user.id,
              role: 'owner',
            },
          });

          // Reload user with tenant memberships
          const reloadedUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              tenantMemberships: {
                include: {
                  tenant: true,
                },
              },
            },
          });

          if (!reloadedUser) {
            return done(new Error('Failed to reload user after tenant creation'), undefined);
          }

          console.log('[OAUTH DEBUG] Reloaded user avatarUrl:', reloadedUser.avatarUrl);
          user = reloadedUser;
        }

        // Check if user should be admin based on ADMIN_EMAIL
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && user && user.email === adminEmail) {
          console.log(`Admin user logged in via Google: ${user.email}`);
        }

        if (!user) {
          return done(new Error('User not found after authentication'), undefined);
        }

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user for session
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tenantMemberships: {
          include: {
            tenant: true,
          },
        },
      },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
