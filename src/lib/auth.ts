import bcrypt from 'bcryptjs';
import { sql } from './db';
import type { UserRow } from './db';

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string | null;
  email: string | null;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get user by username
export async function getUserByUsername(
  username: string
): Promise<UserRow | null> {
  const users = await sql<UserRow[]>`
    SELECT * FROM users WHERE username = ${username} LIMIT 1
  `;
  return users[0] || null;
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const users = await sql<UserRow[]>`
    SELECT id, username, role, name, email FROM users WHERE id = ${id} LIMIT 1
  `;

  if (users.length === 0) return null;

  const user = users[0];
  return {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    name: user.name,
    email: user.email,
  };
}

// Authenticate user
export async function authenticateUser(
  username: string,
  password: string
): Promise<User | null> {
  const userRow = await getUserByUsername(username);

  if (!userRow) {
    return null;
  }

  const isValid = await verifyPassword(password, userRow.password_hash);

  if (!isValid) {
    return null;
  }

  return {
    id: userRow.id,
    username: userRow.username,
    role: userRow.role as UserRole,
    name: userRow.name,
    email: userRow.email,
  };
}

// Create user (admin only)
export async function createUser(
  username: string,
  password: string,
  role: UserRole,
  name?: string,
  email?: string
): Promise<User> {
  const passwordHash = await hashPassword(password);

  const users = await sql<UserRow[]>`
    INSERT INTO users (username, password_hash, role, name, email)
    VALUES (${username}, ${passwordHash}, ${role}, ${name || null}, ${email || null})
    RETURNING id, username, role, name, email
  `;

  const user = users[0];
  return {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    name: user.name,
    email: user.email,
  };
}

// Check if user has permission
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    manager: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Can edit (admin or manager)
export function canEdit(userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'manager';
}
