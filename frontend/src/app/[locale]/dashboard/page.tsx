'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/i18n/routing';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getJobs } from '@/lib/jobs-api';
import { JobCard } from '@/components/features/dashboard/job-card';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');

  const {
    data: jobs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
    // Keep data fresh but don't over-fetch
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className='flex flex-col gap-8'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-white mb-1'>
            {t('title')}
          </h1>
          <p className='text-muted-foreground'>{t('welcome')}</p>
        </div>
        <Button
          asChild
          className='bg-brand-accent hover:bg-brand-accent/90 text-white gap-2 shadow-lg shadow-brand-accent/20'
        >
          <Link href='/dashboard/jobs/new'>
            <Plus className='size-4' />
            {t('newJob')}
          </Link>
        </Button>
      </div>

      {/* Active Jobs Section */}
      <div className='grid gap-6'>
        <h2 className='text-xl font-semibold text-white/90 flex items-center gap-2'>
          {t('activeJobs')}
          {jobs && jobs.length > 0 && (
            <span className='text-sm bg-white/5 px-2 py-0.5 rounded-full text-brand-accent border border-white/10'>
              {jobs.length}
            </span>
          )}
        </h2>

        {isLoading ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='h-[200px] rounded-2xl bg-white/5 animate-pulse border border-white/10'
              />
            ))}
          </div>
        ) : error ? (
          <div className='py-12 flex flex-col items-center justify-center border border-red-500/20 rounded-2xl bg-red-500/5 text-red-400 gap-3'>
            <AlertCircle className='size-8 opacity-50' />
            <p>{(error as Error).message || t('errorLoadingJobs')}</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {jobs.slice(0, 3).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {jobs.length > 3 && (
              <div className='flex justify-center mt-4'>
                <Button
                  asChild
                  variant='outline'
                  className='border-white/10 hover:bg-white/5'
                >
                  <Link href='/dashboard/jobs'>
                    {t('viewAllJobs', { count: jobs.length })}
                  </Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className='py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/2'>
            <p className='text-slate-400 mb-4'>{t('noJobs')}</p>
            <Button
              variant='outline'
              asChild
              className='border-white/10 hover:bg-white/5'
            >
              <Link href='/dashboard/jobs/new' className='gap-2'>
                <Plus className='size-4' />
                {t('newJob')}
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats/Extra Section (Placeholder for now) */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <div className='col-span-4 h-[300px] rounded-xl border border-white/5 bg-white/2 backdrop-blur-sm' />
        <div className='col-span-3 h-[300px] rounded-xl border border-white/5 bg-white/2 backdrop-blur-sm' />
      </div>
    </div>
  );
}
