import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // Verify admin authentication
  try {
    const authClient = createSupabaseRouteClient(request);
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Cleanup stale visitors
    await supabase.rpc('cleanup_stale_visitors');

    // Last 30 days of page views
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: pageViews } = await supabase
      .from('page_views')
      .select('date, view_count')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Active visitors (last 5 minutes)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: activeNow } = await supabase
      .from('active_visitors')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', fiveMinAgo);

    // Total subscribers
    const { count: totalSubscribers } = await supabase
      .from('blog_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total blog views
    const { data: blogs } = await supabase
      .from('blogs')
      .select('views');

    const totalBlogViews = blogs?.reduce((sum, b) => sum + (b.views || 0), 0) || 0;

    return NextResponse.json({
      pageViews: pageViews || [],
      activeNow: activeNow || 0,
      totalSubscribers: totalSubscribers || 0,
      totalBlogViews,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
