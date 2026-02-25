import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitize(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function getSubscriberWelcomeEmail(email: string, unsubscribeToken: string): string {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kingsleyabebe.org'}/api/unsubscribe?token=${unsubscribeToken}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Kingsley's Blog</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#0A1929;">
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:40px 20px;">
            <table role="presentation" style="max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.5);border:1px solid rgba(74,144,226,0.15);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0A1929 0%,#0d2137 50%,#0A1929 100%);padding:50px 40px 40px;text-align:center;position:relative;">
                  <!-- Glow accent -->
                  <div style="width:80px;height:80px;background:linear-gradient(135deg,#4A90E2,#667eea);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(74,144,226,0.4);">
                    <span style="font-size:36px;line-height:1;">✦</span>
                  </div>
                  <h1 style="margin:0 0 10px;color:#FFFFFF;font-size:32px;font-weight:700;letter-spacing:-0.5px;font-family:'Outfit',sans-serif;">
                    You're In!
                  </h1>
                  <p style="margin:0;color:#A0AEC0;font-size:16px;line-height:1.5;">
                    Welcome to Kingsley's blog
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="background:#0f2035;padding:40px;">

                  <p style="margin:0 0 20px;font-size:16px;color:#E2E8F0;line-height:1.7;">
                    Hey there! 👋
                  </p>

                  <p style="margin:0 0 24px;font-size:15px;color:#A0AEC0;line-height:1.8;">
                    You've just subscribed to my blog — and I'm genuinely thrilled to have you here.
                    Whether you're here for tech, lifestyle, or just good writing — you're in the right place.
                  </p>

                  <!-- Highlight Box -->
                  <div style="background:linear-gradient(135deg,rgba(74,144,226,0.08),rgba(102,126,234,0.08));border:1px solid rgba(74,144,226,0.2);border-radius:12px;padding:28px;margin:28px 0;">
                    <p style="margin:0 0 16px;color:#4A90E2;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                      What you'll get
                    </p>
                    <table role="presentation" style="width:100%;">
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#48BB78;margin-right:12px;">→</span>
                          <span style="color:#E2E8F0;font-size:14px;">Tech deep-dives, tutorials & engineering breakdowns</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#48BB78;margin-right:12px;">→</span>
                          <span style="color:#E2E8F0;font-size:14px;">Lifestyle, perspectives & things worth thinking about</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#48BB78;margin-right:12px;">→</span>
                          <span style="color:#E2E8F0;font-size:14px;">Real-world project breakdowns & behind-the-scenes</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#48BB78;margin-right:12px;">→</span>
                          <span style="color:#E2E8F0;font-size:14px;">First access to every new post, right in your inbox</span>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <p style="margin:0 0 32px;font-size:15px;color:#A0AEC0;line-height:1.8;">
                    I write when I have something genuinely worth sharing — so no noise, no spam.
                    Just quality content, delivered with care.
                  </p>

                  <!-- CTA -->
                  <div style="text-align:center;margin:32px 0;">
                    <a href="https://www.kingsleyabebe.org/blogs"
                       style="display:inline-block;background:linear-gradient(135deg,#4A90E2,#667eea);color:#FFFFFF;padding:16px 40px;text-decoration:none;border-radius:50px;font-weight:700;font-size:15px;letter-spacing:0.3px;box-shadow:0 8px 32px rgba(74,144,226,0.35);">
                      Explore the Blog →
                    </a>
                  </div>

                  <p style="margin:32px 0 0;font-size:15px;color:#E2E8F0;line-height:1.7;">
                    Looking forward to sharing great content with you,<br>
                    <strong style="color:#FFFFFF;">Kingsley Abebe</strong><br>
                    <span style="color:#4A90E2;font-size:13px;">Full-Stack Software Engineer</span>
                  </p>

                </td>
              </tr>

              <!-- Social Connect -->
              <tr>
                <td style="background:#0d1f30;padding:28px 40px;">
                  <table role="presentation" style="width:100%;">
                    <tr>
                      <td style="text-align:center;">
                        <p style="margin:0 0 16px;color:#718096;font-size:13px;">Connect with me</p>
                        <a href="https://github.com/kingsleyabebe" style="display:inline-block;margin:0 8px;color:#A0AEC0;text-decoration:none;font-size:13px;padding:8px 16px;border:1px solid rgba(74,144,226,0.2);border-radius:20px;">GitHub</a>
                        <a href="https://linkedin.com/in/kingsleyabebe" style="display:inline-block;margin:0 8px;color:#A0AEC0;text-decoration:none;font-size:13px;padding:8px 16px;border:1px solid rgba(74,144,226,0.2);border-radius:20px;">LinkedIn</a>
                        <a href="https://www.kingsleyabebe.org" style="display:inline-block;margin:0 8px;color:#A0AEC0;text-decoration:none;font-size:13px;padding:8px 16px;border:1px solid rgba(74,144,226,0.2);border-radius:20px;">Portfolio</a>
                      </td>
                    </tr>
                  </table>
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

function getOwnerNewSubscriberEmail(subscriberEmail: string, totalSubscribers: number): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Blog Subscriber</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f7fa;">
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:40px 20px;">
            <table role="presentation" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0A1929 0%,#1A2F42 100%);padding:40px 30px;text-align:center;">
                  <div style="width:64px;height:64px;background:linear-gradient(135deg,#4A90E2,#667eea);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(74,144,226,0.4);">
                    <span style="font-size:28px;">🎉</span>
                  </div>
                  <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">
                    New Subscriber!
                  </h1>
                  <p style="margin:8px 0 0;color:#A0AEC0;font-size:14px;">
                    Your blog audience is growing
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding:40px 30px;">

                  <div style="background:#EBF8FF;border-left:4px solid #4A90E2;padding:16px 20px;margin-bottom:28px;border-radius:4px;">
                    <p style="margin:0;color:#2C5282;font-size:14px;font-weight:600;">
                      🔔 Someone just subscribed to your blog notifications
                    </p>
                  </div>

                  <div style="background:#F7FAFC;border-radius:10px;padding:24px;margin-bottom:24px;border:1px solid #E2E8F0;">
                    <p style="margin:0 0 6px;font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Subscriber Email</p>
                    <p style="margin:0;font-size:18px;font-weight:600;color:#4A90E2;">
                      <a href="mailto:${sanitize(subscriberEmail)}" style="color:#4A90E2;text-decoration:none;">${sanitize(subscriberEmail)}</a>
                    </p>
                  </div>

                  <div style="background:linear-gradient(135deg,rgba(74,144,226,0.05),rgba(102,126,234,0.05));border:1px solid rgba(74,144,226,0.15);border-radius:10px;padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:13px;color:#718096;">Total Subscribers</p>
                    <p style="margin:0;font-size:36px;font-weight:700;color:#4A90E2;">${totalSubscribers}</p>
                  </div>

                  <p style="margin:28px 0 0;font-size:14px;color:#4A5568;line-height:1.7;">
                    Head to your admin panel to manage subscribers and send notifications when you publish new posts.
                  </p>

                  <div style="margin-top:20px;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kingsleyabebe.org'}/admin/subscribers"
                       style="display:inline-block;background:#4A90E2;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                      View Subscribers →
                    </a>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#F7FAFC;padding:20px 30px;border-top:1px solid #E2E8F0;">
                  <p style="margin:0;color:#718096;font-size:12px;text-align:center;">
                    Sent from your portfolio at <strong>kingsleyabebe.org</strong><br>
                    <span style="color:#A0AEC0;">${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
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
    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('blog_subscribers')
      .select('id, status')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'This email is already subscribed!' }, { status: 409 });
      }
      // Reactivate if previously unsubscribed
      await supabase
        .from('blog_subscribers')
        .update({ status: 'active', subscribed_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from('blog_subscribers')
        .insert([{ email: normalizedEmail, status: 'active' }]);

      if (insertError) {
        console.error('DB insert error:', insertError);
        return NextResponse.json({ error: 'Failed to save subscription. Please try again.' }, { status: 500 });
      }
    }

    // Get total subscriber count
    const { count: totalCount } = await supabase
      .from('blog_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get unsubscribe token
    const { data: subData } = await supabase
      .from('blog_subscribers')
      .select('unsubscribe_token')
      .eq('email', normalizedEmail)
      .maybeSingle();

    const unsubscribeToken = subData?.unsubscribe_token || '';

    // Send emails
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email credentials not configured');
      return NextResponse.json({ success: true, message: 'Subscribed successfully!' }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await Promise.allSettled([
      // Welcome email to subscriber
      transporter.sendMail({
        from: `"Kingsley Abebe" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: '✦ Welcome to my blog — you\'re subscribed!',
        html: getSubscriberWelcomeEmail(normalizedEmail, unsubscribeToken),
      }),
      // Notification to owner
      transporter.sendMail({
        from: `"Blog Notifications" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `🎉 New blog subscriber: ${normalizedEmail}`,
        html: getOwnerNewSubscriberEmail(normalizedEmail, totalCount || 1),
      }),
    ]);

    return NextResponse.json({ success: true, message: 'You\'re now subscribed!' }, { status: 200 });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
