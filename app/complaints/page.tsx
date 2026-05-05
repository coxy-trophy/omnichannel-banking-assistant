'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Send, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createComplaint, getUserComplaints } from './actions';

const CATEGORIES = [
  'Account Issue',
  'Transaction Dispute',
  'KYC Verification',
  'Card Services',
  'Technical Problem',
  'Other'
];

interface Complaint {
  id: string;
  category: string;
  message: string;
  status: string;
  createdAt: Date | string;
}

export default function ComplaintsPage() {
  const [view, setView] = useState<'list' | 'new'>('list');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    message: ''
  });

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    const data = await getUserComplaints();
    setComplaints(data.map((c: any) => ({
      ...c,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt
    })));
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await createComplaint(formData);

    if (result.success) {
      setSuccess(true);
      setFormData({ category: '', message: '' });
      loadComplaints();
      setTimeout(() => {
        setSuccess(false);
        setView('list');
      }, 2000);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <Card className="max-w-md w-full text-center py-12 border-none shadow-2xl">
          <div className="bg-success-mint w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-on-success-mint w-10 h-10" />
          </div>
          <h1 className="font-manrope text-3xl font-bold mb-2 text-primary">Ticket Submitted</h1>
          <p className="text-on-surface-variant mb-8 font-medium">
            Your inquiry has been received. Our support team will respond shortly.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center text-on-background font-inter">
      <div className="max-w-2xl w-full">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <div className="flex-1">
            <h1 className="font-manrope text-2xl font-bold text-primary tracking-tight">Customer Support</h1>
            <p className="text-xs text-on-surface-variant font-medium">Submit and track your inquiries</p>
          </div>
          {view === 'list' && (
            <Button onClick={() => setView('new')} className="gap-2">
              <MessageSquare className="w-4 h-4" /> New Ticket
            </Button>
          )}
        </header>

        {view === 'list' && (
          <div className="space-y-4">
            {complaints.length > 0 ? complaints.map((c) => (
              <Card key={c.id} className="p-5 border-outline-variant/30 hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-outline">#{c.id.slice(0, 8)}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.status === 'open' ? 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant' : 'bg-success-mint text-on-success-mint'}`}>
                    {c.status}
                  </span>
                </div>
                <h3 className="font-bold text-on-surface mb-1">{c.category}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2">{c.message}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-outline">
                  <Clock className="w-3 h-3" />
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </Card>
            )) : (
              <Card className="p-12 text-center border-dashed border-2 border-outline-variant/50">
                <MessageSquare className="w-12 h-12 text-outline mx-auto mb-4" />
                <p className="text-on-surface-variant font-medium">No support tickets yet</p>
                <Button onClick={() => setView('new')} className="mt-4">
                  Submit Your First Ticket
                </Button>
              </Card>
            )}
          </div>
        )}

        {view === 'new' && (
          <Card className="border-outline-variant/30 shadow-lg">
            <div className="p-6 border-b border-outline-variant/30">
              <h2 className="font-manrope text-xl font-bold">Submit New Ticket</h2>
              <p className="text-xs text-on-surface-variant mt-1">Our support team typically responds within 15 minutes</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 h-14 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none bg-surface-container-lowest font-medium"
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Your Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none bg-surface-container-lowest font-medium resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setView('list')} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Submit Ticket'} <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}