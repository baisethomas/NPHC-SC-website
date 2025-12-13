import { NextResponse } from 'next/server';
import { getOrganizations } from '@/lib/data';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Check if Firebase Admin is initialized
    if (!adminDb) {
      console.error('Firebase Admin SDK not initialized in API route');
      return NextResponse.json(
        { 
          error: 'Firebase Admin SDK not initialized. Check server logs and environment variables.',
          organizations: [] 
        },
        { status: 500 }
      );
    }

    const { organizations, error } = await getOrganizations();
    
    if (error) {
      console.error('Error fetching organizations:', error);
      return NextResponse.json(
        { error, organizations: [] },
        { status: 500 }
      );
    }
    
    console.log(`Successfully fetched ${organizations.length} organizations`);
    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Unexpected error fetching organizations:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error', 
        organizations: [] 
      },
      { status: 500 }
    );
  }
}
