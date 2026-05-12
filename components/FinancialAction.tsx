'use client';

import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ArrowLeft, Wallet, CheckCircle2, AlertCircle, Building, Laptop } from 'lucide-react';
import Link from 'next/link';
import { processTransaction } from '@/app/actions';

interface FinancialActionPageProps {
  type: 'deposit' | 'withdraw';
  balance: number;
}

export default function FinancialActionPage({ type, balance }: FinancialActionPageProps) {
  const [method, setMethod] = useState<'online' | 'branch'>('online');
  const [amount, setAmount] = useState('');
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

    if (type === 'withdraw' && amountNum > balance) {
      setError('Insufficient funds');
      setStatus('failed');
      return;
    }

    const result = await processTransaction(type, amountNum);

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
            {type === 'deposit' ? 'Credit Received' : 'Funds Disbursed'}
          </h1>
          <p className="text-on-surface-variant mb-8 text-lg font-medium">
            GH₵ {parseFloat(amount).toFixed(2)} has been successfully processed.
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
          <h1 className="font-manrope text-2xl font-bold capitalize text-primary tracking-tight">{type} Institutional Funds</h1>
        </header>

        <Card className="border-outline-variant/30 shadow-xl overflow-hidden">
          {/* Method Selection */}
          <div className="p-6 border-b border-outline-variant/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-4">Select Method</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('online')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  method === 'online'
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50'
                }`}
              >
                <Laptop className={`w-6 h-6 ${method === 'online' ? 'text-primary' : 'text-outline'}`} />
                <span className={`text-sm font-bold ${method === 'online' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Do it Here
                </span>
                <span className="text-[10px] text-outline text-center">Instant online {type}</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('branch')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  method === 'branch'
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50'
                }`}
              >
                <Building className={`w-6 h-6 ${method === 'branch' ? 'text-primary' : 'text-outline'}`} />
                <span className={`text-sm font-bold ${method === 'branch' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  At Branch
                </span>
                <span className="text-[10px] text-outline text-center">Visit a branch location</span>
              </button>
            </div>
          </div>

          {method === 'online' ? (
            <form onSubmit={handleSubmit} className="space-y-8 p-6">
              <div className="bg-primary/5 p-6 rounded-2xl flex items-center gap-5 border border-primary/10">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-primary/10">
                   <Wallet className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-outline font-black uppercase tracking-widest">Available Liquidity</p>
                  <p className="text-2xl font-manrope font-bold text-primary tracking-tighter">GH₵ {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Transfer Amount (GH₵)</label>
                <div className="relative group">
                   <input
                    type="number"
                    required
                    step="0.01"
                    min="1"
                    max={type === 'withdraw' ? balance : undefined}
                    className="w-full px-6 h-20 rounded-2xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-3xl font-manrope font-black text-center transition-all bg-surface-container-lowest"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold text-sm">{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full h-16 text-lg shadow-lg shadow-primary/20" disabled={status === 'processing'}>
                {status === 'processing' ? 'Authorizing...' : `Authorize ${type}`}
              </Button>
            </form>
          ) : (
            <div className="p-6 space-y-6">
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <h3 className="font-manrope font-bold text-lg text-primary mb-2">Branch {type === 'deposit' ? 'Deposit' : 'Withdrawal'}</h3>
                <p className="text-sm text-on-surface-variant mb-4">
                  Visit any of our branch locations to {type} funds. Bring a valid ID and your account details.
                </p>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-mint" />
                    No appointment necessary
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-mint" />
                    Available at all branches
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-mint" />
                    Instant processing
                  </li>
                </ul>
              </div>
              <Link href="/booking" className="block">
                <Button className="w-full h-14">Book Branch Appointment</Button>
              </Link>
              <Link href="/search" className="block">
                <Button variant="outline" className="w-full h-14">Find Nearest Branch</Button>
              </Link>
            </div>
          )}

          <div className="mt-8 bg-surface-container-low p-4 text-center border-t border-outline-variant/30">
             <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-70">
                Transaction subject to institutional audit trails.
             </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
