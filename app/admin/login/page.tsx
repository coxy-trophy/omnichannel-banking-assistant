'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'bank_admin_2026') {
      document.cookie = "admin_auth=true; path=/";
      router.push('/admin/dashboard');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-6 font-inter text-on-background">
      <Card className="max-w-md w-full border-primary/20 shadow-2xl overflow-hidden p-0 border-none bg-background">
        <div className="bg-primary p-12 text-center text-on-primary">
           <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20 shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <h1 className="font-manrope text-3xl font-black tracking-tight mb-2">Institutional Access</h1>
          <p className="text-on-primary-container text-xs font-bold uppercase tracking-widest opacity-80">Management Portal Auth</p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Master Authorization Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5 transition-colors group-focus-within:text-primary" />
                <input 
                  type="password" 
                  required
                  className={`w-full pl-12 pr-4 h-16 rounded-2xl border ${error ? 'border-error bg-error/5 animate-shake' : 'border-outline-variant'} focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-mono text-center tracking-[0.5em] text-lg bg-surface-container-lowest`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                />
              </div>
              {error && <p className="text-error text-[10px] font-black uppercase tracking-wider text-center mt-2">Access Denied: Invalid Institutional Key</p>}
            </div>

            <Button type="submit" className="w-full h-16 text-lg shadow-xl shadow-primary/20 gap-3">
              Enter Console <ArrowRight size={20} />
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-outline-variant/30 text-center">
            <p className="text-[9px] font-bold text-outline uppercase tracking-[0.2em] leading-relaxed">
              Unauthorized access to this terminal is strictly prohibited under institutional banking regulations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
