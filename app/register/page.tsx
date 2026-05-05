'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { registerUser } from '../actions';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await registerUser(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
      <Card className="max-w-md w-full">
        <header className="text-center mb-8">
          <h1 className="font-manrope text-3xl font-bold text-primary">Create Account</h1>
          <p className="text-on-surface-variant">Join TrustBank and get GH₵ 1,000 initial balance</p>
        </header>

        <form action={handleSubmit} className="space-y-4">
          <InputGroup 
            name="name"
            icon={<User className="text-outline w-5 h-5" />} 
            label="Full Name" 
            placeholder="John Doe" 
          />
          <InputGroup 
            name="email"
            icon={<Mail className="text-outline w-5 h-5" />} 
            label="Email" 
            type="email"
            placeholder="john@example.com" 
          />
          <InputGroup 
            name="phone"
            icon={<Phone className="text-outline w-5 h-5" />} 
            label="Phone" 
            placeholder="+233 24 XXX XXXX" 
          />
          <InputGroup 
            name="password"
            icon={<Lock className="text-outline w-5 h-5" />} 
            label="Password" 
            type="password"
            placeholder="••••••••" 
          />

          {error && <p className="text-error text-sm font-bold">{error}</p>}

          <Button type="submit" className="w-full h-14 text-lg gap-2 mt-4" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'} <ArrowRight className="w-5 h-5" />
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-on-surface-variant">Already have an account? </span>
          <Link href="/login" className="font-bold text-primary hover:underline">Sign In</Link>
        </div>
      </Card>
    </div>
  );
}

function InputGroup({ icon, label, placeholder, type = "text", name }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
        <input 
          name={name}
          type={type} 
          required
          className="w-full pl-12 pr-4 h-14 rounded-xl border border-outline-variant focus:border-primary outline-none bg-surface-container-lowest"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
