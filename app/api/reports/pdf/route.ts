import { NextResponse } from 'next/server';
import { downloadPdfReport } from '@/lib/reportActions';

export async function GET() {
  try {
    const { data, filename } = await downloadPdfReport();

    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}