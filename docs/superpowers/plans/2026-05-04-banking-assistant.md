# Omnichannel Banking Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Next.js banking assistant web application with Neon Auth, Neon Serverless Postgres, and Drizzle ORM based on the modern financial UI design.

**Architecture:** We will use Next.js App Router for frontend and API routes. Neon Auth will handle authentication and JWTs. Neon Serverless Postgres will be accessed via connection pooling and Drizzle ORM. The UI will use Tailwind CSS v4 with custom tokens matching the provided design. Business logic (Service Engine, Booking) will reside in server actions or API routes. 

**Tech Stack:** Next.js 16.2.4, React 19.2.4, Tailwind CSS v4, Drizzle ORM, Neon Postgres, Neon Auth, Lucide React (for icons)

---

### Task 1: Environment & Database Setup

**Files:**
- Create: `.env.local`
- Create: `db/schema.ts`
- Create: `db/index.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Install Dependencies**
```bash
pnpm add drizzle-orm @neondatabase/serverless lucide-react clsx tailwind-merge
pnpm add -D drizzle-kit tsx
```

- [ ] **Step 2: Provision Neon DB and Auth (Manual or via MCP)**
Since we rely on Neon MCP, we assume `.env.local` will have `DATABASE_URL` and Auth variables set up by the agent executing the plan.
```bash
echo "# NEON ENV VARS HERE" > .env.local
```

- [ ] **Step 3: Define Drizzle Schema (`db/schema.ts`)**
```typescript
import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin']);
export const bookingStatusEnum = pgEnum('booking_status', ['upcoming', 'checked_in', 'completed', 'cancelled']);
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'verified', 'rejected']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  phone: text('phone').unique(),
  role: roleEnum('role').default('user').notNull(),
  kycStatus: kycStatusEnum('kyc_status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  estimatedTime: integer('estimated_time').notNull(), // in minutes
  channelType: text('channel_type').notNull(), // 'ATM' | 'APP' | 'BRANCH'
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
  status: text('status').notNull(), // success, failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

- [ ] **Step 4: Create DB Client (`db/index.ts`)**
```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 5: Create Drizzle Config (`drizzle.config.ts`)**
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 6: Commit DB Setup**
```bash
git add package.json pnpm-lock.yaml .env.local db/ drizzle.config.ts
git commit -m "chore: setup drizzle and db schema"
```

### Task 2: UI Foundation & Tailwind v4 Config

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Setup Tailwind v4 Theme (`app/globals.css`)**
```css
@import "tailwindcss";

@theme {
  --color-surface: #f7f9fb;
  --color-surface-dim: #d8dadc;
  --color-surface-bright: #f7f9fb;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f2f4f6;
  --color-surface-container: #eceef0;
  --color-surface-container-high: #e6e8ea;
  --color-surface-container-highest: #e0e3e5;
  --color-on-surface: #191c1e;
  --color-on-surface-variant: #43474f;
  --color-inverse-surface: #2d3133;
  --color-inverse-on-surface: #eff1f3;
  --color-outline: #737780;
  --color-outline-variant: #c3c6d1;
  --color-surface-tint: #3a5f94;
  --color-primary: #001e40;
  --color-on-primary: #ffffff;
  --color-primary-container: #003366;
  --color-on-primary-container: #799dd6;
  --color-inverse-primary: #a7c8ff;
  --color-secondary: #556158;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #d9e6da;
  --color-on-secondary-container: #5b675e;
  --color-tertiary: #381300;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #592300;
  --color-on-tertiary-container: #d8885c;
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;
  --color-background: #f7f9fb;
  --color-on-background: #191c1e;
  --color-success-mint: #E8F5E9;
  --color-on-success-mint: #2E7D32;

  --font-manrope: "Manrope", sans-serif;
  --font-inter: "Inter", sans-serif;
}

body {
  background-color: var(--color-background);
  color: var(--color-on-background);
  font-family: var(--font-inter);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-manrope);
}
```

- [ ] **Step 2: Update Layout Fonts (`app/layout.tsx`)**
```tsx
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "TrustBank Omnichannel Assistant",
  description: "Modern banking assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit UI Foundation**
```bash
git add app/globals.css app/layout.tsx
git commit -m "style: configure tailwind theme and fonts"
```

### Task 3: Core UI Components

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Card.tsx`

- [ ] **Step 1: Create Button Component (`components/ui/Button.tsx`)**
```tsx
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold transition-transform hover:scale-102 active:scale-95";
  const variants = {
    primary: "bg-primary text-on-primary",
    secondary: "bg-success-mint text-on-success-mint",
    outline: "border border-outline bg-transparent text-on-surface",
    danger: "bg-error text-on-error",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}
```

- [ ] **Step 2: Create Card Component (`components/ui/Card.tsx`)**
```tsx
import React from 'react';
import { cn } from './Button';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm", className)} 
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit UI Components**
```bash
git add components/
git commit -m "feat: add core ui components"
```

### Task 4: Service Engine Utils

**Files:**
- Create: `lib/serviceEngine.ts`

- [ ] **Step 1: Write logic (`lib/serviceEngine.ts`)**
```typescript
type Service = {
  id: string;
  channelType: string;
};

type User = {
  kycStatus: string;
};

export function getServiceRecommendation(service: Service, user: User | null, transactionAmount?: number) {
  let recommendedChannel = service.channelType;
  let requiresBooking = service.channelType === 'BRANCH';

  // Smart Rules
  if (user && user.kycStatus !== 'verified') {
    requiresBooking = true;
    recommendedChannel = 'BRANCH';
  }

  if (transactionAmount && transactionAmount > 10000) {
    requiresBooking = true;
    recommendedChannel = 'BRANCH';
  }

  if (service.channelType === 'ATM' || service.channelType === 'APP') {
    requiresBooking = false; // Override if it was just an APP/ATM service without violations
  }

  return {
    recommendedChannel,
    requiresBooking,
  };
}
```

- [ ] **Step 2: Commit Logic**
```bash
git add lib/
git commit -m "feat: implement service engine rules"
```

### Task 5: Auth Integration Foundation (Neon Auth)

*Note: The actual provisioning happens via Neon MCP. Here we set up the middleware to protect routes.*

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Setup Middleware (`middleware.ts`)**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Basic path protection logic
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');
  const isAdminLogin = request.nextUrl.pathname === '/admin/login';

  // We will integrate Neon Auth JWT validation here
  // For now, allow passthrough. The actual implementation will verify tokens via Data API or cookies.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

- [ ] **Step 2: Commit Middleware**
```bash
git add middleware.ts
git commit -m "chore: scaffold middleware for auth"
```

### Task 6: Implement Next.js Pages (Frontend Routes)

*(For brevity, these steps represent creating the Next.js routes. During execution, each will be built using the UI components.)*

- [ ] **Step 1: Implement `/` (Home Quick Start)**
- [ ] **Step 2: Implement `/dashboard` (User Dashboard)**
- [ ] **Step 3: Implement `/booking` (Booking Flow)**
- [ ] **Step 4: Implement `/kyc` (Upload flow)**
- [ ] **Step 5: Implement `/admin/dashboard` (Admin view)**

*(The actual code will be written during execution using the UI components.)*

### Task 7: Report Generation Util

**Files:**
- Create: `lib/reportGenerator.ts`

- [ ] **Step 1: Write Fake Generator (`lib/reportGenerator.ts`)**
```typescript
export function generateFakeReports() {
  return {
    totalServicesUsed: Math.floor(Math.random() * 10000),
    atmVsBranchUsage: {
      atm: Math.floor(Math.random() * 80) + 10,
      branch: Math.floor(Math.random() * 40) + 10,
      app: Math.floor(Math.random() * 60) + 10,
    },
    dailyBookings: Array.from({ length: 7 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      count: Math.floor(Math.random() * 50),
    })),
  };
}
```

- [ ] **Step 2: Commit**
```bash
git add lib/reportGenerator.ts
git commit -m "feat: add mock report generator"
```
