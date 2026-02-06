'use client';

import { Link } from '@/i18n/routing';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { Job } from '@/types/job';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const t = useTranslations('Dashboard');

  // Debug: Check what status we're getting
  console.log('Job status:', job.status, 'for job:', job.title);

  return (
    <Card className='bg-white/5 border-white/10 hover:border-brand-accent/50 transition-all duration-300 group overflow-hidden relative'>
      <div className='absolute inset-0 bg-linear-to-tr from-brand-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />

      <CardHeader className='pb-3 relative z-10'>
        <div className='flex justify-between items-start gap-4'>
          <CardTitle className='text-lg font-semibold text-white group-hover:text-brand-accent transition-colors line-clamp-1'>
            {job.title}
          </CardTitle>
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
      </CardHeader>

      <CardContent className='pb-3 relative z-10'>
        <div className='flex items-center gap-4 text-sm text-slate-400'>
          <div className='flex items-center gap-1.5'>
            <Calendar className='size-3.5' />
            <span>
              {new Date(job.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <Sparkles className='size-3.5' />
            <span>
              {t('questionsCount', { count: job.questions?.length ?? 0 })}
            </span>
          </div>
        </div>
        <p className='mt-3 text-sm text-slate-500 line-clamp-2 min-h-10'>
          {job.description}
        </p>
      </CardContent>

      <CardFooter className='relative z-10 pt-2'>
        <Button
          asChild
          variant='ghost'
          className='w-full justify-between text-white hover:text-brand-accent hover:bg-white/5 group/btn'
        >
          <Link href={`/dashboard/jobs/${job.id}`}>
            {t('viewDetails')}
            <ChevronRight className='size-4 text-slate-500 group-hover/btn:text-brand-accent group-hover/btn:translate-x-1 transition-all' />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
