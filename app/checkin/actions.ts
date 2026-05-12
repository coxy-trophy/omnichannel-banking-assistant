'use server';

import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function checkIn(checkinCode: string) {
  if (!checkinCode) {
    return { error: 'Check-in code is required' };
  }

  try {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.checkinCode, checkinCode),
      with: {
        service: true,
        branch: true,
      } as any,
    });

    if (!booking) {
      return { error: 'Invalid check-in code' };
    }

    if (booking.status === 'checked_in') {
      return { error: 'Already checked in' };
    }

    if (booking.status === 'completed') {
      return { error: 'This appointment has already been completed' };
    }

    if (booking.status === 'cancelled') {
      return { error: 'This appointment has been cancelled' };
    }

    // Check if appointment time is valid (within 15 min before or after)
    const now = new Date();
    const appointmentTime = new Date(booking.timeslot);
    const timeDiff = Math.abs(now.getTime() - appointmentTime.getTime());
    const maxEarlyTime = 15 * 60 * 1000; // 15 minutes

    // Allow check-in up to 15 minutes early or 30 minutes late
    if (timeDiff > 30 * 60 * 1000 && now < appointmentTime) {
      return { error: 'Too early to check in. You can check in 15 minutes before your appointment.' };
    }

    await db.update(bookings)
      .set({ status: 'checked_in' })
      .where(eq(bookings.id, booking.id));

    return {
      success: true,
      booking: {
        ...booking,
        status: 'checked_in',
      },
    };
  } catch (error) {
    console.error('Check-in error:', error);
    return { error: 'Check-in failed. Please try again.' };
  }
}
