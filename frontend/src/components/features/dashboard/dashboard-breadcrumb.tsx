'use client';

import { usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { getJobById } from '@/lib/jobs-api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link } from '@/i18n/routing';
import { Loader2 } from 'lucide-react';

export function DashboardBreadcrumb() {
  const t = useTranslations('Sidebar');
  const commonT = useTranslations('Common');
  const pathname = usePathname();
  const params = useParams();
  const jobId = params.id as string | undefined;

  const { data: job, isLoading } = useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => getJobById(jobId!),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
  });

  const isJobs = pathname.startsWith('/dashboard/jobs');
  const isOverview = pathname === '/dashboard';

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className='hidden md:block'>
          <BreadcrumbLink asChild>
            <Link
              href='/dashboard'
              className='text-muted-foreground hover:text-white'
            >
              {commonT('dashboard')}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className='hidden md:block text-muted-foreground/50' />

        {isOverview && (
          <BreadcrumbItem>
            <BreadcrumbPage className='font-medium text-white'>
              {t('overview')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}

        {isJobs && (
          <>
            <BreadcrumbItem className='hidden md:block'>
              {jobId ? (
                <BreadcrumbLink asChild>
                  <Link
                    href='/dashboard/jobs'
                    className='text-muted-foreground hover:text-white'
                  >
                    {t('jobs')}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className='font-medium text-white'>
                  {t('jobs')}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {jobId && (
              <>
                <BreadcrumbSeparator className='hidden md:block text-muted-foreground/50' />
                <BreadcrumbItem>
                  <BreadcrumbPage className='font-medium text-white'>
                    {isLoading ? (
                      <span className='flex items-center gap-2'>
                        <Loader2 className='h-3 w-3 animate-spin' />
                      </span>
                    ) : (
                      job?.title || t('info.jobDetails')
                    )}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </>
        )}

        {/* Fallback for other routes */}
        {!isOverview && !isJobs && (
          <BreadcrumbItem>
            <BreadcrumbPage className='font-medium text-white capitalize'>
              {pathname.split('/').pop()?.replace('-', ' ') || 'Page'}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
