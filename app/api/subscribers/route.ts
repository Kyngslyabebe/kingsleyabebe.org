import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authClient = createSupabaseRouteClient(request);
    const { data: { user }, error } = await authClient.auth.getUser();
    return !error && !!user;
  } catch {
    return false;
  }
}

// GET - List all subscribers (admin only)
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('blog_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ subscribers: data || [] });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load subscribers' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a subscriber (admin only)
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid subscriber id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blog_subscribers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle subscriber status (admin only)
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });
    }
    if (!status || !['active', 'inactive'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blog_subscribers')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}
