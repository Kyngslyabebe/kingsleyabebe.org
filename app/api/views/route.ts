import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidOrigin } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // CSRF protection
    if (!isValidOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { blogId } = await request.json();

    if (!blogId || typeof blogId !== 'string') {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    // Atomic increment using service role
    const { data, error } = await supabase.rpc('increment_blog_views', {
      blog_id: blogId,
    });

    // Fallback if RPC doesn't exist yet
    if (error?.code === '42883') {
      const { data: blog } = await supabase
        .from('blogs')
        .select('views')
        .eq('id', blogId)
        .single();

      if (blog) {
        await supabase
          .from('blogs')
          .update({ views: (blog.views || 0) + 1 })
          .eq('id', blogId);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
  }
}
