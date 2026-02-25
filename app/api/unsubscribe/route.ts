import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(getHtmlPage('Invalid Link', 'The unsubscribe link is missing or invalid.', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const { data, error } = await supabase
    .from('blog_subscribers')
    .update({ status: 'unsubscribed' })
    .eq('unsubscribe_token', token)
    .eq('status', 'active')
    .select()
    .maybeSingle();

  if (error || !data) {
    return new NextResponse(getHtmlPage('Already Unsubscribed', 'You have already been unsubscribed, or this link has expired.', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new NextResponse(getHtmlPage('Unsubscribed', 'You have been successfully unsubscribed from blog notifications.', true), {
    headers: { 'Content-Type': 'text/html' },
  });
}

function getHtmlPage(title: string, message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Kingsley Abebe</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0A1929; color: #E2E8F0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { max-width: 480px; width: 100%; background: #0f2035; border: 1px solid rgba(74,144,226,0.15); border-radius: 16px; padding: 48px 40px; text-align: center; }
    .icon { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: ${success ? 'rgba(72,187,120,0.15)' : 'rgba(74,144,226,0.1)'}; border: 2px solid ${success ? '#48BB78' : 'rgba(74,144,226,0.3)'}; }
    h1 { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 12px; }
    p { color: #A0AEC0; font-size: 15px; line-height: 1.7; margin-bottom: 28px; }
    a { display: inline-block; background: linear-gradient(135deg, #4A90E2, #667eea); color: #fff; padding: 12px 28px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✓' : 'ℹ'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://www.kingsleyabebe.org/blogs">Browse the Blog</a>
  </div>
</body>
</html>`;
}
