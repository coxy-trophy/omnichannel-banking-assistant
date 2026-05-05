'use server';

import { db } from '@/db';
import { users, bookings, transactions, complaints, services, branches } from '@/db/schema';
import { count, sql, gte } from 'drizzle-orm';
import * as XLSX from 'xlsx';

interface ReportData {
  summary: {
    totalUsers: number;
    totalBookings: number;
    totalTransactions: number;
    totalComplaints: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalMomo: number;
    pendingKyc: number;
    verifiedKyc: number;
    openComplaints: number;
    resolvedComplaints: number;
  };
  transactions: any[];
  bookings: any[];
  users: any[];
  complaints: any[];
  dailyTransactions: { date: string; deposits: number; withdrawals: number; momo: number }[];
  serviceUsage: { service: string; count: number }[];
  branchUsage: { branch: string; count: number }[];
}

export async function generateReportData(): Promise<ReportData> {
  try {
    // Summary counts
    const [totalUsers] = await db.select({ value: count() }).from(users);
    const [totalBookings] = await db.select({ value: count() }).from(bookings);
    const [totalTransactions] = await db.select({ value: count() }).from(transactions);
    const [totalComplaints] = await db.select({ value: count() }).from(complaints);

    const [pendingKyc] = await db.select({ value: count() }).from(users).where(sql`kyc_status = 'pending'`);
    const [verifiedKyc] = await db.select({ value: count() }).from(users).where(sql`kyc_status = 'verified'`);

    const [openComplaints] = await db.select({ value: count() }).from(complaints).where(sql`status = 'open'`);
    const [resolvedComplaints] = await db.select({ value: count() }).from(complaints).where(sql`status = 'resolved'`);

    // Transaction sums
    const [depositSum] = await db.select({ value: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactions)
      .where(sql`type = 'deposit' AND status = 'success'`);

    const [withdrawSum] = await db.select({ value: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactions)
      .where(sql`type = 'withdraw' AND status = 'success'`);

    const [momoSum] = await db.select({ value: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactions)
      .where(sql`type = 'momo' AND status = 'success'`);

    // Get all transactions with user info
    const allTransactions = await db.query.transactions.findMany({
      with: { user: true } as any,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    // Get all bookings with relations
    const allBookings = await db.query.bookings.findMany({
      with: {
        user: true,
        service: true,
        branch: true,
      } as any,
      orderBy: (b, { desc }) => [desc(b.createdAt)],
    });

    // Get all users
    const allUsers = await db.query.users.findMany({
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });

    // Get all complaints
    const allComplaints = await db.query.complaints.findMany({
      with: { user: true } as any,
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    });

    // Daily transactions for last 30 days
    const now = new Date();
    const thirtyDaysAgo = Math.floor((now.getTime() - 30 * 24 * 60 * 60 * 1000) / 1000);

    const dailyTxData = await db
      .select({
        date: sql<string>`date(datetime(created_at, 'unixepoch'))`,
        type: transactions.type,
        amount: sql<number>`SUM(amount)`
      })
      .from(transactions)
      .where(sql`created_at >= ${thirtyDaysAgo} AND status = 'success'`)
      .groupBy(sql`date(datetime(created_at, 'unixepoch'))`, transactions.type);

    // Process daily transactions
    const dailyMap = new Map<string, { deposits: number; withdrawals: number; momo: number }>();
    for (const tx of dailyTxData) {
      let day = dailyMap.get(tx.date) || { deposits: 0, withdrawals: 0, momo: 0 };
      if (tx.type === 'deposit') day.deposits = Number(tx.amount);
      if (tx.type === 'withdraw') day.withdrawals = Number(tx.amount);
      if (tx.type === 'momo') day.momo = Number(tx.amount);
      dailyMap.set(tx.date, day);
    }

    const dailyTransactions = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Service usage
    const serviceUsage = await db
      .select({
        service: services.name,
        count: count()
      })
      .from(bookings)
      .innerJoin(services, sql`bookings.service_id = services.id`)
      .groupBy(services.name);

    // Branch usage
    const branchUsage = await db
      .select({
        branch: branches.name,
        count: count()
      })
      .from(bookings)
      .innerJoin(branches, sql`bookings.branch_id = branches.id`)
      .groupBy(branches.name);

    return {
      summary: {
        totalUsers: Number(totalUsers?.value || 0),
        totalBookings: Number(totalBookings?.value || 0),
        totalTransactions: Number(totalTransactions?.value || 0),
        totalComplaints: Number(totalComplaints?.value || 0),
        totalDeposits: Number(depositSum?.value || 0),
        totalWithdrawals: Number(withdrawSum?.value || 0),
        totalMomo: Number(momoSum?.value || 0),
        pendingKyc: Number(pendingKyc?.value || 0),
        verifiedKyc: Number(verifiedKyc?.value || 0),
        openComplaints: Number(openComplaints?.value || 0),
        resolvedComplaints: Number(resolvedComplaints?.value || 0),
      },
      transactions: allTransactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        currency: t.currency,
        user: t.user?.email || 'Unknown',
        date: new Date(t.createdAt).toLocaleDateString(),
      })),
      bookings: allBookings.map((b: any) => ({
        id: b.id,
        checkinCode: b.checkinCode,
        status: b.status,
        user: b.user?.email || 'Unknown',
        service: b.service?.name || 'Unknown',
        branch: b.branch?.name || 'Unknown',
        date: new Date(b.timeslot).toLocaleDateString(),
        time: new Date(b.timeslot).toLocaleTimeString(),
      })),
      users: allUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name || 'N/A',
        phone: u.phone || 'N/A',
        role: u.role,
        kycStatus: u.kycStatus,
        date: new Date(u.createdAt).toLocaleDateString(),
      })),
      complaints: allComplaints.map((c: any) => ({
        id: c.id,
        category: c.category,
        status: c.status,
        user: c.user?.email || 'Unknown',
        message: c.message,
        date: new Date(c.createdAt).toLocaleDateString(),
      })),
      dailyTransactions,
      serviceUsage: serviceUsage.map((s: any) => ({ service: s.service, count: Number(s.count) })),
      branchUsage: branchUsage.map((b: any) => ({ branch: b.branch, count: Number(b.count) })),
    };
  } catch (error) {
    console.error('Report Generation Error:', error);
    throw error;
  }
}

export async function downloadExcelReport(): Promise<{ data: Buffer; filename: string }> {
  const data = await generateReportData();

  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['BANK LEDGER REPORT'],
    ['Generated', new Date().toLocaleDateString()],
    [''],
    ['METRICS', 'VALUE'],
    ['Total Users', data.summary.totalUsers],
    ['Total Bookings', data.summary.totalBookings],
    ['Total Transactions', data.summary.totalTransactions],
    ['Total Complaints', data.summary.totalComplaints],
    [''],
    ['FINANCIAL SUMMARY', 'VALUE (GH₵)'],
    ['Total Deposits', data.summary.totalDeposits],
    ['Total Withdrawals', data.summary.totalWithdrawals],
    ['Total MoMo', data.summary.totalMomo],
    ['Net Flow', data.summary.totalDeposits + data.summary.totalMomo - data.summary.totalWithdrawals],
    [''],
    ['KYC STATUS', 'COUNT'],
    ['Pending', data.summary.pendingKyc],
    ['Verified', data.summary.verifiedKyc],
    [''],
    ['COMPLAINTS', 'COUNT'],
    ['Open', data.summary.openComplaints],
    ['Resolved', data.summary.resolvedComplaints],
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

  // Transactions sheet
  const transactionData = [
    ['ID', 'Type', 'Amount (GH₵)', 'Status', 'User', 'Date'],
    ...data.transactions.map((t) => [t.id.slice(0, 8), t.type, t.amount, t.status, t.user, t.date]),
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(transactionData), 'Transactions');

  // Bookings sheet
  const bookingData = [
    ['Code', 'Status', 'User', 'Service', 'Branch', 'Date', 'Time'],
    ...data.bookings.map((b) => [b.checkinCode, b.status, b.user, b.service, b.branch, b.date, b.time]),
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(bookingData), 'Bookings');

  // Users sheet
  const userData = [
    ['ID', 'Email', 'Name', 'Phone', 'Role', 'KYC Status', 'Date'],
    ...data.users.map((u) => [u.id.slice(0, 8), u.email, u.name, u.phone, u.role, u.kycStatus, u.date]),
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(userData), 'Users');

  // Complaints sheet
  const complaintData = [
    ['ID', 'Category', 'Status', 'User', 'Message', 'Date'],
    ...data.complaints.map((c) => [c.id.slice(0, 8), c.category, c.status, c.user, c.message?.slice(0, 100), c.date]),
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(complaintData), 'Complaints');

  // Daily Transactions sheet
  const dailyData = [
    ['Date', 'Deposits (GH₵)', 'Withdrawals (GH₵)', 'MoMo (GH₵)'],
    ...data.dailyTransactions.map((d) => [d.date, d.deposits, d.withdrawals, d.momo]),
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(dailyData), 'Daily Transactions');

  // Service Usage sheet
  const serviceData = [
    ['Service', 'Bookings'],
    ...data.serviceUsage.map((s) => [s.service, s.count]),
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(serviceData), 'Service Usage');

  // Branch Usage sheet
  const branchData = [
    ['Branch', 'Bookings'],
    ...data.branchUsage.map((b) => [b.branch, b.count]),
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(branchData), 'Branch Usage');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

  return {
    data: buffer,
    filename: `bank-ledger-${new Date().toISOString().split('T')[0]}.xlsx`,
  };
}

export async function downloadPdfReport(): Promise<{ data: Buffer; filename: string }> {
  const data = await generateReportData();

  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('TRUSTBANK LEDGER', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

  let y = 40;

  // Summary section
  doc.setFontSize(14);
  doc.text('SUMMARY', 14, y);
  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Total Users', data.summary.totalUsers.toString()],
      ['Total Bookings', data.summary.totalBookings.toString()],
      ['Total Transactions', data.summary.totalTransactions.toString()],
      ['Total Complaints', data.summary.totalComplaints.toString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 30, 64] },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Financial Summary
  doc.setFontSize(14);
  doc.text('FINANCIAL SUMMARY (GH₵)', 14, y);
  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Type', 'Amount']],
    body: [
      ['Total Deposits', data.summary.totalDeposits.toLocaleString()],
      ['Total Withdrawals', data.summary.totalWithdrawals.toLocaleString()],
      ['Total MoMo', data.summary.totalMomo.toLocaleString()],
      ['Net Flow', (data.summary.totalDeposits + data.summary.totalMomo - data.summary.totalWithdrawals).toLocaleString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 30, 64] },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // KYC Status
  doc.setFontSize(14);
  doc.text('KYC STATUS', 14, y);
  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Status', 'Count']],
    body: [
      ['Pending', data.summary.pendingKyc.toString()],
      ['Verified', data.summary.verifiedKyc.toString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 30, 64] },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Complaints
  doc.setFontSize(14);
  doc.text('COMPLAINTS', 14, y);
  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Status', 'Count']],
    body: [
      ['Open', data.summary.openComplaints.toString()],
      ['Resolved', data.summary.resolvedComplaints.toString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 30, 64] },
  });

  // New page for transactions
  doc.addPage();
  y = 20;

  // Recent Transactions
  doc.setFontSize(14);
  doc.text('RECENT TRANSACTIONS', 14, y);
  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Type', 'User', 'Amount', 'Status', 'Date']],
    body: data.transactions.slice(0, 30).map((t) => [t.type, t.user?.slice(0, 20) || 'N/A', `GH₵${t.amount}`, t.status, t.date]),
    theme: 'striped',
    headStyles: { fillColor: [0, 30, 64] },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Recent Bookings
  doc.setFontSize(14);
  doc.text('RECENT BOOKINGS', 14, y);
  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Code', 'User', 'Service', 'Status']],
    body: data.bookings.slice(0, 20).map((b) => [b.checkinCode, b.user?.slice(0, 20) || 'N/A', b.service?.slice(0, 20) || 'N/A', b.status]),
    theme: 'striped',
    headStyles: { fillColor: [0, 30, 64] },
  });

  // New page for usage stats
  doc.addPage();
  y = 20;

  // Service Usage
  doc.setFontSize(14);
  doc.text('SERVICE USAGE', 14, y);
  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Service', 'Bookings']],
    body: data.serviceUsage.map((s) => [s.service, s.count.toString()]),
    theme: 'striped',
    headStyles: { fillColor: [0, 30, 64] },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Branch Usage
  doc.setFontSize(14);
  doc.text('BRANCH USAGE', 14, y);
  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Branch', 'Bookings']],
    body: data.branchUsage.map((b) => [b.branch, b.count.toString()]),
    theme: 'striped',
    headStyles: { fillColor: [0, 30, 64] },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Daily Transactions
  doc.setFontSize(14);
  doc.text('DAILY TRANSACTIONS (LAST 30 DAYS)', 14, y);
  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Date', 'Deposits', 'Withdrawals', 'MoMo']],
    body: data.dailyTransactions.slice(-15).map((d) => [d.date, d.deposits.toString(), d.withdrawals.toString(), d.momo.toString()]),
    theme: 'striped',
    headStyles: { fillColor: [0, 30, 64] },
  });

  // Footer
  doc.setFontSize(10);
  doc.text('--- END OF REPORT ---', 105, 285, { align: 'center' });

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return {
    data: pdfBuffer,
    filename: `bank-ledger-${new Date().toISOString().split('T')[0]}.pdf`,
  };
}