import { db } from '@/db';
import { transactions } from '@/db/schema';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { userId, amount } = await request.json();

    const isSuccess = Math.random() > 0.2;
    const status = isSuccess ? 'success' : 'failed';

    const [newTransaction] = await db.insert(transactions).values({
      id: randomUUID(),
      userId,
      amount,
      currency: 'GHS',
      type: 'momo',
      status,
      createdAt: new Date()
    }).returning();

    return NextResponse.json({ 
      success: isSuccess, 
      transaction: newTransaction,
      message: isSuccess ? 'Institutional transfer successful' : 'Institutional transfer failed'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ledger unavailable' }, { status: 500 });
  }
}
