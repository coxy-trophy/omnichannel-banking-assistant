import React from 'react';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowUpRight, ArrowDownLeft, Clock, Plus, Minus, Smartphone } from 'lucide-react';
import { getUserBalance } from '@/lib/adminActions';
import { db } from '@/db';
import { transactions, bookings, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession, signOut } from '@/app/actions';
import { redirect } from 'next/navigation';
import { SignOutButton } from './SignOutButton';

// Daily limits based on role
const DAILY_LIMITS: Record<string, number> = {
  user: 5000,
  admin: 100000,
};

export default async function UserDashboard() {
  const session = await getSession();

  if (!session.data?.user) {
    redirect('/login');
  }

  const userId = session.data.user.id;

  // Fetch user data for real-time values
  const userData = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!userData) {
    redirect('/login');
  }

  const balance = await getUserBalance(userId);
  const dailyLimit = DAILY_LIMITS[userData.role] || DAILY_LIMITS.user;
  const tierName = userData.role === 'admin' ? 'Premium Tier' : 'Standard Tier';

  // KYC status styling
  const kycStatusConfig: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-tertiary-fixed/30', text: 'text-on-tertiary-fixed-variant' },
    verified: { bg: 'bg-on-success-mint/30', text: 'text-on-success-mint' },
    rejected: { bg: 'bg-error/30', text: 'text-error' },
  };
  const kycStyle = kycStatusConfig[userData.kycStatus] || kycStatusConfig.pending;

  const rawTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: [desc(transactions.createdAt)],
    limit: 5,
  });

  const rawBookings = await db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
    with: {
      service: true,
      branch: true,
    } as any,
    orderBy: [desc(bookings.createdAt)],
    limit: 1,
  });

  // Serialize data to plain objects for client components
  const userTransactions = (rawTransactions as any[]).map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    status: tx.status,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
  }));

  const activeBookings = (rawBookings as any[]).map(bk => ({
    id: bk.id,
    service: bk.service ? { name: bk.service.name } : null,
    branch: bk.branch ? { name: bk.branch.name } : null,
    timeslot: bk.timeslot instanceof Date ? bk.timeslot.toISOString() : bk.timeslot,
    checkinCode: bk.checkinCode,
  }));

  return (
    <div className="min-h-screen bg-background text-on-background font-inter">
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-manrope text-2xl font-bold text-primary flex items-center gap-2">
          <span className="bg-primary text-on-primary w-8 h-8 rounded-lg flex items-center justify-center text-xs">BL</span>
          Bank Ledger
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold bg-primary/5 text-primary px-3 py-1 rounded-full hidden sm:block">{tierName}</span>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-primary text-on-primary overflow-hidden relative border-none shadow-xl">
            <div className="relative z-10">
              <p className="text-on-primary-container font-bold uppercase tracking-widest text-[10px] mb-2">Total Balance</p>
              <h2 className="text-5xl font-manrope font-bold mb-8">GH₵ {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
              <div className="flex gap-4">
                <Link href="/deposit">
                  <Button variant="secondary" className="gap-2 px-6">
                    <Plus className="w-4 h-4" /> Deposit
                  </Button>
                </Link>
                <Link href="/momo">
                  <Button variant="secondary" className="gap-2 px-6 bg-white/20 hover:bg-white/30 border-white/30">
                    <Smartphone className="w-4 h-4" /> MoMo
                  </Button>
                </Link>
                <Link href="/withdraw">
                  <Button variant="outline" className="gap-2 border-white/20 hover:bg-white/10 text-white px-6">
                    <Minus className="w-4 h-4" /> Withdraw
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/10 to-transparent"></div>
          </Card>

          <Card className="flex flex-col justify-between border-outline-variant/30">
            <div>
              <h3 className="font-manrope font-bold text-lg mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Daily Limit</span>
                  <span className="font-bold">GH₵ {dailyLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">KYC Status</span>
                  <span className={`${kycStyle.bg} ${kycStyle.text} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter`}>
                    {userData.kycStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/booking">
                <Button className="w-full gap-2">
                  <Clock className="w-4 h-4" /> Book Appointment
                </Button>
              </Link>
              {userData.kycStatus !== 'verified' && (
                <Link href="/kyc">
                  <Button variant="outline" className="w-full gap-2">
                    Complete KYC Verification
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-manrope text-xl font-bold">Recent Transactions</h2>
                <Link href="#" className="text-primary text-sm font-bold hover:underline">View Ledger</Link>
              </div>
              <Card className="p-0 overflow-hidden border-outline-variant/30">
                <div className="divide-y divide-outline-variant/30">
                  {userTransactions.length > 0 ? userTransactions.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      icon={tx.type === 'deposit' || tx.type === 'momo' ? <ArrowUpRight className="text-on-success-mint" /> : <ArrowDownLeft className="text-error" />}
                      title={tx.type === 'deposit' ? 'Internal Deposit' : tx.type === 'withdraw' ? 'Branch Withdrawal' : 'MoMo Transfer'}
                      date={new Date(tx.createdAt).toLocaleDateString()}
                      amount={`${tx.type === 'withdraw' ? '-' : '+'}${tx.amount}.00`}
                      status={tx.status}
                    />
                  )) : (
                    <div className="p-12 text-center text-outline italic">No recent transactions recorded</div>
                  )}
                </div>
              </Card>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="font-manrope text-xl font-bold mb-4">Upcoming Visit</h2>
              {activeBookings.length > 0 ? activeBookings.map((bk: any) => (
                <Card key={bk.id} className="bg-surface-container-low border-primary/10 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Clock className="text-primary w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{bk.service?.name}</p>
                      <p className="text-xs text-on-surface-variant mb-2">{bk.branch?.name}</p>
                      <p className="text-sm font-manrope font-bold text-primary">{new Date(bk.timeslot).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-outline-variant/50 flex flex-col gap-2">
                    <div className="bg-surface-container-highest/50 p-3 rounded-xl text-center border border-outline-variant">
                       <p className="text-[10px] uppercase font-bold text-outline tracking-widest mb-1">Check-in Code</p>
                       <p className="font-mono text-xl font-bold tracking-tighter text-primary">{bk.checkinCode}</p>
                    </div>
                  </div>
                </Card>
              )) : (
                <Card className="bg-surface-container-low text-center p-8 border-dashed border-2 border-outline-variant/50 shadow-none">
                  <p className="text-sm text-on-surface-variant italic">No appointments scheduled</p>
                </Card>
              )}
            </section>

            <section>
              <h2 className="font-manrope text-xl font-bold mb-4">Institutional Help</h2>
              <Card className="bg-surface-container-highest border-none p-0 overflow-hidden group">
                <Link href="/complaints" className="block p-6">
                   <h3 className="font-bold flex items-center justify-between group-hover:text-primary transition-colors">
                      Report an Issue <ArrowUpRight className="w-4 h-4 opacity-50" />
                   </h3>
                   <p className="text-xs text-on-surface-variant mt-1">Direct message our institutional support team.</p>
                </Link>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function TransactionRow({ icon, title, date, amount, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-surface-container-low/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="bg-surface-container w-10 h-10 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-bold text-sm">{title}</p>
          <p className="text-[10px] text-on-surface-variant font-medium">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-sm ${amount.startsWith('+') ? 'text-on-success-mint' : 'text-on-surface'}`}>
          GH₵ {amount.replace('+', '').replace('-', '')}
        </p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-outline">{status}</p>
      </div>
    </div>
  );
}