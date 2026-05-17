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

const USERS_KEY = 'cx3_users';
const SESSION_KEY = 'cx3_session';
const GLOBAL_THEME_KEY = 'cx3_global_theme';

const ADMIN_USER: User = {
  id: 'admin-001',
  email: 'admin@cx3.app',
  name: 'Administrator',
  password: 'CX3Admin2024!',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const DEMO_USERS: User[] = [
  {
    id: 'user-demo-001',
    email: 'john@pilot.com',
    name: 'John Pilot',
    password: 'demo123',
    role: 'user',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-demo-002',
    email: 'sarah@flight.com',
    name: 'Sarah Aviator',
    password: 'demo123',
    role: 'user',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-demo-003',
    email: 'mike@aircraft.com',
    name: 'Mike Navigator',
    password: 'demo123',
    role: 'user',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function initAuth() {
  const users = getUsers();
  let updated = false;
  
  // Add admin user if not present
  if (!users.find((u) => u.id === ADMIN_USER.id)) {
    users.unshift(ADMIN_USER);
    updated = true;
  }
  
  // Add demo users if not present (for testing/demo purposes)
  for (const demoUser of DEMO_USERS) {
    if (!users.find((u) => u.id === demoUser.id)) {
      users.push(demoUser);
      updated = true;
    }
  }
  
  if (updated) {
    saveUsers(users);
  }
}

export function getAllUsers(): User[] {
  initAuth();
  return getUsers();
}

export function login(email: string, password: string): { success: boolean; user?: User; error?: string } {
  initAuth();
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { success: false, error: 'Invalid email or password.' };

  const session: Session = {
    userId: user.id,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user };
}

export function signup(
  email: string,
  name: string,
  password: string,
  securityQuestion?: string,
  securityAnswer?: string
): { success: boolean; user?: User; error?: string } {
  initAuth();
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const user: User = {
    id: 'user-' + Date.now(),
    email: email.trim(),
    name: name.trim(),
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
    securityQuestion,
    securityAnswer: securityAnswer?.toLowerCase().trim(),
  };
  users.push(user);
  saveUsers(users);

  const session: Session = {
    userId: user.id,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  initAuth();
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return getUsers().find((u) => u.id === session.userId) ?? null;
  } catch {
    return null;
  }
}

export function resetPassword(
  email: string,
  securityAnswer: string,
  newPassword: string
): { success: boolean; error?: string } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return { success: false, error: 'Email not found.' };
  const user = users[idx];
  if (!user.securityAnswer || !user.securityQuestion) {
    return { success: false, error: 'No security question set for this account. Contact admin.' };
  }
  if (user.securityAnswer !== securityAnswer.toLowerCase().trim()) {
    return { success: false, error: 'Incorrect answer to security question.' };
  }
  users[idx] = { ...user, password: newPassword };
  saveUsers(users);
  return { success: true };
}

export function adminResetPassword(userId: string, newPassword: string): { success: boolean; error?: string } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, error: 'User not found.' };
  users[idx] = { ...users[idx], password: newPassword };
  saveUsers(users);
  return { success: true };
}

export function adminDeleteUser(userId: string): { success: boolean; error?: string } {
  if (userId === 'admin-001') return { success: false, error: 'Cannot delete the admin account.' };
  const users = getUsers().filter((u) => u.id !== userId);
  saveUsers(users);
  return { success: true };
}

export function updateUserTheme(userId: string, themeId: string) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    users[idx] = { ...users[idx], preferredTheme: themeId };
    saveUsers(users);
  }
}

export function getGlobalTheme(): string | null {
  return localStorage.getItem(GLOBAL_THEME_KEY);
}

export function setGlobalTheme(themeId: string) {
  localStorage.setItem(GLOBAL_THEME_KEY, themeId);
}
