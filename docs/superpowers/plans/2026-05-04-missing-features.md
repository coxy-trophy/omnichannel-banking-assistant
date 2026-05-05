# Omnichannel Banking Assistant - Final Polish & Missing Features Plan

**Goal:** Complete the banking assistant by implementing actual Neon Auth integration, real-time role/status updates, financial operations (Deposit/Withdraw) in GH₵, and admin security.

---

### Task 8: Authentication Integration (Neon Auth)

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/register/page.tsx`
- Modify: `middleware.ts`
- Create: `lib/auth.ts`

- [ ] **Step 1: Create Auth UI** (Login & Register pages using the previously defined UI components).
- [ ] **Step 2: Implement Auth logic** in `lib/auth.ts` to handle Neon Auth session/token.
- [ ] **Step 3: Update Middleware** to verify JWT and restrict `/dashboard` to users and `/admin` to admins (checked via Master Admin Password or Role).

---

### Task 9: Financial Operations (Deposit & Withdraw)

**Files:**
- Create: `app/deposit/page.tsx`
- Create: `app/withdraw/page.tsx`
- Modify: `app/api/payments/momo/route.ts`

- [ ] **Step 1: Build Deposit/Withdraw UI** (Simple forms, GH₵ currency).
- [ ] **Step 2: Implement Transaction Logic** (Update `transactions` table with `type` column: 'deposit' | 'withdraw' | 'momo').
- [ ] **Step 3: Update Mock Logic** for Ghana Cedis and random status.

---

### Task 10: Real-time & Role Polish

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `app/complaints/page.tsx`

- [ ] **Step 1: Implement Polling** for messages in the complaints view.
- [ ] **Step 2: Sync UI with Auth Role**.

---

### Task 11: Admin Security (Master Password)

**Files:**
- Modify: `.env.local`
- Modify: `middleware.ts`

- [ ] **Step 1: Add `ADMIN_MASTER_PASSWORD` to `.env.local`.**
- [ ] **Step 2: Restrict `/admin/*`** to requires this password (simple cookie or header check for now).
