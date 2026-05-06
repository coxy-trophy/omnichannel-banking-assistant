import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Landmark, Wallet, Globe, Zap, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { getSession } from '@/app/actions';

export default async function HomePage() {
  const session = await getSession();
  const isLoggedIn = !!session.data?.user;

  return (
    <div className="min-h-screen bg-background flex flex-col font-inter text-on-background">
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="bg-primary text-on-primary w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg shadow-primary/20">TB</div>
           <h1 className="font-manrope font-black text-2xl text-primary tracking-tighter">Bank Ledger</h1>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" className="border-none hover:bg-primary/5 text-primary gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-none hover:bg-primary/5 text-primary">Log In</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" className="px-6 shadow-lg shadow-primary/20 rounded-xl">Register Account</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Institutional Hero */}
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-success-mint px-4 py-1.5 rounded-full border border-success-mint/50">
               <Zap className="w-4 h-4 text-on-success-mint" />
               <span className="text-[10px] font-black uppercase tracking-widest text-on-success-mint">Institutional Excellence 2026</span>
            </div>
            <h2 className="font-manrope text-5xl md:text-7xl font-black text-primary leading-[1.05] tracking-tighter">
              The Future of <span className="text-surface-tint underline decoration-primary/10">Omnichannel</span> Finance.
            </h2>
            <p className="text-on-surface-variant text-xl md:text-2xl font-medium leading-relaxed max-w-xl">
              Experience zero-latency institutional banking. From real-time ledger management to AI-driven forensics, we are your financial anchor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                 <Button className="h-16 px-10 text-lg gap-3 shadow-2xl shadow-primary/30 group">
                    {isLoggedIn ? 'Go to Dashboard' : 'Begin Onboarding'} <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                 </Button>
               </Link>
               <Link href="/booking">
                 <Button variant="outline" className="h-16 px-10 text-lg border-outline-variant hover:bg-surface-container shadow-sm">
                    Locate Institution
                 </Button>
               </Link>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
             <Card className="bg-primary aspect-video rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,30,64,0.3)] border-none p-10 flex flex-col justify-between group overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
                <div className="relative z-10">
                   <div className="flex justify-between items-start">
                      <div className="w-16 h-10 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30" />
                      <Globe className="text-white/40 w-8 h-8" />
                   </div>
                   <div className="mt-12 text-white/90 font-mono tracking-[0.3em] text-xl">4582 •••• •••• 9921</div>
                </div>
                <div className="relative z-10 flex justify-between items-end">
                   <div>
                      <p className="text-[9px] uppercase font-bold text-white/50 tracking-widest mb-1">Institutional Partner</p>
                      <p className="text-white font-bold tracking-tight">WUSSAH COXY</p>
                   </div>
                   <div className="flex gap-2">
                      <div className="w-8 h-8 bg-error/80 rounded-full blur-sm" />
                      <div className="w-8 h-8 bg-tertiary-fixed/80 rounded-full blur-sm -ml-4" />
                   </div>
                </div>
             </Card>
             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-surface-tint/20 rounded-full blur-3xl" />
             <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-surface-container-low/50 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
               <h3 className="font-manrope text-3xl md:text-4xl font-black text-primary tracking-tight">Enterprise Infrastructure</h3>
               <p className="text-on-surface-variant max-w-2xl mx-auto font-medium">Engineered for absolute reliability in high-stakes financial environments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<ShieldCheck className="text-primary" />}
                title="Forensic Security"
                desc="Quantum-resistant ledger encryption for every institutional transaction."
              />
              <FeatureCard
                icon={<Zap className="text-surface-tint" />}
                title="Instant Settlement"
                desc="Real-time GH₵ liquidity movements via our proprietary MoMo bridge."
              />
              <FeatureCard
                icon={<Landmark className="text-secondary" />}
                title="Branch Synergy"
                desc="Seamless transition between digital interfaces and physical institutional hubs."
              />
              <FeatureCard
                icon={<Wallet className="text-on-success-mint" />}
                title="Asset Custody"
                desc="Comprehensive oversight of your entire institutional wealth portfolio."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary p-12 text-on-primary">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10 pb-12">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <div className="bg-white text-primary w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">TB</div>
                  <h4 className="font-manrope font-black text-xl tracking-tighter text-white">Bank Ledger</h4>
               </div>
               <p className="text-sm text-on-primary-container font-medium max-w-xs">Authorized by the central institutional authority. Registered and regulated since 2026.</p>
            </div>
            <div>
               <h5 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-white/40">Institution</h5>
               <ul className="space-y-3 text-sm font-bold">
                  <li className="hover:text-surface-tint transition-colors cursor-pointer">Security Protocol</li>
                  <li className="hover:text-surface-tint transition-colors cursor-pointer">Ledger Transparency</li>
                  <li className="hover:text-surface-tint transition-colors cursor-pointer">Regional Hubs</li>
               </ul>
            </div>
            <div>
               <h5 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-white/40">Compliance</h5>
               <ul className="space-y-3 text-sm font-bold">
                  <li className="hover:text-surface-tint transition-colors cursor-pointer">KYC Regulations</li>
                  <li className="hover:text-surface-tint transition-colors cursor-pointer">Audit Controls</li>
                  <li className="hover:text-surface-tint transition-colors cursor-pointer">Legal Framework</li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-50">
            <p>&copy; 2026 Bank Ledger Institutional. All Rights Reserved.</p>
            <div className="flex gap-6">
               <span>Privacy</span>
               <span>Terms</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-outline-variant/30 group">
      <div className="bg-surface-container-low w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-500 text-primary group-hover:text-white">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 28, className: 'transition-colors duration-500' })}
      </div>
      <h4 className="font-manrope text-xl font-black text-primary mb-3 tracking-tight">{title}</h4>
      <p className="text-on-surface-variant font-medium leading-relaxed text-sm">{desc}</p>
    </Card>
  );
}