import React from 'react';
export const dynamic = 'force-dynamic';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserCheck } from 'lucide-react';
import Link from 'next/link';
import { getPendingKYC } from '@/lib/adminActions';

export default async function AdminKYCPage() {
  const pendingUsers = await getPendingKYC();

  return (
    <div className="min-h-screen bg-background p-8 font-inter text-on-background">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-manrope text-3xl font-bold flex items-center gap-3 text-primary">
            <UserCheck size={32} /> KYC Verification Queue
          </h1>
          <p className="text-on-surface-variant font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Institutional Compliance</p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" className="px-6 border-outline-variant shadow-sm text-xs">Exit to Overview</Button>
        </Link>
      </header>

      <Card className="p-0 overflow-hidden border-outline-variant/30 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[10px] uppercase tracking-widest text-outline border-b border-outline-variant/30">
                <th className="p-5 font-bold">User Identity</th>
                <th className="p-5 font-bold">Registration Date</th>
                <th className="p-5 font-bold">Compliance Status</th>
                <th className="p-5 font-bold text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-outline-variant/20">
              {pendingUsers.length > 0 ? pendingUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-5">
                    <p className="font-bold text-sm">{user.email || user.phone}</p>
                    <p className="text-[10px] text-outline font-mono mt-0.5 tracking-tighter uppercase">{user.id}</p>
                  </td>
                  <td className="p-5 font-medium text-on-surface-variant">
                    {new Date(user.createdAt).toLocaleDateString([], { dateStyle: 'long' })}
                  </td>
                  <td className="p-5">
                    <span className="bg-tertiary-fixed/40 text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-tertiary-fixed-dim/30">
                      Pending Review
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <Button variant="primary" className="px-5 py-2 text-[10px] uppercase font-bold tracking-wider">Inspect Documents</Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-outline font-bold italic text-sm">
                    Institutional queue is empty. All users have been verified.
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
