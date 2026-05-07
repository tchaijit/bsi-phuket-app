import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { User } from './auth';

export interface SessionData {
  user?: User;
  isAuthenticated: boolean;
}

// Session configuration
export const sessionOptions = {
  password: process.env.AUTH_SECRET!,
  cookieName: 'bsi-phuket-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

// Get session
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session.user || null;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isAuthenticated === true && !!session.user;
}

// Require authentication (throw error if not authenticated)
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Require specific role
export async function requireRole(
  role: 'admin' | 'manager' | 'viewer'
): Promise<User> {
  const user = await requireAuth();

  const roleHierarchy = {
    viewer: 1,
    manager: 2,
    admin: 3,
  };

  if (roleHierarchy[user.role] < roleHierarchy[role]) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}
