import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment or use defaults for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cxfrvfnjdsmhymusiaag.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZnJ2Zm5qZHNtaHltdXNpYWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0NzY4MDAsImV4cCI6MjAzMjA1MjgwMH0.DlLKvF5G5O4K5Q5QK5Q5QK5Q5QK5Q5QK5Q5QK5Q5QK5Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AdminSetting {
  id: number;
  key: string;
  value: string;
  updated_at: string;
}

// User operations
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[supabase] Error fetching users:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[supabase] Users fetch error:', err);
    return [];
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('[supabase] Error fetching user:', error);
    }

    return data || null;
  } catch (err) {
    console.error('[supabase] User fetch error:', err);
    return null;
  }
}

export async function createUser(user: Omit<User, 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .insert([{ ...user, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Admin settings operations
export async function getSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[supabase] Error fetching setting:', error);
    }

    return data?.value || null;
  } catch (err) {
    console.error('[supabase] Setting fetch error:', err);
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Try to update first
    const { error: updateError } = await supabase
      .from('admin_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (updateError && updateError.code === 'PGRST116') {
      // If not found, insert
      const { error: insertError } = await supabase
        .from('admin_settings')
        .insert([{ key, value, updated_at: new Date().toISOString() }]);

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    } else if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
