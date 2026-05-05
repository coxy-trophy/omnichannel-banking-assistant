'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Smartphone, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { processMomoDeposit } from './actions';

export default function MomoDepositPage() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('processing');

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      setStatus('failed');
      return;
    }

    if (amountNum > 1000) {
      setError('MoMo deposits are limited to GH₵ 1,000 per transaction');
      setStatus('failed');
      return;
    }

    if (!phone.match(/^0\d{9}$/)) {
      setError('Please enter a valid Ghana phone number (e.g., 0241234567)');
      setStatus('failed');
      return;
    }

    const result = await processMomoDeposit(amountNum, phone);

    if (result.success) {
      setStatus('success');
    } else {
      setError(result.error || 'Transaction failed');
      setStatus('failed');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <Card className="max-w-md w-full text-center py-12 border-none shadow-2xl">
          <div className="bg-success-mint w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-on-success-mint w-10 h-10" />
          </div>
          <h1 className="font-manrope text-3xl font-bold mb-2 text-primary uppercase tracking-tight">
            MoMo Deposit Successful
          </h1>
          <p className="text-on-surface-variant mb-8 text-lg font-medium">
            GH₵ {parseFloat(amount).toFixed(2)} has been credited to your account.
          </p>
          <Link href="/dashboard" className="block w-full">
            <Button className="w-full h-14">Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center text-on-background font-inter">
      <div className="max-w-md w-full">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <h1 className="font-manrope text-2xl font-bold text-primary tracking-tight">MoMo Deposit</h1>
        </header>

        <Card className="border-outline-variant/30 shadow-xl overflow-hidden">
          <div className="bg-surface-tint/10 p-6 flex items-center gap-4 border-b border-outline-variant/30">
            <div className="bg-surface-tint p-3 rounded-xl">
              <Smartphone className="text-on-surface-tint w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-outline font-black uppercase tracking-widest">Mobile Money</p>
              <p className="text-lg font-manrope font-bold text-on-surface">Instant Deposit</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-tertiary-fixed/10 p-4 rounded-xl border border-tertiary-fixed/20">
              <p className="text-[10px] font-bold text-on-tertiary-fixed-variant uppercase tracking-widest mb-1">
                Transaction Limit
              </p>
              <p className="text-sm font-medium text-on-surface">
                MoMo deposits are limited to <span className="font-bold text-primary">GH₵ 1,000</span> per transaction.
                For larger deposits, please visit a branch or use internal transfer.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Phone Number</label>
              <input
                type="tel"
                required
                pattern="0[0-9]{9}"
                className="w-full px-4 h-14 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-lg font-medium bg-surface-container-lowest"
                placeholder="0241234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Amount (GH₵)</label>
              <input
                type="number"
                required
                step="0.01"
                min="1"
                max="1000"
                className="w-full px-6 h-20 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-3xl font-manrope font-black text-center transition-all bg-surface-container-lowest"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-xl">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-16 text-lg shadow-lg shadow-primary/20" disabled={status === 'processing'}>
              {status === 'processing' ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
              ) : (
                'Initiate Deposit'
              )}
            </Button>
          </form>

          <div className="px-6 pb-6">
            <p className="text-[9px] text-center font-bold text-on-surface-variant uppercase tracking-widest opacity-70">
              You will receive a prompt on your phone to confirm the payment.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}