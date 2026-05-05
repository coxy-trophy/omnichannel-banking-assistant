import { NextResponse } from 'next/server';
import { downloadExcelReport } from '@/lib/reportActions';

export async function GET() {
  try {
    const { data, filename } = await downloadExcelReport();

    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Excel report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}