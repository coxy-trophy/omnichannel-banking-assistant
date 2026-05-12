import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getSession, getUserBalance } from '@/app/actions';
import { db } from '@/db';
import { transactions, bookings } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { MapPin, Calendar, HelpCircle, Search, CreditCard, FileText, Building, PiggyBank, Landmark, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import AtmMapWidget from '@/components/AtmMapWidget';

export default async function HomePage() {
  const session = await getSession();
  const isLoggedIn = !!session.data?.user;

  let recentRequests: any[] = [];
  let balance = 0;

  if (isLoggedIn && session.data?.user.id) {
    const userId = session.data.user.id;
    balance = await getUserBalance(userId);

    const rawBookings = await db.query.bookings.findMany({
      where: eq(bookings.userId, userId),
      with: { service: true, branch: true } as any,
      orderBy: [desc(bookings.createdAt)],
      limit: 3,
    });

    recentRequests = (rawBookings as any[]).map(bk => ({
      id: bk.id,
      title: bk.service?.name || 'Appointment',
      subtitle: bk.branch?.name || 'Pending',
      date: bk.createdAt instanceof Date ? bk.createdAt.toISOString() : bk.createdAt,
      status: bk.status,
      type: 'booking',
    }));
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-inter">
      {/* Top Navigation */}
      <header className="bg-[#faf8ff] sticky top-0 z-40 border-b border-[#e2e2eb]">
        <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-lg font-['Manrope'] font-extrabold tracking-tighter text-[#00327d] uppercase">Bank Ledger</span>
            <div className="hidden md:flex gap-6">
              <Link href="/" className="font-['Manrope'] font-bold tracking-tight uppercase text-xs text-[#00327d] border-b-2 border-[#00327d] pb-1">
                Discover
              </Link>
              <Link href="/booking" className="font-['Manrope'] font-bold tracking-tight uppercase text-xs text-[#386474] hover:bg-[#f3f3fc] transition-colors px-2 py-1">
                Bookings
              </Link>
              <Link href="/complaints" className="font-['Manrope'] font-bold tracking-tight uppercase text-xs text-[#386474] hover:bg-[#f3f3fc] transition-colors px-2 py-1">
                Support
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="font-['Manrope'] font-bold tracking-tight uppercase text-xs bg-[#00327d] text-white px-4 py-2 rounded-lg hover:bg-[#0047ab]">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="font-['Manrope'] font-bold tracking-tight uppercase text-xs text-[#00327d] px-4 py-2 bg-[#f3f3fc] rounded-lg border-none">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="font-['Manrope'] font-bold tracking-tight uppercase text-xs bg-[#00327d] text-white px-4 py-2 rounded-lg hover:bg-[#0047ab]">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#00327d] to-[#0047ab] pt-24 pb-32 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a5bdff] mb-4 font-['Inter']">
                Institutional Precision
              </p>
              <h1 className="font-['Manrope'] text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-none mb-10">
                What do you<br />need?
              </h1>
              <Link href="/search" className="block max-w-xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00327d]" />
                  <input
                    className="w-full bg-white text-[#191b22] py-5 pl-14 pr-6 rounded-xl shadow-2xl focus:ring-2 focus:ring-[#dae2ff] outline-none transition-all placeholder:text-[#737784] font-['Inter'] cursor-pointer"
                    placeholder="Search services, accounts, or support..."
                    type="text"
                    readOnly
                  />
                </div>
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0,60 Q25,10 50,60 T100,60" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
        </section>

        {/* Service Pickers */}
        <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Link href="/deposit" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d]">
              <div className="w-10 h-10 rounded-full bg-[#c7e8f5] flex items-center justify-center text-[#1d4c5b]">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-['Manrope'] font-bold text-[#00327d]">Cash</span>
                <span className="text-xs text-[#434653] uppercase tracking-wider">Deposit</span>
              </div>
            </Link>

            <Link href="/withdraw" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d]">
              <div className="w-10 h-10 rounded-full bg-[#dae2ff] flex items-center justify-center text-[#00419e]">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-['Manrope'] font-bold text-[#00327d]">Account</span>
                <span className="text-xs text-[#434653] uppercase tracking-wider">Withdrawal</span>
              </div>
            </Link>

            <Link href="/momo" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d]">
              <div className="w-10 h-10 rounded-full bg-[#bceafc] flex items-center justify-center text-[#1d4c5b]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-['Manrope'] font-bold text-[#00327d]">Card</span>
                <span className="text-xs text-[#434653] uppercase tracking-wider">MoMo Transfer</span>
              </div>
            </Link>

            <Link href="/booking" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d]">
              <div className="w-10 h-10 rounded-full bg-[#e2e2eb] flex items-center justify-center text-[#434653]">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-['Manrope'] font-bold text-[#00327d]">Loan</span>
                <span className="text-xs text-[#434653] uppercase tracking-wider">Appointment</span>
              </div>
            </Link>

            <Link href="/kyc" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d]">
              <div className="w-10 h-10 rounded-full bg-[#dae2ff] flex items-center justify-center text-[#00419e]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-['Manrope'] font-bold text-[#00327d]">KYC</span>
                <span className="text-xs text-[#434653] uppercase tracking-wider">Verification</span>
              </div>
            </Link>

            <Link href="/complaints" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d]">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-['Manrope'] font-bold text-[#00327d]">Support</span>
                <span className="text-xs text-[#434653] uppercase tracking-wider">Complaints</span>
              </div>
            </Link>
          </div>
        </section>

        {/* ATM Map & Recent Activity */}
        <section className="max-w-7xl mx-auto px-6 mt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* ATM Map Widget */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#386474] mb-2 block">Proximity Services</span>
                  <h2 className="text-3xl font-['Manrope'] font-extrabold text-[#00327d] tracking-tight">Nearest ATM</h2>
                </div>
                <Link href="/search" className="text-[#00327d] text-sm font-semibold hover:underline">View Map</Link>
              </div>

              <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-[#f3f3fc] border border-[#c3c6d5]/30">
                <AtmMapWidget
                  atms={[
                    { id: 1, name: 'Accra Central ATM', location: 'Independence Ave, Accra', lat: 5.5560, lng: -0.2026, available: true, category: 'ATM' },
                    { id: 2, name: 'Osu Oxford St ATM', location: 'Oxford St, Osu, Accra', lat: 5.5558, lng: -0.1769, available: true, category: 'ATM' },
                    { id: 3, name: 'Airport City ATM', location: 'Airport City, Accra', lat: 5.6052, lng: -0.1769, available: true, category: 'ATM' },
                    { id: 4, name: 'East Legon ATM', location: 'American House, East Legon', lat: 5.6392, lng: -0.1618, available: true, category: 'ATM' },
                    { id: 5, name: 'Spintex ATM', location: 'Spintex Road, Accra', lat: 5.6298, lng: -0.1356, available: true, category: 'ATM' },
                    { id: 8, name: 'Circle ATM', location: 'Kwame Nkrumah Circle, Accra', lat: 5.5676, lng: -0.2156, available: true, category: 'ATM' },
                    { id: 11, name: 'Labone ATM', location: 'Labone, Accra', lat: 5.5620, lng: -0.1756, available: true, category: 'ATM' },
                    { id: 14, name: 'Achimota ATM', location: 'Achimota Mall, Accra', lat: 5.6220, lng: -0.2256, available: true, category: 'ATM' },
                  ]}
                  center={[5.6037, -0.1870]}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-4 space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#386474] mb-2 block">Recent Activity</span>
                <h2 className="text-3xl font-['Manrope'] font-extrabold text-[#00327d] tracking-tight">Recent Requests</h2>
              </div>

              <div className="space-y-6">
                {isLoggedIn && recentRequests.length > 0 ? recentRequests.map((req) => (
                  <Link key={req.id} href={`/booking/${req.id}`} className="group cursor-pointer block">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#dae2ff] flex items-center justify-center text-[#00419e] group-hover:bg-[#00327d] group-hover:text-white transition-colors">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-['Manrope'] font-bold text-[#191b22]">{req.title}</p>
                          <p className="text-sm text-[#434653]">{req.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-[#386474]">
                        {new Date(req.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 flex-1 bg-[#e2e2eb] rounded-full overflow-hidden">
                        <div className={`h-full ${req.status === 'completed' ? 'w-full bg-[#22c55e]' : req.status === 'upcoming' ? 'w-2/3 bg-[#00327d]' : 'w-1/3 bg-[#ef4444]'}`} />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-[#00327d]">{req.status}</span>
                    </div>
                  </Link>
                )) : (
                  <>
                    <div className="group cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#dae2ff] flex items-center justify-center text-[#00419e] group-hover:bg-[#00327d] group-hover:text-white transition-colors">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-['Manrope'] font-bold text-[#191b22]">New Card Request</p>
                            <p className="text-sm text-[#434653]">Request ID: #88291</p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-[#386474]">Oct 24</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-[#e2e2eb] rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-[#00327d]" />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-[#00327d]">IN REVIEW</span>
                      </div>
                    </div>
                    <div className="group cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#bceafc] flex items-center justify-center text-[#1d4c5b] group-hover:bg-[#386474] group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-['Manrope'] font-bold text-[#191b22]">Proof of Funds</p>
                            <p className="text-sm text-[#434653]">Request ID: #88244</p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-[#386474]">Oct 21</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-[#e2e2eb] rounded-full overflow-hidden">
                          <div className="h-full w-full bg-[#22c55e]" />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-[#22c55e]">Completed</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button className="w-full py-4 border-2 border-[#c3c6d5] text-[#00327d] font-['Manrope'] font-bold uppercase text-xs tracking-widest hover:bg-[#f3f3fc] transition-colors">
                    View All History
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="w-full py-4 border-2 border-[#c3c6d5] text-[#00327d] font-['Manrope'] font-bold uppercase text-xs tracking-widest hover:bg-[#f3f3fc] transition-colors">
                    Sign In to View
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f3f3fc] mt-20 py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
          <div>
            <span className="font-['Manrope'] font-bold text-[#00327d] text-lg uppercase block mb-4">Bank Ledger</span>
            <p className="font-['Inter'] text-sm leading-relaxed text-[#386474] max-w-md">
              Building the future of institutional finance through structural precision and uncompromising security standards.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Link href="/complaints" className="font-['Inter'] text-sm text-[#386474] hover:text-[#00327d] transition-colors">
                Help Center
              </Link>
              <Link href="/complaints" className="font-['Inter'] text-sm text-[#386474] hover:text-[#00327d] transition-colors">
                Contact Us
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="#" className="font-['Inter'] text-sm text-[#386474] hover:text-[#00327d] transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="font-['Inter'] text-sm text-[#386474] hover:text-[#00327d] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full mt-12 pt-8 border-t border-[#c3c6d5]/20">
          <p className="font-['Inter'] text-xs text-[#386474]">
            © 2026 Bank Ledger. Institutional Precision.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white z-50 rounded-t-xl shadow-[0_-10px_30px_rgba(25,27,34,0.04)] border-t border-[#f3f3fc]">
        <Link href="/" className="flex flex-col items-center justify-center text-[#00327d] bg-[#dae2ff]/30 rounded-lg px-3 py-1">
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide uppercase mt-1">Discover</span>
        </Link>
        <Link href="/booking" className="flex flex-col items-center justify-center text-[#386474]">
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide uppercase mt-1">Bookings</span>
        </Link>
        <Link href="/complaints" className="flex flex-col items-center justify-center text-[#386474]">
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide uppercase mt-1">Support</span>
        </Link>
        <Link href={isLoggedIn ? "/dashboard" : "/login"} className="flex flex-col items-center justify-center text-[#386474]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium tracking-wide uppercase mt-1">Account</span>
        </Link>
      </nav>
    </div>
  );
}
