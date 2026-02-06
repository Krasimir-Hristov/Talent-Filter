'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/i18n/routing';
import {
  Plus,
  Loader2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getJobs } from '@/lib/jobs-api';

export default function JobsListPage() {
  const t = useTranslations('Dashboard');

  const {
    data: jobs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className='flex flex-col gap-8 max-w-4xl'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-white mb-1'>
            All Jobs
          </h1>
          <p className='text-muted-foreground'>
            Manage all your job positions and interview questions
          </p>
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

      {/* Jobs List */}
      <div className='space-y-3'>
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className='h-20 rounded-xl bg-white/5 animate-pulse border border-white/10'
              />
            ))}
          </div>
        ) : error ? (
          <div className='py-12 flex flex-col items-center justify-center border border-red-500/20 rounded-2xl bg-red-500/5 text-red-400 gap-3'>
            <AlertCircle className='size-8 opacity-50' />
            <p>{(error as Error).message || 'Failed to load jobs'}</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className='group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-accent/50 hover:bg-white/8 transition-all'
            >
              <div className='flex items-center gap-4'>
                <div className='size-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent'>
                  <Briefcase className='size-5' />
                </div>
                <div>
                  <div className='flex items-center gap-3'>
                    <h3 className='font-semibold text-white group-hover:text-brand-accent transition-colors'>
                      {job.title}
                    </h3>
                    <span
                      className='inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize'
                      style={{
                        backgroundColor:
                          job.status === 'active'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color:
                          job.status === 'active'
                            ? 'rgb(52, 211, 153)'
                            : 'rgb(248, 113, 113)',
                      }}
                    >
                      {t(`status.${job.status}`)}
                    </span>
                  </div>
                  <div className='flex items-center gap-4 mt-1 text-sm text-slate-400'>
                    <span className='flex items-center gap-1.5'>
                      <Calendar className='size-3' />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <Sparkles className='size-3' />
                      {job.questions?.length ?? 0} questions
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className='size-5 text-slate-500 group-hover:text-brand-accent transition-colors' />
            </Link>
          ))
        ) : (
          <div className='py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/2'>
            <Briefcase className='size-12 text-slate-500 mb-4' />
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
    </div>
  );
}
