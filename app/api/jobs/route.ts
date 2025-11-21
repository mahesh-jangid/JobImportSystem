import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/config/database';
import Job from '@/server/models/Job';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    // Build filter
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const jobs = await Job.find(filter)
      .sort({ postedDate: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await Job.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
