'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ArrowLeft, MessageSquare, Upload, CheckCircle2, Clock, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { getKycStatus, submitKyc, contactSupport } from './actions';

export default function KycPage() {
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const user = await getKycStatus();
    if (user) {
      setKycStatus(user.kycStatus);
    }
    setLoading(false);
  };

  const handleSubmitKyc = async () => {
    setSubmitting(true);
    const result = await submitKyc();
    if (result.success) {
      setKycStatus('pending');
    }
    setSubmitting(false);
  };

  const handleContactSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await contactSupport(supportMessage);
    if (result.success) {
      setSupportSent(true);
      setSupportMessage('');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading verification status...</p>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { icon: React.ReactNode; title: string; desc: string; color: string }> = {
    pending: {
      icon: <Clock className="w-8 h-8" />,
      title: 'Verification in Progress',
      desc: 'Your documents are being reviewed. This typically takes 24-48 hours.',
      color: 'text-tertiary bg-tertiary-fixed/30'
    },
    verified: {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: 'Identity Verified',
      desc: 'Your account has full access to all institutional services.',
      color: 'text-on-success-mint bg-success-mint'
    },
    rejected: {
      icon: <AlertCircle className="w-8 h-8" />,
      title: 'Verification Required',
      desc: 'Please submit your identification documents to verify your account.',
      color: 'text-error bg-error/10'
    }
  };

  const config = statusConfig[kycStatus] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center text-on-background font-inter">
      <div className="max-w-2xl w-full">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <div className="flex-1">
            <h1 className="font-manrope text-2xl font-bold text-primary tracking-tight">Identity Verification</h1>
            <p className="text-xs text-on-surface-variant font-medium">KYC compliance for institutional access</p>
          </div>
        </header>

        {supportSent ? (
          <Card className="max-w-md w-full text-center py-12 border-none shadow-2xl mx-auto">
            <div className="bg-success-mint w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-on-success-mint w-10 h-10" />
            </div>
            <h2 className="font-manrope text-2xl font-bold mb-2 text-primary">Message Sent</h2>
            <p className="text-on-surface-variant mb-6 font-medium">
              Our support team will respond to your inquiry shortly.
            </p>
            <Button onClick={() => { setSupportSent(false); setShowSupport(false); }}>
              Back to KYC
            </Button>
          </Card>
        ) : showSupport ? (
          <Card className="border-outline-variant/30 shadow-lg">
            <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-manrope text-xl font-bold">Contact Support</h2>
            </div>
            <form onSubmit={handleContactSupport} className="p-6 space-y-6">
              <p className="text-sm text-on-surface-variant">
                Having trouble with your KYC verification? Let us know and we'll help you resolve it.
              </p>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Describe Your Issue</label>
                <textarea
                  required
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none bg-surface-container-lowest font-medium resize-none"
                  placeholder="e.g., I'm having trouble uploading my ID photo..."
                />
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setShowSupport(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <>
            <Card className="p-8 border-outline-variant/30 shadow-lg mb-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${config.color}`}>
                  {config.icon}
                </div>
                <h2 className="font-manrope text-2xl font-bold mb-2">{config.title}</h2>
                <p className="text-on-surface-variant mb-6 font-medium max-w-md">
                  {config.desc}
                </p>

                {kycStatus === 'rejected' && (
                  <Button onClick={handleSubmitKyc} disabled={submitting} className="gap-2">
                    <Upload className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Documents'}
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6 border-outline-variant/30 bg-surface-container-low">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Need Help?</h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    If you're having trouble with document upload or have questions about verification requirements, our support team is here to help.
                  </p>
                  <Button variant="outline" onClick={() => setShowSupport(true)} className="gap-2">
                    Contact Support
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}