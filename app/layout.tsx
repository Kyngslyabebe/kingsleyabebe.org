import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '@/components/admin/Toast';
import { GoogleAnalytics } from '@/lib/analytics/GoogleAnalytics';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import './globals.css';

// Dynamic metadata from database
export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from('personal_info')
      .select('favicon, meta_title, meta_description, meta_keywords, og_image, name')
      .single();

    const faviconUrl = data?.favicon || '/favicon.ico';

    return {
      metadataBase: new URL('https://kingsleyabebe.org'), // ← ADDED THIS
      title: data?.meta_title || 'Kingsley Abebe - Full Stack Developer',
      description: data?.meta_description || 'Professional portfolio showcasing web development projects and skills',
      keywords: data?.meta_keywords || 'Full Stack Developer, React, Node.js, Web Development, Portfolio',
      authors: [{ name: data?.name || 'Kingsley Abebe' }],
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
      manifest: '/site.webmanifest',
      openGraph: {
        title: data?.meta_title || 'Kingsley Abebe - Full Stack Developer',
        description: data?.meta_description || 'Professional portfolio showcasing web development projects and skills',
        type: 'website',
        url: 'https://kingsleyabebe.org',
        siteName: 'Kingsley Abebe', // ← ADDED THIS
        images: data?.og_image ? [{ 
          url: data.og_image,
          width: 1200,
          height: 630,
          alt: data?.name || 'Kingsley Abebe'
        }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: data?.meta_title || 'Kingsley Abebe - Full Stack Developer',
        description: data?.meta_description || 'Professional portfolio showcasing web development projects and skills',
        creator: '@InfinitBooking', // ← ADDED THIS
        site: '@InfinitBooking', // ← ADDED THIS
        images: data?.og_image ? [data.og_image] : [],
      },
    };
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    // Fallback metadata if database fetch fails
    return {
      metadataBase: new URL('https://kingsleyabebe.org'), // ← ADDED THIS
      title: 'Kingsley Abebe - Full Stack Developer',
      description: 'Professional portfolio showcasing web development projects and skills',
      keywords: 'Full Stack Developer, React, Node.js, Web Development, Portfolio',
      authors: [{ name: 'Kingsley Abebe' }],
      icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/favicon.ico',
      },
      manifest: '/site.webmanifest',
      openGraph: {
        title: 'Kingsley Abebe - Full Stack Developer',
        description: 'Professional portfolio showcasing web development projects and skills',
        type: 'website',
        siteName: 'Kingsley Abebe', // ← ADDED THIS
      },
      twitter: {
        card: 'summary_large_image',
        creator: '@InfinitBooking', // ← ADDED THIS
        site: '@InfinitBooking', // ← ADDED THIS
      },
    };
  }
}

async function getGoogleAnalyticsId() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from('personal_info')
      .select('google_analytics_id')
      .single();

    return data?.google_analytics_id || '';
  } catch (error) {
    console.error('Failed to fetch Google Analytics ID:', error);
    return '';
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = await getGoogleAnalyticsId();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&display=swap"
          rel="stylesheet"
        />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}