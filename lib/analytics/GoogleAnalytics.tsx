'use client';

import Script from 'next/script';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface GoogleAnalyticsProps {
  gaId: string;
}

function GoogleAnalyticsContent({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gaId) return;

    const url = pathname + searchParams.toString();

    // Track page view
    window.gtag('config', gaId, {
      page_path: url,
    });
  }, [pathname, searchParams, gaId]);

  return null;
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsContent gaId={gaId} />
      </Suspense>
    </>
  );
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}