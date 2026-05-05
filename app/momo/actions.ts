'use server';

import { db } from '@/db';
import { transactions } from '@/db/schema';
import { getSession } from '@/app/actions';
import { randomUUID } from 'crypto';

export async function processMomoDeposit(amount: number, phone: string) {
  const session = await getSession();
  if (!session.data?.user) {
    return { error: 'Not authenticated' };
  }
  const userId = session.data.user.id;

  if (amount <= 0 || amount > 1000) {
    return { error: 'Invalid amount. MoMo deposits must be between GH₵ 1 and GH₵ 1,000' };
  }

  try {
    // In a real system, this would integrate with a MoMo provider API
    // For demo purposes, we simulate a successful transaction
    const isSuccess = Math.random() > 0.1; // 90% success rate

    if (!isSuccess) {
      return { error: 'Payment provider unavailable. Please try again.' };
    }

    await db.insert(transactions).values({
      id: randomUUID(),
      userId,
      amount,
      currency: 'GHS',
      type: 'momo',
      status: 'success',
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('MoMo deposit error:', error);
    return { error: 'Transaction failed' };
  }
}