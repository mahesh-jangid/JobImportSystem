import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/config/database';
import JobImportService from '@/server/services/JobImportService';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const stats = await JobImportService.getImportStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching import stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
