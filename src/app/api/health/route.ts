import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'LeetCode CF Tracker API is running',
    timestamp: new Date().toISOString()
  });
}
