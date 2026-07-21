import { NextRequest, NextResponse } from 'next/server';
import { activityService } from '@/lib/firestore-admin';
import { isAdminUser, requireActiveMember } from '@/lib/authz';
import { parsePagination } from '@/lib/pagination';
import { ActivityQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireActiveMember(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePagination(null, searchParams.get('limit'));
    const query: ActivityQuery = {
      cursor: searchParams.get('cursor') || undefined,
      ...pagination,
    };

    if (!isAdminUser(auth.user)) query.userId = auth.user.uid;
    const activities = await activityService.getRecent(query);
    
    return NextResponse.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}