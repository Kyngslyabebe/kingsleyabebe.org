'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import { Suspense } from 'react';
import LoginPageContent from './LoginPageContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0A1929 0%, #1A2F42 100%)' }}>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}