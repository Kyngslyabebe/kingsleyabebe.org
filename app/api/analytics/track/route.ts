import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidOrigin } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    if (!isValidOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { sessionId } = await request.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    // Increment daily page view count
    await supabase.rpc('increment_page_view');

    // Upsert active visitor heartbeat
    await supabase
      .from('active_visitors')
      .upsert(
        { session_id: sessionId, last_seen: new Date().toISOString() },
        { onConflict: 'session_id' }
      );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
