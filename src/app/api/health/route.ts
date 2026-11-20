import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { error } = await supabaseAdmin
      .from('guests')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { status: 'error', database: 'disconnected', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', database: 'disconnected', details: (err as Error).message },
      { status: 500 }
    );
  }
}
