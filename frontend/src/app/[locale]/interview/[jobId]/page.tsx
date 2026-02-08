import { getPublicJobDetails } from '@/lib/jobs-api';
import { getTranslations, getLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/features/language-switcher';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface InterviewLandingPageProps {
  params: Promise<{
    locale: string;
    jobId: string;
  }>;
}

export async function generateMetadata({
  params,
}: InterviewLandingPageProps): Promise<Metadata> {
  const { jobId } = await params;
  try {
    const job = await getPublicJobDetails(jobId);
    return {
      title: `${job.title} - Interview | TalentFilter`,
      description: job.description.substring(0, 160),
    };
  } catch {
    return {
      title: 'Interview | TalentFilter',
    };
  }
}

export default async function InterviewLandingPage({
  params,
}: InterviewLandingPageProps) {
  const { locale, jobId } = await params;
  const t = await getTranslations('Interview');

  let job;
  let isRateLimited = false;

  try {
    job = await getPublicJobDetails(jobId);
  } catch (error: any) {
    if (error.status === 429) {
      isRateLimited = true;
    } else {
      notFound();
    }
  }

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
          <CardFooter>
            <Link href='/' className='w-full'>
              <Button variant='outline' className='w-full'>
                {t('backToHome') || 'Home'}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!job) notFound();

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

      <div className='max-w-4xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <div className='flex flex-col md:flex-row gap-8 items-stretch'>
          {/* Main Info Card */}
          <Card className='flex-1 border-primary/20 bg-background/60 backdrop-blur-xl shadow-2xl flex flex-col'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Badge
                  variant='outline'
                  className='text-primary border-primary/30 uppercase tracking-widest text-[10px]'
                >
                  {t('jobDetails')}
                </Badge>
              </div>
              <CardTitle className='text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70'>
                {job.title}
              </CardTitle>
            </CardHeader>
            <CardContent className='flex-1 space-y-6'>
              <div className='prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-10 md:line-clamp-none'>
                {job.description}
              </div>

              <div className='pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='flex items-center gap-3 text-sm'>
                  <div className='p-2 rounded-full bg-primary/10 text-primary'>
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>
                      {t('estimatedTime')}
                    </p>
                    <p className='text-xs text-muted-foreground font-light'>
                      {t('estimatedTimeLabel')}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 text-sm'>
                  <div className='p-2 rounded-full bg-primary/10 text-primary'>
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>
                      {t('aiGuided')}
                    </p>
                    <p className='text-xs text-muted-foreground font-light'>
                      {t('selfPaced')}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 text-sm'>
                  <div className='p-2 rounded-full bg-primary/10 text-primary'>
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>{t('secure')}</p>
                    <p className='text-xs text-muted-foreground font-light'>
                      {t('antiCheat')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className='pt-6 border-t border-border/50 bg-muted/30'>
              <div className='w-full flex flex-col gap-4'>
                <p className='text-[10px] text-muted-foreground text-center italic'>
                  {t('terms')}
                </p>
                <Link
                  href={`/${locale}/interview/${jobId}/apply`}
                  className='w-full'
                >
                  <Button
                    size='lg'
                    className='w-full text-lg font-semibold group h-14 bg-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]'
                  >
                    {t('start')}
                    <ArrowRight className='ml-2 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Side Highlights (Hidden on small screens) */}
          <div className='hidden lg:flex flex-col gap-4 w-72'>
            <div className='p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col gap-4'>
              <h3 className='font-semibold text-primary'>{t('howItWorks')}</h3>
              <ul className='space-y-4'>
                <li className='flex gap-3 text-sm'>
                  <span className='shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs'>
                    1
                  </span>
                  <span className='text-muted-foreground'>{t('step1')}</span>
                </li>
                <li className='flex gap-3 text-sm'>
                  <span className='shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs'>
                    2
                  </span>
                  <span className='text-muted-foreground'>{t('step2')}</span>
                </li>
                <li className='flex gap-3 text-sm'>
                  <span className='shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs'>
                    3
                  </span>
                  <span className='text-muted-foreground'>{t('step3')}</span>
                </li>
              </ul>
            </div>
            <div className='p-6 rounded-2xl border border-border bg-background/50 text-sm italic text-muted-foreground'>
              {t('quote')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
