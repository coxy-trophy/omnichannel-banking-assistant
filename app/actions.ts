'use server';

import { db } from '@/db';
import { users, transactions } from '@/db/schema';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export async function registerUser(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const phone = (formData.get('phone') as string)?.trim();
  const password = formData.get('password') as string;
  
  if (!email || !phone || !password) {
    return { error: 'All fields are required' };
  }

  try {
    const [newUser] = await db.insert(users).values({
      email,
      phone,
      role: 'user',
      kycStatus: 'pending'
    }).returning();

    // Seed initial balance (GH₵ 1000)
    await db.insert(transactions).values({
      userId: newUser.id,
      amount: 1000,
      currency: 'GHS',
      type: 'deposit',
      status: 'success'
    });

    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'mock_token_' + newUser.id, { path: '/' });
    cookieStore.set('user_id', newUser.id, { path: '/' });

  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.message?.includes('users_email_unique')) {
      return { error: 'Email already registered' };
    }
    if (error.message?.includes('users_phone_unique')) {
      return { error: 'Phone number already registered' };
    }
    return { error: 'Institutional connection failed. Please try again.' };
  }

  redirect('/dashboard');
}

export async function loginUser(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  
  if (!email) {
    return { error: 'Email is required' };
  }
  
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      return { error: 'User not found' };
    }

    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'mock_token_' + user.id, { path: '/' });
    cookieStore.set('user_id', user.id, { path: '/' });
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Connection failed' };
  }

  redirect('/dashboard');
}

export async function submitKYC(formData: FormData) {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) return { error: 'Not authenticated' };

  try {
    await db.update(users)
      .set({ kycStatus: 'pending' })
      .where(eq(users.id, userId));
    
    return { success: true };
  } catch (error) {
    return { error: 'Failed to submit KYC' };
  }
}
