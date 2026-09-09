'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// Transporter role has been merged into Processor.
// This page redirects to the processor dashboard.
export default function TransporterRedirectPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    login('processor');
    router.replace('/processor');
  }, [router, login]);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <p className="text-surface-500 text-sm">Redirecting to Processor Dashboard...</p>
    </div>
  );
}
