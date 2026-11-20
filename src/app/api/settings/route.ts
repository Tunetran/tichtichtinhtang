import { NextResponse } from 'next/server';
import { getEventConfig } from '@/lib/event-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getEventConfig();
  return NextResponse.json(config);
}
