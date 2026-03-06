import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all subscribers (admin)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('blog_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ subscribers: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load subscribers' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a subscriber
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing subscriber id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blog_subscribers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle subscriber status
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blog_subscribers')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}
