import { NextResponse } from 'next/server';
import { getOrganizations } from '@/lib/data';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      console.error('Firebase Admin SDK not initialized in API route');
      return NextResponse.json(
        { error: 'Service unavailable', organizations: [] },
        { status: 503 }
      );
    }

    const { organizations, error } = await getOrganizations();

    if (error) {
      // Internal detail stays in server logs; the public response is generic.
      console.error('Error fetching organizations:', error);
      return NextResponse.json(
        { error: 'Failed to load organizations', organizations: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Unexpected error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to load organizations', organizations: [] },
      { status: 500 }
    );
  }
}
