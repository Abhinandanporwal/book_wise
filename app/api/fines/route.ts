// app/api/fines/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/prisma' // Make sure to import your db client

// Handle GET requests
export async function GET() {
  try {
    // Fetch fines from the database
    const fines = await db.fine.findMany({
      include: {
        user: true, // Include related user data
      },
    })
    
    return NextResponse.json(fines)
  } catch (error) {
    console.error('Error fetching fines:', error)
    return NextResponse.json({ error: 'Failed to fetch fines' }, { status: 500 })
  }
}
