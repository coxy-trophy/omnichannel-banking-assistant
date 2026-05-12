'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { loginUser } from '../actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await loginUser(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-6 text-[#191b22]">
      <Card className="max-w-md w-full border-outline-variant/30 shadow-xl">
        <header className="text-center mb-8 pt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00327d] hover:underline mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-['Manrope'] font-bold text-sm uppercase tracking-widest">Back to Home</span>
          </Link>
          <h1 className="font-['Manrope'] text-3xl font-extrabold text-[#00327d] tracking-tight">Welcome Back</h1>
          <p className="text-[#434653] mt-2">Sign in to your Bank Ledger account</p>
        </header>

        <form action={handleSubmit} className="space-y-5 px-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#737784] ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737784] w-5 h-5" />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-12 pr-4 h-14 rounded-xl border border-[#c3c6d5] focus:border-[#00327d] focus:ring-4 focus:ring-[#00327d]/5 outline-none bg-white text-lg"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#737784] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737784] w-5 h-5" />
              <input
                name="password"
                type="password"
                required
                className="w-full pl-12 pr-4 h-14 rounded-xl border border-[#c3c6d5] focus:border-[#00327d] focus:ring-4 focus:ring-[#00327d]/5 outline-none bg-white text-lg"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 p-3 rounded-xl flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#ba1a1a]" />
              <span className="font-bold text-sm text-[#ba1a1a]">{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full h-14 text-lg gap-2 bg-[#00327d] hover:bg-[#0047ab]" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-5 h-5" />
          </Button>
        </form>

        <div className="mt-8 py-6 border-t border-[#c3c6d5]/30 text-center text-sm">
          <span className="text-[#434653]">Don't have an account? </span>
          <Link href="/register" className="font-bold text-[#00327d] hover:underline">Register Now</Link>
        </div>
      </Card>
    </div>
  );
}
