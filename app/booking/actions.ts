'use server';

import { db } from '@/db';
import { services, branches, bookings } from '@/db/schema';
import { getSession } from '@/app/actions';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';

export async function getServices() {
  try {
    const allServices = await db.query.services.findMany();

    // If no services exist, seed some default ones
    if (allServices.length === 0) {
      const defaultServices = [
        { id: randomUUID(), name: 'Card Replacement', description: 'Replace lost or damaged ATM/debit card', estimatedTime: 30, channelType: 'branch' },
        { id: randomUUID(), name: 'Loan Consultation', description: 'Discuss loan options and requirements', estimatedTime: 45, channelType: 'branch' },
        { id: randomUUID(), name: 'Complaint Resolution', description: 'Resolve account or service issues', estimatedTime: 30, channelType: 'branch' },
        { id: randomUUID(), name: 'Other', description: 'General banking assistance', estimatedTime: 30, channelType: 'branch' },
      ];

      for (const service of defaultServices) {
        await db.insert(services).values(service);
      }

      return defaultServices;
    }

    return allServices;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function getBranches() {
  try {
    const allBranches = await db.query.branches.findMany();

    // If no branches exist, seed some default ones
    if (allBranches.length === 0) {
      const defaultBranches = [
        { id: randomUUID(), name: 'Accra Central Hub', location: 'Independence Ave, Accra', createdAt: new Date() },
        { id: randomUUID(), name: 'Kumasi Regional Center', location: 'Adum, Kumasi', createdAt: new Date() },
        { id: randomUUID(), name: 'Takoradi Port Branch', location: 'Harbor Rd, Takoradi', createdAt: new Date() },
        { id: randomUUID(), name: 'Tamale Main Branch', location: 'Commercial Rd, Tamale', createdAt: new Date() },
      ];

      for (const branch of defaultBranches) {
        await db.insert(branches).values(branch);
      }

      return defaultBranches;
    }

    return allBranches;
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

export async function createBooking(data: {
  serviceId: string;
  branchId: string;
  timeslot: Date;
}) {
  const session = await getSession();
  if (!session.data?.user) {
    return { error: 'Not authenticated' };
  }

  const userId = session.data.user.id;
  const checkinCode = `BL-${randomUUID().substring(0, 8).toUpperCase()}`;

  try {
    await db.insert(bookings).values({
      id: randomUUID(),
      userId,
      serviceId: data.serviceId,
      branchId: data.branchId,
      timeslot: data.timeslot,
      status: 'upcoming',
      checkinCode,
      createdAt: new Date(),
    });

    return { success: true, checkinCode };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { error: 'Failed to create booking' };
  }
}

export async function cancelBooking(bookingId: string) {
  const session = await getSession();
  if (!session.data?.user) {
    return { error: 'Not authenticated' };
  }

  const userId = session.data.user.id;

  try {
    // Verify the booking belongs to this user
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.userId, userId)
      ),
    });

    if (!booking) {
      return { error: 'Booking not found' };
    }

    if (booking.status !== 'upcoming') {
      return { error: 'Only upcoming bookings can be cancelled' };
    }

    await db.update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, bookingId));

    return { success: true };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { error: 'Failed to cancel booking' };
  }
}

export async function getBookingById(bookingId: string) {
  const session = await getSession();
  if (!session.data?.user) {
    return null;
  }

  const userId = session.data.user.id;

  try {
    const booking: any = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.userId, userId)
      ),
      with: {
        service: true,
        branch: true,
      } as any,
    });

    if (!booking) return null;

    return {
      ...booking,
      service: booking.service,
      branch: booking.branch,
    };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}