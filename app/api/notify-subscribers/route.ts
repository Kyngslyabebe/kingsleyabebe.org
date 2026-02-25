import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sanitize(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function getBlogNotificationEmail(
  postTitle: string,
  postExcerpt: string,
  postSlug: string,
  unsubscribeToken: string
): string {
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kingsleyabebe.org'}/blogs/${postSlug}`;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kingsleyabebe.org'}/api/unsubscribe?token=${unsubscribeToken}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Post: ${sanitize(postTitle)}</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#0A1929;">
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:40px 20px;">
            <table role="presentation" style="max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.5);border:1px solid rgba(74,144,226,0.15);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0A1929 0%,#0d2137 50%,#0A1929 100%);padding:44px 40px;text-align:center;">
                  <p style="margin:0 0 16px;color:#4A90E2;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">New Post from Kingsley</p>
                  <h1 style="margin:0;color:#FFFFFF;font-size:28px;font-weight:700;line-height:1.3;letter-spacing:-0.5px;">
                    ${sanitize(postTitle)}
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="background:#0f2035;padding:40px;">

                  <!-- Divider accent -->
                  <div style="width:48px;height:3px;background:linear-gradient(90deg,#4A90E2,#667eea);border-radius:2px;margin:0 0 28px;"></div>

                  ${postExcerpt ? `
                  <p style="margin:0 0 32px;font-size:16px;color:#A0AEC0;line-height:1.8;">
                    ${sanitize(postExcerpt)}
                  </p>
                  ` : `
                  <p style="margin:0 0 32px;font-size:16px;color:#A0AEC0;line-height:1.8;">
                    I just published a new article. Click below to read it — I think you'll enjoy this one.
                  </p>
                  `}

                  <!-- CTA -->
                  <div style="text-align:center;margin:8px 0 36px;">
                    <a href="${postUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#4A90E2,#667eea);color:#FFFFFF;padding:18px 48px;text-decoration:none;border-radius:50px;font-weight:700;font-size:16px;letter-spacing:0.3px;box-shadow:0 8px 32px rgba(74,144,226,0.35);">
                      Read the Full Post →
                    </a>
                  </div>

                  <div style="border-top:1px solid rgba(74,144,226,0.1);padding-top:28px;margin-top:8px;">
                    <p style="margin:0 0 4px;font-size:15px;color:#E2E8F0;">
                      <strong>Kingsley Abebe</strong>
                    </p>
                    <p style="margin:0;font-size:13px;color:#4A90E2;">Full-Stack Software Engineer</p>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#0A1929;padding:20px 40px;border-top:1px solid rgba(74,144,226,0.1);">
                  <p style="margin:0;color:#4A5568;font-size:11px;text-align:center;line-height:1.6;">
                    You're receiving this because you subscribed at <strong style="color:#718096;">kingsleyabebe.org</strong><br>
                    <a href="${unsubscribeUrl}" style="color:#4A5568;text-decoration:underline;">Unsubscribe</a> ·
                    © ${new Date().getFullYear()} Kingsley Abebe. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    // Verify caller is authenticated admin — check referer or a shared notify secret
    const authHeader = request.headers.get('authorization');
    const referer = request.headers.get('referer') || '';
    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || '';

    // Allow if request comes from same origin (admin UI) OR has valid secret
    const validSecret = process.env.NOTIFY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasValidSecret = authHeader === `Bearer ${validSecret}`;
    const hasValidReferer = referer.includes('/admin');

    if (!hasValidSecret && !hasValidReferer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postTitle, postExcerpt, postSlug } = body;

    if (!postTitle || !postSlug) {
      return NextResponse.json({ error: 'postTitle and postSlug are required.' }, { status: 400 });
    }

    // Fetch all active subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('blog_subscribers')
      .select('email, unsubscribe_token')
      .eq('status', 'active');

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch subscribers.' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No active subscribers.' }, { status: 200 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json({ error: 'Email credentials not configured.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    let sentCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(sub =>
          transporter.sendMail({
            from: `"Kingsley Abebe" <${process.env.EMAIL_USER}>`,
            to: sub.email,
            subject: `✦ New post: ${postTitle}`,
            html: getBlogNotificationEmail(postTitle, postExcerpt || '', postSlug, sub.unsubscribe_token || ''),
          })
        )
      );
      sentCount += batch.length;
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      message: `Notification sent to ${sentCount} subscriber${sentCount !== 1 ? 's' : ''}.`,
    });

  } catch (error) {
    console.error('Notify subscribers error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
