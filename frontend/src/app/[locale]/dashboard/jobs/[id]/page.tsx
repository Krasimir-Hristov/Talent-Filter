'use client';

import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
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
  Trash2,
  Loader2,
  Edit,
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getJobById, deleteJob, updateJob } from '@/lib/jobs-api';
import { toast } from 'sonner';
import { EditJobSheet } from '@/components/features/dashboard/edit-job-sheet';

export default function JobDetailsPage() {
  const t = useTranslations('Dashboard');
  const wizardT = useTranslations('JobWizard');
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const jobId = params.id as string;
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => getJobById(jobId),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete job');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => updateJob(jobId, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] }); // Invalidate the jobs list too
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const copyInterviewLink = () => {
    const link = `${window.location.origin}/interview/${jobId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Interview link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate();
    } else {
      setShowDeleteConfirm(true);
      // Reset after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
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
    <div className='flex flex-col gap-8 max-w-6xl mx-auto'>
      {/* Navigation & Header */}
      <div className='flex flex-col gap-6'>
        {/* Top Bar with Back, Title, and Actions */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10'>
          <div className='flex items-center gap-4'>
            <Button
              asChild
              variant='ghost'
              size='icon'
              className='text-slate-400 hover:text-white hover:bg-white/5 h-10 w-10 shrink-0'
            >
              <Link href='/dashboard/jobs'>
                <ArrowLeft className='size-5' />
              </Link>
            </Button>
            <div>
              <div className='flex items-center gap-3 flex-wrap'>
                <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-white'>
                  {job.title}
                </h1>

                {/* Status Toggle Pill */}
                <div className='flex items-center bg-white/5 rounded-full p-1 border border-white/5'>
                  {[
                    { value: 'active', color: 'emerald' },
                    { value: 'closed', color: 'red' },
                  ].map(({ value, color }) => {
                    const isActive = job.status === value;
                    const colorClasses = {
                      emerald: isActive
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50'
                        : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10',

                      red: isActive
                        ? 'bg-red-500 text-white shadow-sm shadow-red-500/50'
                        : 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
                    };

                    return (
                      <button
                        key={value}
                        onClick={() => updateStatusMutation.mutate(value)}
                        disabled={updateStatusMutation.isPending}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                          colorClasses[color as keyof typeof colorClasses]
                        } ${updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {t(`status.${value}`)}
                      </button>
                    );
                  })}
                </div>

                {/* Candidates Stat Pill */}
                <div className='flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5'>
                  <Users className='size-3.5 text-slate-400' />
                  <span className='text-sm text-slate-300 font-medium'>
                    0 Candidates
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-4 text-sm text-slate-400 mt-1 ml-1'>
                <div className='flex items-center gap-1.5'>
                  <Calendar className='size-3.5' />
                  <span>
                    Created on {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0'>
            <Button
              variant='ghost'
              onClick={() => setIsEditing(true)}
              className='h-10 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors'
            >
              <Edit className='size-4 mr-2' />
              Edit
            </Button>

            <Button
              variant='ghost'
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className={`h-10 px-4 rounded-xl transition-colors ${
                showDeleteConfirm
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              }`}
            >
              {deleteMutation.isPending ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Trash2 className='size-4 mr-2' />
              )}
              {showDeleteConfirm ? 'Confirm?' : 'Delete'}
            </Button>

            <Button
              onClick={copyInterviewLink}
              className='bg-brand-accent hover:bg-brand-accent/90 text-white gap-2 shadow-lg shadow-brand-accent/20 h-10 px-6 rounded-xl flex-1 md:flex-none'
            >
              {copied ? (
                <CheckCircle2 className='size-4' />
              ) : (
                <LinkIcon className='size-4' />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className='max-w-4xl mx-auto w-full space-y-10'>
        {/* Description Section */}
        <section className='space-y-4'>
          <h2 className='text-xl font-semibold text-white/90 flex items-center gap-2'>
            <FileText className='size-5 text-brand-accent' />
            Job Description
          </h2>
          <Card className='bg-white/2 border-white/5 backdrop-blur-sm overflow-hidden'>
            <CardContent className='p-8'>
              <div className='text-slate-300 leading-relaxed whitespace-pre-wrap text-base'>
                {job.description}
              </div>
              {job.notes && (
                <>
                  <Separator className='my-8 bg-white/5' />
                  <div className='space-y-3 bg-white/5 p-4 rounded-xl border border-white/5'>
                    <h3 className='text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2'>
                      <FileText className='size-3.5' /> Internal Notes
                    </h3>
                    <p className='text-slate-400 italic text-sm'>{job.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Questions Section */}
        <section className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-white/90 flex items-center gap-2'>
              <Sparkles className='size-5 text-brand-accent' />
              Interview Questions
              <span className='text-sm bg-white/5 px-2.5 py-0.5 rounded-full text-brand-accent border border-white/10 font-medium ml-2'>
                {job.questions?.length ?? 0}
              </span>
            </h2>
          </div>

          <div className='space-y-4'>
            {job.questions?.map((question, index) => (
              <motion.div
                key={question.id || `question-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className='bg-white/5 border-white/10 hover:border-brand-accent/30 transition-all group'>
                  <CardContent className='p-6'>
                    <div className='flex gap-5'>
                      {/* Question Number */}
                      <div className='flex-none'>
                        <div className='size-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 border border-white/5 group-hover:border-brand-accent/50 group-hover:text-brand-accent transition-colors'>
                          {index + 1}
                        </div>
                      </div>

                      <div className='flex-1 space-y-4'>
                        <div className='flex flex-col md:flex-row md:items-start justify-between gap-2'>
                          <p className='text-white font-medium text-lg leading-snug'>
                            {question.text}
                          </p>
                          <div className='flex items-center gap-3 text-xs text-slate-500 font-medium shrink-0 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5'>
                            <div className='flex items-center gap-1.5'>
                              <Clock className='size-3' />
                              {question.time_limit}s
                            </div>
                            <div className='w-px h-3 bg-white/10' />
                            <div className='flex items-center gap-1.5'>
                              <span>Weight:</span>
                              <span className='text-white'>
                                {question.weight}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='bg-black/20 rounded-xl p-4 border border-white/5'>
                          <h4 className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                            <CheckCircle2 className='size-3.5' /> Ideal Answer
                            Criteria
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

      <EditJobSheet
        job={job}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
}
