'use server';

import { db } from '@/db';
import { users, transactions, sessions } from '@/db/schema';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, and, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function createSession(userId: string): Promise<string> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

export async function registerUser(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const name = formData.get('name') as string;
  const phone = (formData.get('phone') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !name || !phone || !password) {
    return { error: 'All fields are required' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  try {
    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: 'Email already registered' };
    }

    // Check if phone already exists
    const existingPhone = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    if (existingPhone) {
      return { error: 'Phone number already registered' };
    }

    const userId = randomUUID();
    const passwordHash = await hashPassword(password);

    // Create user
    await db.insert(users).values({
      id: userId,
      email,
      name,
      phone,
      passwordHash,
      role: 'user',
      kycStatus: 'pending',
      createdAt: new Date(),
    });

    // Seed initial balance (GH₵ 1000)
    await db.insert(transactions).values({
      id: randomUUID(),
      userId,
      amount: 1000,
      currency: 'GHS',
      type: 'deposit',
      status: 'success',
      createdAt: new Date(),
    });

    // Create session
    const sessionId = await createSession(userId);

    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: 'Failed to create account. Please try again.' };
  }

  redirect('/dashboard');
}

export async function loginUser(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return { error: 'Invalid email or password' };
    }

    // Create session
    const sessionId = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Failed to sign in' };
  }

  redirect('/dashboard');
}

export async function signOut() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (sessionId) {
    try {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    } catch (e) {
      // Ignore errors
    }
  }

  cookieStore.delete('session_id');
  redirect('/login');
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    return { data: null };
  }

  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return { data: null };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return { data: null };
    }

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    };
  } catch (error) {
    return { data: null };
  }
}

export async function submitKYC(formData: FormData) {
  const session = await getSession();
  if (!session.data?.user) return { error: 'Not authenticated' };
  const userId = session.data.user.id;

  try {
    await db.update(users)
      .set({ kycStatus: 'pending' })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to submit KYC' };
  }
}

export async function loginAdmin(formData: FormData) {
  const password = formData.get('password') as string;
  const masterPassword = process.env.ADMIN_MASTER_PASSWORD;

  if (password === masterPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return { success: true };
  }

  return { error: 'Invalid institutional key' };
}

export async function processTransaction(type: 'deposit' | 'withdraw', amount: number) {
  const session = await getSession();
  if (!session.data?.user) return { error: 'Not authenticated' };
  const userId = session.data.user.id;

  if (amount <= 0) {
    return { error: 'Amount must be positive' };
  }

  try {
    // Check balance for withdrawals
    if (type === 'withdraw') {
      const result = await db.select({
        balance: sql<number>`COALESCE(SUM(CASE WHEN type IN ('deposit', 'momo') THEN amount ELSE -amount END), 0)`
      }).from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.status, 'success')));

      const balance = Number(result[0]?.balance || 0);
      if (balance < amount) {
        return { error: 'Insufficient funds' };
      }
    }

    // Create transaction
    await db.insert(transactions).values({
      id: randomUUID(),
      userId,
      amount: type === 'deposit' ? amount : amount,
      currency: 'GHS',
      type: type === 'deposit' ? 'deposit' : 'withdraw',
      status: 'success',
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Transaction error:', error);
    return { error: 'Transaction failed' };
  }
}

export async function getUserBalance(userId: string): Promise<number> {
  try {
    const result = await db.select({
      balance: sql<number>`COALESCE(SUM(CASE WHEN type IN ('deposit', 'momo') THEN amount ELSE -amount END), 0)`
    }).from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.status, 'success')));

    return Number(result[0]?.balance || 0);
  } catch (error) {
    console.error('Balance error:', error);
    return 0;
  }
}