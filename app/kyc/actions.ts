'use server';

import { db } from '@/db';
import { users, complaints, kycDocuments } from '@/db/schema';
import { getSession } from '@/app/actions';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function getKycStatus() {
  const session = await getSession();
  if (!session.data?.user) {
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.data.user.id),
    });

    // Fetch user's KYC documents
    const userDocs = await db.query.kycDocuments.findMany({
      where: eq(kycDocuments.userId, session.data.user.id),
    });

    return { user, documents: userDocs };
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return null;
  }
}

export async function submitKyc(formData: FormData) {
  const session = await getSession();
  if (!session.data?.user) {
    return { error: 'Not authenticated' };
  }

  const userId = session.data.user.id;
  const file = formData.get('document') as File;
  const documentType = formData.get('documentType') as string;

  if (!file || file.size === 0) {
    return { error: 'Please select a document to upload' };
  }

  if (!documentType) {
    return { error: 'Please select a document type' };
  }

  // Validate file type (images only for ID and profile photo)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Only JPG or PNG images are allowed' };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: 'File size must be less than 5MB' };
  }

  try {
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'kyc');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
    const filename = `${randomUUID()}.${fileExtension}`;
    const filePath = join(uploadDir, filename);
    const fileUrl = `/uploads/kyc/${filename}`;

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create KYC document record
    await db.insert(kycDocuments).values({
      id: randomUUID(),
      userId,
      fileUrl,
      documentType,
      status: 'pending',
      uploadedAt: new Date(),
    });

    // Update user KYC status
    await db.update(users)
      .set({ kycStatus: 'pending' })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error('Error submitting KYC:', error);
    return { error: 'Failed to upload document' };
  }
}

export async function contactSupport(message: string) {
  const session = await getSession();
  if (!session.data?.user) {
    return { error: 'Not authenticated' };
  }

  try {
    await db.insert(complaints).values({
      id: randomUUID(),
      userId: session.data.user.id,
      category: 'KYC Verification',
      message,
      status: 'open',
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error contacting support:', error);
    return { error: 'Failed to send message' };
  }
}