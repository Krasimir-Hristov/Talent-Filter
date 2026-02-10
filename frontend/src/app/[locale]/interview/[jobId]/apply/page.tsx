import { getPublicJobDetails } from '@/lib/jobs-api';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RegistrationForm } from '@/components/features/interview/registration-form';
import { LanguageSwitcher } from '@/components/features/language-switcher';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ApplyPageProps {
  params: Promise<{
    locale: string;
    jobId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ApplyPageProps): Promise<Metadata> {
  const { jobId } = await params;
  try {
    const job = await getPublicJobDetails(jobId);
    return {
      title: `Apply - ${job.title} | TalentFilter`,
      description: `Register to start your interview for ${job.title}`,
    };
  } catch {
    return {
      title: 'Apply | TalentFilter',
    };
  }
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { locale, jobId } = await params;
  const t = await getTranslations('Interview');

  let job;
  let isRateLimited = false;
  let isClosed = false;

  try {
    job = await getPublicJobDetails(jobId);
  } catch (error: any) {
    if (error.status === 429) {
      isRateLimited = true;
    } else {
      notFound();
    }
  }

  if (job && job.status === 'closed') {
    isClosed = true;
  }

  if (isRateLimited) {
    return (
      <div className='min-h-screen bg-[#020617] flex items-center justify-center p-4'>
        <Card className='max-w-md w-full border-destructive/50 bg-slate-900/50 backdrop-blur-xl'>
          <CardHeader>
            <CardTitle className='text-destructive text-center'>
              {t('tooManyRequests')}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!job) notFound();

  if (isClosed) {
    return (
      <div className='min-h-screen bg-[#020617] flex items-center justify-center p-4'>
        <Card className='max-w-md w-full border-amber-500/50 bg-slate-900/50 backdrop-blur-xl'>
          <CardHeader>
            <CardTitle className='text-amber-500 text-center'>
              {t('apply.positionClosed')}
            </CardTitle>
            <CardDescription className='text-center text-slate-400'>
              {t('apply.positionClosedDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}`}>
              <Button variant='outline' className='w-full'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                {t('backToHome') || 'Home'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#020617] text-slate-50 relative font-sans selection:bg-primary/30'>
      {/* Background gradients */}
      <div className='fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]' />

      {/* Language Switcher - FIXED TOP RIGHT (Matches landing page) */}
      <div className='fixed z-100' style={{ top: '2rem', right: '2rem' }}>
        <LanguageSwitcher />
      </div>

      {/* Back Link - Styled to match the premium theme */}
      <div
        className='fixed z-100 flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-left-4 duration-700'
        style={{ top: '2rem', left: '2rem' }}
      >
        <Link
          href={`/${locale}/interview/${jobId}`}
          className='flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          {t('apply.backToDetails')}
        </Link>
      </div>

      <div className='flex flex-col items-center justify-center min-h-screen py-24 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700'>
        <RegistrationForm jobId={jobId} jobTitle={job.title} locale={locale} />
      </div>
    </div>
  );
}
