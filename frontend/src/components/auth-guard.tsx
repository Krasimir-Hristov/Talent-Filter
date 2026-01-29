'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      setIsReady(true);
    }
  }, [isAuthenticated, router]);

  if (!isReady) {
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-slate-950'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent'></div>
      </div>
    );
  }

  return <>{children}</>;
}
