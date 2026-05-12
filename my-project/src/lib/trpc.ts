/**
 * Mock tRPC Server Configuration
 * 
 * This module simulates a tRPC backend for authentication and user management.
 * In production, this would be replaced with actual tRPC router and procedures.
 */

import type { User, UserRole } from "@/types";

// Simulated database storage
interface DBUser extends User {
  passwordHash?: string;
}

const usersDB: Map<string, DBUser> = new Map();

// Initialize with some demo users
const initDemoUsers = () => {
  const demoUsers: DBUser[] = [
    {
      id: "user-1",
      name: "Minh Tran",
      email: "student@example.com",
      role: "student",
      status: "active",
      joinedDate: "2026-01-15",
    },
    {
      id: "user-2",
      name: "Dr. Nguyen Van A",
      email: "lecturer@example.com",
      role: "lecturer",
      status: "active",
      joinedDate: "2025-09-01",
    },
    {
      id: "user-3",
      name: "TechCorp HR",
      email: "company@example.com",
      role: "company",
      status: "active",
      joinedDate: "2025-06-20",
    },
    {
      id: "admin-1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      status: "active",
      joinedDate: "2025-01-01",
    },
  ];
  
  demoUsers.forEach(user => usersDB.set(user.email, user));
};

initDemoUsers();

// Context for procedures
export interface TRPCContext {
  user: User | null;
  sessionId: string | null;
}

// Simulated session storage
const sessions: Map<string, string> = new Map(); // sessionId -> userId

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hash password (simulated - use bcrypt in production)
 */
export function hashPassword(password: string): string {
  return `hashed_${password}_${Date.now()}`;
}

/**
 * Verify password (simulated)
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hash.startsWith("hashed_") && hash.includes(password);
}

// ============================================
// Auth Procedures
// ============================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface UpdateRoleInput {
  role: UserRole;
}

/**
 * Mock auth.login procedure
 * Returns user data with role or throws error
 */
export async function authLogin(input: LoginInput): Promise<{ user: User; sessionId: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { email, password } = input;
  
  // Find user by email
  const dbUser = usersDB.get(email);
  
  if (!dbUser) {
    throw new Error("Invalid email or password");
  }
  
  // Verify password
  if (dbUser.passwordHash && !verifyPassword(password, dbUser.passwordHash)) {
    throw new Error("Invalid email or password");
  }
  
  // Create session
  const sessionId = generateId();
  sessions.set(sessionId, dbUser.id);
  
  // Return user without sensitive data
  const { passwordHash, ...user } = dbUser;
  
  return { user, sessionId };
}

/**
 * Mock auth.me / profile.getCurrent procedure
 * Returns current user data including role
 */
export async function authMe(sessionId: string | null): Promise<User | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!sessionId) {
    return null;
  }
  
  const userId = sessions.get(sessionId);
  if (!userId) {
    return null;
  }
  
  // Find user by ID
  const dbUser = Array.from(usersDB.values()).find(u => u.id === userId);
  
  if (!dbUser) {
    return null;
  }
  
  // Return user without sensitive data
  const { passwordHash, ...user } = dbUser;
  
  return user;
}

/**
 * Mock auth.register procedure
 * Creates new user with pending role status
 */
export async function authRegister(input: RegisterInput): Promise<{ user: User; sessionId: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { email, password, name } = input;
  
  // Check if email already exists
  if (usersDB.has(email)) {
    throw new Error("Email already registered");
  }
  
  // Create new user with pending role status
  const newUser: DBUser = {
    id: generateId(),
    name,
    email,
    role: null, // User must select role on first login
    status: "pending_role", // Special status for users who haven't selected role
    joinedDate: new Date().toISOString().split("T")[0],
    passwordHash: hashPassword(password),
  };
  
  usersDB.set(email, newUser);
  
  // Create session
  const sessionId = generateId();
  sessions.set(sessionId, newUser.id);
  
  // Return user without sensitive data
  const { passwordHash, ...user } = newUser;
  
  return { user, sessionId };
}

/**
 * Mock profile.updateRole procedure
 * Updates user's role after initial selection
 */
export async function updateUserRole(
  sessionId: string | null,
  input: UpdateRoleInput
): Promise<User> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!sessionId) {
    throw new Error("Not authenticated");
  }
  
  const userId = sessions.get(sessionId);
  if (!userId) {
    throw new Error("Invalid session");
  }
  
  // Find user by ID
  const dbUser = Array.from(usersDB.values()).find(u => u.id === userId);
  
  if (!dbUser) {
    throw new Error("User not found");
  }
  
  // Validate role
  const validRoles: UserRole[] = ["student", "lecturer", "company", "admin"];
  if (!validRoles.includes(input.role)) {
    throw new Error("Invalid role");
  }
  
  // Check if role can be changed (some roles may require admin approval)
  if (dbUser.role !== null && dbUser.status !== "pending_role") {
    // User already has a role, may need special permission to change
    // For now, allow students to change to company if they want
    if (dbUser.role === "student" && input.role === "company") {
      throw new Error("Students cannot change to company role directly");
    }
  }
  
  // Update user
  dbUser.role = input.role;
  dbUser.status = "active";
  
  // Update in DB
  usersDB.set(dbUser.email, dbUser);
  
  // Return updated user without sensitive data
  const { passwordHash, ...user } = dbUser;
  
  return user;
}

/**
 * Mock auth.logout procedure
 */
export async function authLogout(sessionId: string | null): Promise<boolean> {
  if (sessionId) {
    sessions.delete(sessionId);
  }
  return true;
}

/**
 * Get all users (admin only in production)
 */
export async function getAllUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return Array.from(usersDB.values()).map(({ passwordHash, ...user }) => user);
}

/**
 * Check if user needs to select role
 */
export function needsRoleSelection(user: User | null): boolean {
  return user === null || user.role === null || user.status === "pending_role";
}
