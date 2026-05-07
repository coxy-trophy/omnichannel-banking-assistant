import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getSession } from '@/app/actions';

export default async function HomePage() {
  const session = await getSession();
  const isLoggedIn = !!session.data?.user;

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Inter'] text-[#191b22]">
      {/* Top Navigation */}
      <header className="bg-[#faf8ff] sticky top-0 z-50 border-b border-[#e2e2eb]">
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
            <div className="relative max-w-xl">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00327d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full bg-white text-[#191b22] py-5 pl-14 pr-6 rounded-xl shadow-2xl focus:ring-2 focus:ring-[#dae2ff] outline-none transition-all placeholder:text-[#737784] font-['Inter']"
                placeholder="Search services, accounts, or support..."
                type="text"
              />
            </div>
          </div>
        </div>
        {/* Decorative background */}
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
          <Link href="/deposit" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d] shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#c7e8f5] flex items-center justify-center text-[#1d4c5b]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <span className="block font-['Manrope'] font-bold text-[#00327d]">Deposit</span>
              <span className="text-xs text-[#434653] uppercase tracking-wider">Funds</span>
            </div>
          </Link>

          <Link href="/withdraw" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d] shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#dae2ff] flex items-center justify-center text-[#00419e]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div>
              <span className="block font-['Manrope'] font-bold text-[#00327d]">Withdraw</span>
              <span className="text-xs text-[#434653] uppercase tracking-wider">Cash</span>
            </div>
          </Link>

          <Link href="/momo" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d] shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#bceafc] flex items-center justify-center text-[#1d4c5b]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="block font-['Manrope'] font-bold text-[#00327d]">MoMo</span>
              <span className="text-xs text-[#434653] uppercase tracking-wider">Transfer</span>
            </div>
          </Link>

          <Link href="/booking" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d] shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#e2e2eb] flex items-center justify-center text-[#434653]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="block font-['Manrope'] font-bold text-[#00327d]">Booking</span>
              <span className="text-xs text-[#434653] uppercase tracking-wider">Appointment</span>
            </div>
          </Link>

          <Link href="/kyc" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d] shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#dae2ff] flex items-center justify-center text-[#00419e]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="block font-['Manrope'] font-bold text-[#00327d]">KYC</span>
              <span className="text-xs text-[#434653] uppercase tracking-wider">Verification</span>
            </div>
          </Link>

          <Link href="/complaints" className="bg-white p-6 rounded-xl hover:bg-[#f3f3fc] transition-all cursor-pointer group flex flex-col justify-between h-40 border-b-2 border-transparent hover:border-[#00327d] shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <span className="block font-['Manrope'] font-bold text-[#00327d]">Support</span>
              <span className="text-xs text-[#434653] uppercase tracking-wider">Help</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 mt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Feature */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#386474] mb-2 block">
                  Why Bank Ledger
                </span>
                <h2 className="text-3xl font-['Manrope'] font-extrabold text-[#00327d] tracking-tight">
                  Institutional Grade Security
                </h2>
              </div>
            </div>
            <div className="bg-[#f3f3fc] p-8 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00327d] flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-[#00327d] text-xl">Vault Encryption</h3>
                  <p className="text-[#434653] leading-relaxed">
                    Quantum-resistant ledger encryption for every institutional transaction.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#386474] flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-[#00327d] text-xl">Instant Settlement</h3>
                  <p className="text-[#434653] leading-relaxed">
                    Real-time GH₵ liquidity movements via our proprietary MoMo bridge.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1b3b46] flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-[#00327d] text-xl">Branch Network</h3>
                  <p className="text-[#434653] leading-relaxed">
                    Seamless transition between digital interfaces and physical institutional hubs.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0047ab] flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-[#00327d] text-xl">Asset Custody</h3>
                  <p className="text-[#434653] leading-relaxed">
                    Comprehensive oversight of your entire institutional wealth portfolio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side CTA */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#386474] mb-2 block">
                Get Started
              </span>
              <h2 className="text-3xl font-['Manrope'] font-extrabold text-[#00327d] tracking-tight">
                Open an Account
              </h2>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-[#00327d]">
              <p className="text-[#434653] leading-relaxed mb-6">
                Join thousands of institutions and individuals who trust Bank Ledger for their financial operations.
              </p>
              <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                <Button className="w-full bg-[#00327d] text-white font-['Manrope'] font-bold py-4 rounded-lg text-lg hover:bg-[#0047ab] transition-colors">
                  {isLoggedIn ? 'Go to Dashboard' : 'Create Account'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f3f3fc] mt-20 py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
          <div>
            <span className="font-['Manrope'] font-bold text-[#00327d] text-lg uppercase block mb-4">
              Bank Ledger
            </span>
            <p className="font-['Inter'] text-sm leading-relaxed text-[#386474] max-w-md">
              Building the future of institutional finance through structural precision and uncompromising security standards.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Link href="/booking" className="font-['Inter'] text-sm text-[#386474] hover:text-[#00327d] transition-colors">
                Book Appointment
              </Link>
              <Link href="/complaints" className="font-['Inter'] text-sm text-[#386474] hover:text-[#00327d] transition-colors">
                Support
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/kyc" className="font-['Inter'] text-sm text-[#386474] hover:text-[#00327d] transition-colors">
                KYC Verification
              </Link>
              <Link href="/admin/login" className="font-['Inter'] text-sm text-[#386474] hover:text-[#00327d] transition-colors">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full mt-12 pt-8 border-t border-[#c3c6d5]">
          <p className="font-['Inter'] text-xs text-[#386474]">
            © 2026 Bank Ledger. Institutional Precision.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white z-50 rounded-t-xl shadow-[0_-10px_30px_rgba(25,27,34,0.04)] border-t border-[#f3f3fc]">
        <Link href="/" className="flex flex-col items-center justify-center text-[#00327d] bg-[#dae2ff]/30 rounded-lg px-3 py-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-medium tracking-wide uppercase mt-1">Discover</span>
        </Link>
        <Link href="/booking" className="flex flex-col items-center justify-center text-[#386474]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-medium tracking-wide uppercase mt-1">Bookings</span>
        </Link>
        <Link href="/complaints" className="flex flex-col items-center justify-center text-[#386474]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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