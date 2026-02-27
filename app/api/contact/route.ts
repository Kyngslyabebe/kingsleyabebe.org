import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limiting store (in production, use Redis or a proper solution)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 }); // 1 hour
    return true;
  }

  if (limit.count >= 5) { // Max 5 emails per hour
    return false;
  }

  limit.count++;
  return true;
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input to prevent XSS
function sanitizeInput(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Professional email template for owner notification
function getOwnerEmailTemplate(name: string, email: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0A1929 0%, #1A2F42 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                    New Contact Message
                  </h1>
                  <p style="margin: 8px 0 0 0; color: #A0AEC0; font-size: 14px;">
                    Someone reached out through your portfolio
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <!-- Alert Box -->
                  <div style="background: #EBF8FF; border-left: 4px solid #4A90E2; padding: 16px 20px; margin-bottom: 30px; border-radius: 4px;">
                    <p style="margin: 0; color: #2C5282; font-size: 14px; font-weight: 600;">
                      ⚡ Action Required: New contact form submission
                    </p>
                  </div>

                  <!-- Contact Details Card -->
                  <div style="background: #F7FAFC; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            Name
                          </p>
                          <p style="margin: 4px 0 0 0; font-size: 16px; color: #1A202C; font-weight: 500;">
                            ${sanitizeInput(name)}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 8px 0;">
                          <p style="margin: 0; font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            Email Address
                          </p>
                          <p style="margin: 4px 0 0 0;">
                            <a href="mailto:${email}" style="font-size: 16px; color: #4A90E2; text-decoration: none; font-weight: 500;">
                              ${sanitizeInput(email)}
                            </a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Message Card -->
                  <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Message
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #2D3748; line-height: 1.6; white-space: pre-wrap;">
                      ${sanitizeInput(message)}
                    </p>
                  </div>

                  <!-- Quick Actions -->
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="padding: 12px 0;">
                        <a href="mailto:${email}?subject=Re: Your inquiry on kingsleyabebe.org" 
                           style="display: inline-block; background: #4A90E2; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);">
                          📧 Reply to ${sanitizeInput(name.split(' ')[0])}
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #F7FAFC; padding: 24px 30px; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0; color: #718096; font-size: 12px; text-align: center; line-height: 1.5;">
                    Sent from your portfolio at <strong>kingsleyabebe.org</strong><br>
                    <span style="color: #A0AEC0;">${new Date().toLocaleString('en-US', { 
                      dateStyle: 'full', 
                      timeStyle: 'short' 
                    })}</span>
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

// Professional email template for sender confirmation
function getSenderEmailTemplate(name: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Reaching Out</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0A1929 0%, #1A2F42 100%); padding: 40px 30px; text-align: center;">
                  <div style="width: 60px; height: 60px; background: rgba(74, 144, 226, 0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; border: 2px solid #4A90E2;">
                    <span style="font-size: 28px;">✓</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                    Message Received!
                  </h1>
                  <p style="margin: 8px 0 0 0; color: #A0AEC0; font-size: 14px;">
                    Thank you for reaching out
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #2D3748; line-height: 1.6;">
                    Hi <strong>${sanitizeInput(name.split(' ')[0])}</strong>,
                  </p>

                  <p style="margin: 0 0 24px 0; font-size: 15px; color: #4A5568; line-height: 1.7;">
                    Thank you for contacting me! I've received your message and will get back to you as soon as possible. I typically respond within 24-48 hours.
                  </p>

                  <!-- Message Copy -->
                  <div style="background: #F7FAFC; border-left: 4px solid #4A90E2; padding: 20px; border-radius: 4px; margin: 24px 0;">
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Your Message
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #2D3748; line-height: 1.6; white-space: pre-wrap;">
                      ${sanitizeInput(message)}
                    </p>
                  </div>

                  <!-- Info Box -->
                  <div style="background: #EBF8FF; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0 0 12px 0; color: #2C5282; font-size: 14px; font-weight: 600;">
                      💡 What happens next?
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #2D3748; font-size: 14px; line-height: 1.7;">
                      <li>I'll review your message carefully</li>
                      <li>You'll hear back from me within 24-48 hours</li>
                      <li>We can schedule a call if needed</li>
                    </ul>
                  </div>

                  <p style="margin: 24px 0 0 0; font-size: 15px; color: #4A5568; line-height: 1.7;">
                    Best regards,<br>
                    <strong style="color: #2D3748;">Kingsley Abebe</strong><br>
                    <span style="color: #718096; font-size: 14px;">RF & Software Engineer</span>
                  </p>

                </td>
              </tr>

              <!-- Contact Info Card -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 24px; text-align: center;">
                    <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                      Let's Connect
                    </p>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="text-align: center; padding: 4px 0;">
                          <a href="mailto:kingsleyabebe@hotmail.com" style="color: #ffffff; text-decoration: none; font-size: 14px;">
                            📧 kingsleyabebe@hotmail.com
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align: center; padding: 4px 0;">
                          <a href="tel:+13016740120" style="color: #ffffff; text-decoration: none; font-size: 14px;">
                            📱 301-674-0120
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align: center; padding: 4px 0;">
                          <a href="https://www.kingsleyabebe.org" style="color: #ffffff; text-decoration: none; font-size: 14px;">
                            🌐 kingsleyabebe.org
                          </a>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top: 16px;">
                      <a href="https://github.com/kingsleyabebe" style="display: inline-block; margin: 0 8px; color: #ffffff; text-decoration: none; font-size: 20px;">
                        GitHub
                      </a>
                      <a href="https://linkedin.com/in/kingsleyabebe" style="display: inline-block; margin: 0 8px; color: #ffffff; text-decoration: none; font-size: 20px;">
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #F7FAFC; padding: 20px 30px; border-top: 1px solid #E2E8F0; text-align: center;">
                  <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px;">
                    This is an automated confirmation email.
                  </p>
                  <p style="margin: 0; color: #A0AEC0; font-size: 11px;">
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
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { name, email, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 5000 characters' },
        { status: 400 }
      );
    }

  // ✅ SAVE TO DATABASE FIRST
    console.log('🔍 Attempting to save to database...');
    console.log('📊 Data to insert:', { name, email, message });
    
    const { data: dbData, error: dbError } = await supabase
      .from('contact_messages')
      .insert([{
        name,
        email,
        message,
        status: 'new'
      }])
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      console.error('❌ Full error:', JSON.stringify(dbError, null, 2));
    } else {
      console.log('✅ Message saved to database:', dbData);
    }

    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email credentials not configured');
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Email to owner
    const mailToOwner = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `🚀 New Portfolio Contact: ${name}`,
      html: getOwnerEmailTemplate(name, email, message),
    };

    // Email to sender
    const mailToSender = {
      from: `"Kingsley Abebe" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thanks for reaching out! 🎉',
      html: getSenderEmailTemplate(name, message),
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(mailToOwner),
      transporter.sendMail(mailToSender),
    ]);

    // Log success
    console.log(`✅ Contact form submission from ${name} (${email})`);
    console.log(`✅ Emails sent successfully`);

    return NextResponse.json(
      { 
        message: 'Message sent successfully! Check your email for confirmation.',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    // Log error details
    console.error('❌ Error:', error);

    // Determine error message
    let errorMessage = 'Failed to send message. Please try again later.';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Email service authentication failed';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: 500 }
    );
  }
}