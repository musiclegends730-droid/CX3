import { v4 as uuidv4 } from 'uuid';
import * as supabaseLib from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
  securityQuestion?: string;
  securityAnswer?: string;
  preferredTheme?: string;
}

interface Session {
  userId: string;
  token: string;
  expiresAt: string;
}

const SESSION_KEY = 'cx3_session';

// Initialize the database with admin user if needed
export async function initAuth() {
  try {
    const users = await supabaseLib.getAllUsers();
    
    // Check if admin exists
    const adminExists = users.some(u => u.email === 'admin@cx3.app');
    
    if (!adminExists) {
      // Create admin user
      await supabaseLib.createUser({
        id: 'admin-001',
        email: 'admin@cx3.app',
        name: 'Administrator',
        password: 'CX3Admin2024!',
        role: 'admin'
      });
    }
  } catch (err) {
    console.error('[auth] Init error:', err);
  }
}

// Get all users from database
export async function getAllUsers(): Promise<User[]> {
  try {
    const users = await supabaseLib.getAllUsers();
    return users.map(u => ({
      ...u,
      createdAt: u.created_at
    }));
  } catch (err) {
    console.error('[auth] getAllUsers error:', err);
    return [];
  }
}

interface SignupResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Sign up a new user
export async function signup(email: string, name: string, password: string): Promise<SignupResult> {
  try {
    // Check if user already exists
    const existing = await supabaseLib.getUserByEmail(email);
    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    const userId = uuidv4();
    const result = await supabaseLib.createUser({
      id: userId,
      email,
      name,
      password,
      role: 'user'
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const user: User = {
      id: userId,
      email,
      name,
      password,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    return { success: true, user };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Login user
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const user = await supabaseLib.getUserByEmail(email);

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    const token = uuidv4();
    const session: Session = {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    const userData: User = {
      ...user,
      createdAt: user.created_at
    };

    return { success: true, user: userData };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Get current session
export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as Session;

    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Logout user
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = getSession();
    if (!session) return null;

    const users = await supabaseLib.getAllUsers();
    const user = users.find(u => u.id === session.userId);

    if (!user) {
      logout();
      return null;
    }

    return {
      ...user,
      createdAt: user.created_at
    };
  } catch (err) {
    console.error('[auth] getCurrentUser error:', err);
    return null;
  }
}

// User password reset (with security question verification)
export async function resetPassword(email: string, answer: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // For now, just allow password reset without security question verification
    // In production, you would verify the answer against stored answer
    return { success: false, error: 'Password reset not yet implemented' };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Admin functions
export async function adminResetPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // This would need a separate update endpoint
    // For now, we'll just return a placeholder
    return { success: false, error: 'Password reset not yet implemented' };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function adminDeleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await supabaseLib.deleteUser(userId);
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Global theme functions
export async function getGlobalTheme(): Promise<string> {
  try {
    const theme = await supabaseLib.getSetting('global_theme');
    return theme || 'dark';
  } catch (err) {
    console.error('[auth] getGlobalTheme error:', err);
    return 'dark';
  }
}

export async function setGlobalTheme(theme: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await supabaseLib.setSetting('global_theme', theme);
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
