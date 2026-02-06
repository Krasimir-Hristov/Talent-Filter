'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Users,
  FileText,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getJobById } from '@/lib/jobs-api';
import { toast } from 'sonner';

export default function JobDetailsPage() {
  const t = useTranslations('Dashboard');
  const wizardT = useTranslations('JobWizard');
  const params = useParams();
  const jobId = params.id as string;
  const [copied, setCopied] = useState(false);

  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => getJobById(jobId),
    staleTime: 5 * 60 * 1000,
  });

  const copyInterviewLink = () => {
    const link = `${window.location.origin}/interview/${jobId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Interview link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className='flex flex-col gap-8 animate-pulse'>
        <div className='h-10 w-48 bg-white/5 rounded-lg' />
        <div className='h-32 bg-white/5 rounded-2xl' />
        <div className='space-y-4'>
          <div className='h-8 w-32 bg-white/5 rounded-lg' />
          <div className='grid gap-4'>
            <div className='h-24 bg-white/5 rounded-xl' />
            <div className='h-24 bg-white/5 rounded-xl' />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4'>
        <div className='size-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500'>
          <ArrowLeft className='size-8' />
        </div>
        <h2 className='text-xl font-semibold text-white'>Job not found</h2>
        <Button asChild variant='outline'>
          <Link href='/dashboard'>Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8 max-w-5xl'>
      {/* Navigation & Actions */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div className='flex items-center gap-4'>
          <Button
            asChild
            variant='ghost'
            size='icon'
            className='text-slate-400 hover:text-white hover:bg-white/5'
          >
            <Link href='/dashboard'>
              <ArrowLeft className='size-5' />
            </Link>
          </Button>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold tracking-tight text-white mb-1'>
                {job.title}
              </h1>
              <Badge className='bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/30 border-0'>
                {job.status}
              </Badge>
            </div>
            <div className='flex items-center gap-4 text-sm text-slate-400'>
              <div className='flex items-center gap-1.5'>
                <Calendar className='size-3.5' />
                <span>
                  Created on {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={copyInterviewLink}
          className='bg-brand-accent hover:bg-brand-accent/90 text-white gap-2 shadow-lg shadow-brand-accent/20 h-11 px-6 rounded-xl'
        >
          {copied ? (
            <CheckCircle2 className='size-4' />
          ) : (
            <LinkIcon className='size-4' />
          )}
          {copied ? 'Copied!' : 'Copy Interview Link'}
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Description Section */}
          <section className='space-y-4'>
            <h2 className='text-xl font-semibold text-white/90 flex items-center gap-2'>
              <FileText className='size-5 text-brand-accent' />
              Job Description
            </h2>
            <Card className='bg-white/2 border-white/5 backdrop-blur-sm overflow-hidden'>
              <CardContent className='p-6'>
                <div className='text-slate-300 leading-relaxed whitespace-pre-wrap'>
                  {job.description}
                </div>
                {job.notes && (
                  <>
                    <Separator className='my-6 bg-white/5' />
                    <div className='space-y-2'>
                      <h3 className='text-sm font-medium text-slate-400 uppercase tracking-wider'>
                        Internal Notes
                      </h3>
                      <p className='text-slate-400 italic text-sm'>
                        {job.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Questions Section */}
          <section className='space-y-4'>
            <h2 className='text-xl font-semibold text-white/90 flex items-center gap-2'>
              <Sparkles className='size-5 text-brand-accent' />
              Interview Questions
              <span className='text-sm bg-white/5 px-2 py-0.5 rounded-full text-brand-accent border border-white/10 font-medium ml-2'>
                {job.questions?.length ?? 0}
              </span>
            </h2>

            <div className='space-y-4'>
              {job.questions?.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className='bg-white/5 border-white/10 hover:border-white/20 transition-all group'>
                    <CardContent className='p-6'>
                      <div className='flex gap-4'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-center justify-between'>
                            <span className='text-brand-accent text-xs font-bold uppercase tracking-widest'>
                              Question {index + 1}
                            </span>
                            <div className='flex items-center gap-3 text-xs text-slate-500 font-medium'>
                              <div className='flex items-center gap-1.5'>
                                <Clock className='size-3' />
                                {question.time_limit}s
                              </div>
                              <div className='flex items-center gap-1.5'>
                                <span>Weight:</span>
                                <span className='text-white'>
                                  {question.weight}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className='text-white font-medium text-lg leading-snug'>
                            {question.text}
                          </p>
                          <div className='mt-4 pt-4 border-t border-white/5'>
                            <h4 className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2'>
                              Ideal Answer Criteria
                            </h4>
                            <p className='text-slate-400 text-sm leading-relaxed'>
                              {question.ideal_answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Actions/Info */}
        <div className='space-y-6'>
          {/* Candidate Stats Card */}
          <Card className='bg-linear-to-br from-brand-accent/10 to-transparent border-brand-accent/20'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Users className='size-5 text-brand-accent' />
                Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-white mb-1'>0</div>
              <p className='text-sm text-slate-400'>
                Total completed interviews
              </p>
              <Button
                className='w-full mt-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl h-11'
                disabled
              >
                View Candidates
              </Button>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className='bg-white/2 border-white/5'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base text-slate-300'>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                variant='ghost'
                className='w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 rounded-lg h-10 gap-2'
                disabled
              >
                Edit Position Details
              </Button>
              <Button
                variant='ghost'
                className='w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 rounded-lg h-10 gap-2 font-medium'
                disabled
              >
                Archive Position
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
