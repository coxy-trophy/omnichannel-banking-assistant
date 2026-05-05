import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  phone: text('phone').unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('user').notNull(),
  kycStatus: text('kyc_status').default('pending').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  kycDocuments: many(kycDocuments),
  complaints: many(complaints),
  transactions: many(transactions),
}));

export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  estimatedTime: integer('estimated_time').notNull(),
  channelType: text('channel_type').notNull(),
});

export const branches = sqliteTable('branches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  serviceId: text('service_id').references(() => services.id).notNull(),
  branchId: text('branch_id').references(() => branches.id).notNull(),
  timeslot: integer('timeslot', { mode: 'timestamp' }).notNull(),
  status: text('status').default('upcoming').notNull(),
  checkinCode: text('checkin_code').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  branch: one(branches, { fields: [bookings.branchId], references: [branches.id] }),
}));

export const kycDocuments = sqliteTable('kyc_documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  fileUrl: text('file_url').notNull(),
  status: text('status').default('pending').notNull(),
});

export const complaints = sqliteTable('complaints', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  category: text('category').notNull(),
  message: text('message').notNull(),
  status: text('status').default('open').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  user: one(users, { fields: [complaints.userId], references: [users.id] }),
  messages: many(messages),
}));

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  complaintId: text('complaint_id').references(() => complaints.id).notNull(),
  senderId: text('sender_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('GHS').notNull(),
  type: text('type').default('momo').notNull(),
  status: text('status').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});