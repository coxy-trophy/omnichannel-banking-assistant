'use server';

import { db } from '@/db';
import { services, branches, bookings } from '@/db/schema';
import { getSession } from '@/app/actions';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

export async function getServices() {
  try {
    const allServices = await db.query.services.findMany();

    // If no services exist, seed some default ones
    if (allServices.length === 0) {
      const defaultServices = [
        { id: randomUUID(), name: 'Institutional Consultation', description: 'Meet with a banking advisor', estimatedTime: 30, channelType: 'branch' },
        { id: randomUUID(), name: 'Account Forensics', description: 'Review account history and statements', estimatedTime: 45, channelType: 'branch' },
        { id: randomUUID(), name: 'Wealth Management', description: 'Investment and portfolio review', estimatedTime: 60, channelType: 'branch' },
        { id: randomUUID(), name: 'Credit Facility Review', description: 'Loan and credit assessment', estimatedTime: 45, channelType: 'branch' },
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
  const checkinCode = `TB-${randomUUID().substring(0, 8).toUpperCase()}`;

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