import React from 'react';
export const dynamic = 'force-dynamic';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getRecentInquiries, getComplaintStats } from '@/lib/adminActions';
import { ComplaintActions } from '@/components/admin/ComplaintActions';

export default async function AdminComplaintsPage() {
  const [inquiries, complaintStats] = await Promise.all([
    getRecentInquiries(),
    getComplaintStats()
  ]);

  return (
    <div className="min-h-screen bg-background p-8 font-inter text-on-background">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-manrope text-3xl font-bold flex items-center gap-3 text-primary">
            <MessageSquare size={32} /> Support Inquiry Desk
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline mt-1">Customer Service Ledger</p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" className="px-6 border-outline-variant shadow-sm text-xs">Back to Overview</Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatSmallCard icon={<Clock className="text-tertiary" />} label="Response SLO" value="&lt; 15m" />
        <StatSmallCard icon={<CheckCircle2 className="text-on-success-mint" />} label="Resolved 24h" value={complaintStats.resolved24h.toString()} />
        <StatSmallCard icon={<AlertTriangle className="text-error" />} label="High Priority" value={complaintStats.highPriority.toString()} />
      </div>

      <Card className="p-0 overflow-hidden border-outline-variant/30 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[10px] uppercase tracking-widest text-outline border-b border-outline-variant/30">
                <th className="p-5 font-bold">Ticket Registry</th>
                <th className="p-5 font-bold">Customer Profile</th>
                <th className="p-5 font-bold">Category</th>
                <th className="p-5 font-bold">Inquiry Status</th>
                <th className="p-5 font-bold text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-outline-variant/10">
              {inquiries.length > 0 ? inquiries.map((iq: any) => (
                <tr key={iq.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-5 font-mono text-[10px] text-outline font-bold uppercase tracking-tighter">#{iq.id.slice(0, 8)}</td>
                  <td className="p-5 font-bold text-sm">{iq.user?.email || 'Guest Participant'}</td>
                  <td className="p-5 font-medium">{iq.category}</td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${iq.status === 'open' ? 'bg-error/10 text-error border-error/20' : 'bg-success-mint text-on-success-mint border-success-mint/50'}`}>
                      {iq.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <ComplaintActions complaintId={iq.id} status={iq.status} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-outline font-bold italic text-sm italic">
                    Support ledger is currently clear. No active tickets.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatSmallCard({ icon, label, value }: any) {
  return (
    <Card className="flex items-center gap-4 py-5 shadow-sm border-outline-variant/30">
      <div className="bg-surface-container w-10 h-10 rounded-xl flex items-center justify-center border border-outline-variant/20">{icon}</div>
      <div>
        <p className="text-[9px] uppercase font-black text-outline tracking-[0.1em] mb-0.5">{label}</p>
        <p className="text-xl font-manrope font-bold text-on-surface">{value}</p>
      </div>
    </Card>
  );
}
