'use client';

import { Link } from '@/i18n/routing';
import { Calendar, Users, ChevronRight } from 'lucide-react';
import { Job } from '@/types/job';

import { Badge } from '@/components/ui/badge';
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
  return (
    <Card className='bg-white/5 border-white/10 hover:border-brand-accent/50 transition-all duration-300 group overflow-hidden relative'>
      <div className='absolute inset-0 bg-linear-to-tr from-brand-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />

      <CardHeader className='pb-3 relative z-10'>
        <div className='flex justify-between items-start gap-4'>
          <CardTitle className='text-lg font-semibold text-white group-hover:text-brand-accent transition-colors line-clamp-1'>
            {job.title}
          </CardTitle>
          <Badge
            variant={job.status === 'published' ? 'default' : 'secondary'}
            className='capitalize bg-brand-accent/20 text-brand-accent-foreground hover:bg-brand-accent/30 border-0'
          >
            {job.status}
          </Badge>
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
            <Users className='size-3.5' />
            <span>0 Candidates</span>
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
            View Details
            <ChevronRight className='size-4 text-slate-500 group-hover/btn:text-brand-accent group-hover/btn:translate-x-1 transition-all' />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
