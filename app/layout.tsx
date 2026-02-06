import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '@/components/admin/Toast';
import { GoogleAnalytics } from '@/lib/analytics/GoogleAnalytics';
import { createClient } from '@supabase/supabase-js';
import './globals.css';

export const metadata = {
  title: 'Kingsley Abebe - Full Stack Developer',
  description: 'Professional portfolio showcasing web development projects and skills',
  keywords: 'Full Stack Developer, React, Node.js, Web Development, Portfolio',
  authors: [{ name: 'Kingsley Abebe' }],
  openGraph: {
    title: 'Kingsley Abebe - Full Stack Developer',
    description: 'Professional portfolio showcasing web development projects and skills',
    type: 'website',
  },
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
  )
}