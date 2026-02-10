import { getPublicJobDetails } from '@/lib/jobs-api';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/features/language-switcher';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Timer,
  Undo2,
  MonitorOff,
  ShieldAlert,
} from 'lucide-react';
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
  try {
    job = await getPublicJobDetails(jobId);
  } catch (error: any) {
    notFound();
  }

  const rules = [
    {
      icon: <Timer className='w-6 h-6 text-primary' />,
      title: t('apply.rules.timer'),
      description: t('apply.rules.timerDesc'),
    },
    {
      icon: <MonitorOff className='w-6 h-6 text-primary' />,
      title: t('apply.rules.autoSubmit'),
      description: t('apply.rules.autoSubmitDesc'),
    },
    {
      icon: <Undo2 className='w-6 h-6 text-primary' />,
      title: t('apply.rules.noBack'),
      description: t('apply.rules.noBackDesc'),
    },
    {
      icon: <ShieldAlert className='w-6 h-6 text-primary' />,
      title: t('apply.rules.environment'),
      description: t('apply.rules.environmentDesc'),
    },
  ];

  return (
    <div className='min-h-screen bg-[#020617] text-slate-50 relative font-sans selection:bg-primary/30'>
      {/* Background gradients */}
      <div className='fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]' />

      {/* Language Switcher - FORCE RIGHT with inline styles to override any framework quirks */}
      <div className='fixed z-[100]' style={{ top: '2rem', right: '2rem' }}>
        <LanguageSwitcher />
      </div>

      <div className='flex flex-col items-center justify-center min-h-screen py-20 px-6 animate-in fade-in duration-700'>
        {/* Main Content Width Wrapper - Matches both description and cards */}
        <main className='w-full max-w-5xl space-y-16'>
          {/* Header Section - EXPANDED WIDTH (Red Box fix) */}
          <header className='text-center space-y-8 flex flex-col items-center w-full'>
            <Badge
              variant='outline'
              className='px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-xs uppercase tracking-[0.2em] font-medium rounded-full'
            >
              {t('jobDetails')}
            </Badge>

            {/* Title & Description now take full width of container */}
            <div className='w-full space-y-6'>
              <h1 className='text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight w-full'>
                {job.title}
              </h1>

              <p className='text-lg md:text-2xl text-slate-300 font-medium leading-relaxed w-full max-w-none px-4 md:px-0'>
                {job.description}
              </p>
            </div>
          </header>

          {/* Rules Section */}
          <section className='space-y-10 w-full'>
            <div className='flex items-center justify-center gap-4'>
              <div className='h-px w-16 bg-slate-800' />
              <h2 className='text-sm font-bold uppercase tracking-[0.3em] text-slate-500'>
                {t('apply.rules.title')}
              </h2>
              <div className='h-px w-16 bg-slate-800' />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className='group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-5 transition-all duration-300 hover:bg-white/[0.04] hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5'
                >
                  <div className='p-3 rounded-xl bg-slate-900 border border-white/[0.05] group-hover:border-primary/30 group-hover:text-primary transition-colors shrink-0'>
                    {rule.icon}
                  </div>
                  <div className='space-y-2 text-left'>
                    <h4 className='text-lg font-bold text-slate-200 uppercase tracking-tight group-hover:text-white transition-colors'>
                      {rule.title}
                    </h4>
                    <p className='text-base text-slate-400 leading-relaxed font-normal group-hover:text-slate-300 transition-colors'>
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Footer */}
          <footer className='pt-12 text-center flex flex-col items-center gap-8'>
            <p className='text-sm md:text-base text-slate-400 font-semibold uppercase tracking-widest max-w-2xl'>
              {t('apply.rules.intro')}
            </p>

            <Link
              href={`/${locale}/interview/${jobId}/apply`}
              className='w-full max-w-md cursor-pointer group'
            >
              <Button
                size='lg'
                className='w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]'
              >
                <span>{t('apply.rules.continue')}</span>
                <ArrowRight className='ml-3 w-6 h-6 group-hover:translate-x-1.5 transition-transform' />
              </Button>
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
