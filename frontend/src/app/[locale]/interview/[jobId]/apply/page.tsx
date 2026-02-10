import { getPublicJobDetails } from '@/lib/jobs-api';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RegistrationForm } from '@/components/features/interview/registration-form';
import { LanguageSwitcher } from '@/components/features/language-switcher';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

  // Check if job is closed
  if (job && job.status === 'closed') {
    isClosed = true;
  }

  // Rate limited state
  if (isRateLimited) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <Card className='max-w-md w-full border-destructive/50 bg-destructive/5'>
          <CardHeader>
            <CardTitle className='text-destructive'>
              {t('tooManyRequests')}
            </CardTitle>
            <CardDescription>{t('tooManyRequestsDesc')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!job) notFound();

  // Job closed state
  if (isClosed) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <Card className='max-w-md w-full border-amber-500/50 bg-amber-500/5'>
          <CardHeader>
            <CardTitle className='text-amber-600 dark:text-amber-400'>
              {t('apply.positionClosed')}
            </CardTitle>
            <CardDescription>{t('apply.positionClosedDesc')}</CardDescription>
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
    <div className='min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4 md:p-8'>
      {/* Background decoration */}
      <div className='absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden'>
        <div className='absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]' />
        <div className='absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]' />
      </div>

      {/* Language Switcher */}
      <div className='absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-700 delay-300'>
        <LanguageSwitcher />
      </div>

      {/* Back Link */}
      <div className='absolute top-4 left-4 z-50 animate-in fade-in slide-in-from-top-4 duration-700 delay-300'>
        <Link href={`/${locale}/interview/${jobId}`}>
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='mr-1 h-4 w-4' />
            {t('apply.backToDetails')}
          </Button>
        </Link>
      </div>

      <div className='relative z-10 w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <RegistrationForm jobId={jobId} jobTitle={job.title} locale={locale} />
      </div>
    </div>
  );
}
