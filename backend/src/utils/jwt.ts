import jwt from 'jsonwebtoken';
import { redisClient } from '../config/redis';

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '7d'; // 7 days - automatically renewed with activity
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

export interface TokenPayload {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  isAdmin?: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh tokens for a user
 * @param payload - Token payload containing user information
 * @returns Object containing access and refresh tokens
 */
export async function generateTokens(payload: TokenPayload): Promise<TokenPair> {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId: payload.userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  // Store refresh token in Redis with 30-day expiration
  const refreshTokenKey = `refresh_token:${payload.userId}:${refreshToken}`;
  await redisClient.setEx(refreshTokenKey, 30 * 24 * 60 * 60, 'valid');

  return { accessToken, refreshToken };
}

/**
 * Verify an access token
 * @param token - JWT access token
 * @returns Decoded token payload
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify a refresh token
 * @param token - JWT refresh token
 * @returns Decoded token payload with userId
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string }> {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };

    // Check if refresh token exists in Redis
    const refreshTokenKey = `refresh_token:${decoded.userId}:${token}`;
    const exists = await redisClient.exists(refreshTokenKey);

    if (!exists) {
      throw new Error('Refresh token has been revoked');
    }

    return decoded;
  } catch (error) {
    if (error instanceof Error && error.message === 'Refresh token has been revoked') {
      throw error;
    }
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Revoke a refresh token
 * @param userId - User ID
 * @param token - Refresh token to revoke
 */
export async function revokeRefreshToken(userId: string, token: string): Promise<void> {
  const refreshTokenKey = `refresh_token:${userId}:${token}`;
  await redisClient.del(refreshTokenKey);
}

/**
 * Revoke all refresh tokens for a user
 * @param userId - User ID
 */
export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  const pattern = `refresh_token:${userId}:*`;
  const keys = await redisClient.keys(pattern);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

/**
 * Generate email verification token
 * @param userId - User ID
 * @param email - User email
 * @returns Verification token
 */
export function generateEmailVerificationToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, type: 'email_verification' }, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verify email verification token
 * @param token - Verification token
 * @returns Decoded token payload
 */
export function verifyEmailVerificationToken(token: string): { userId: string; email: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      type: string;
    };

    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }

    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    throw new Error('Invalid or expired verification token');
  }
}
