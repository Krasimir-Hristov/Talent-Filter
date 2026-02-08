'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedHandler() {
  const router = useRouter();

  useEffect(() => {
    // Basic redirect
    router.push('/login');
  }, [router]);

  return null;
}
