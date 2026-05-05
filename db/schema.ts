import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['user', 'admin']);
export const bookingStatusEnum = pgEnum('booking_status', ['upcoming', 'checked_in', 'completed', 'cancelled']);
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'verified', 'rejected']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdraw', 'momo']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  phone: text('phone').unique(),
  role: roleEnum('role').default('user').notNull(),
  kycStatus: kycStatusEnum('kyc_status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  kycDocuments: many(kycDocuments),
  complaints: many(complaints),
  transactions: many(transactions),
}));

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  estimatedTime: integer('estimated_time').notNull(),
  channelType: text('channel_type').notNull(),
});

export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  branchId: uuid('branch_id').references(() => branches.id).notNull(),
  timeslot: timestamp('timeslot').notNull(),
  status: bookingStatusEnum('status').default('upcoming').notNull(),
  checkinCode: text('checkin_code').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  branch: one(branches, { fields: [bookings.branchId], references: [branches.id] }),
}));

export const kycDocuments = pgTable('kyc_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  fileUrl: text('file_url').notNull(),
  status: kycStatusEnum('status').default('pending').notNull(),
});

export const complaints = pgTable('complaints', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  category: text('category').notNull(),
  message: text('message').notNull(),
  status: text('status').default('open').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  user: one(users, { fields: [complaints.userId], references: [users.id] }),
  messages: many(messages),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  complaintId: uuid('complaint_id').references(() => complaints.id).notNull(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('GHS').notNull(),
  type: transactionTypeEnum('type').default('momo').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
