'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
      <Card className="max-w-md w-full">
        <header className="text-center mb-8">
          <h1 className="font-manrope text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-on-surface-variant">Sign in to your Bank Ledger account</p>
        </header>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
              <input 
                name="email"
                type="email" 
                required
                className="w-full pl-12 pr-4 h-14 rounded-xl border border-outline-variant focus:border-primary outline-none bg-surface-container-lowest"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
              <input 
                name="password"
                type="password" 
                required
                className="w-full pl-12 pr-4 h-14 rounded-xl border border-outline-variant focus:border-primary outline-none bg-surface-container-lowest"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-error text-sm font-bold">{error}</p>}

          <Button type="submit" className="w-full h-14 text-lg gap-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-5 h-5" />
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-on-surface-variant">Don't have an account? </span>
          <Link href="/register" className="font-bold text-primary hover:underline">Register Now</Link>
        </div>
      </Card>
    </div>
  );
}
