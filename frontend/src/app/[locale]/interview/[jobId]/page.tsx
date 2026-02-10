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
      icon: <Timer className='w-8 h-8 text-primary' />,
      title: t('apply.rules.timer'),
      description: t('apply.rules.timerDesc'),
    },
    {
      icon: <MonitorOff className='w-8 h-8 text-primary' />,
      title: t('apply.rules.autoSubmit'),
      description: t('apply.rules.autoSubmitDesc'),
    },
    {
      icon: <Undo2 className='w-8 h-8 text-primary' />,
      title: t('apply.rules.noBack'),
      description: t('apply.rules.noBackDesc'),
    },
    {
      icon: <ShieldAlert className='w-8 h-8 text-primary' />,
      title: t('apply.rules.environment'),
      description: t('apply.rules.environmentDesc'),
    },
  ];

  return (
    <div className='min-h-screen bg-[#020617] text-slate-50 relative font-sans selection:bg-primary/30'>
      {/* Background gradients */}
      <div className='fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]' />

      {/* Language Switcher - FIXED TOP RIGHT */}
      <div className='fixed z-100' style={{ top: '2rem', right: '2rem' }}>
        <LanguageSwitcher />
      </div>

      <div className='flex flex-col items-center justify-center min-h-screen py-24 px-6 animate-in fade-in duration-700'>
        {/* Main Content Width Wrapper */}
        <main className='w-full max-w-5xl space-y-24'>
          {/* Header Section - Centered & Full Width Context */}
          <header className='flex flex-col items-center w-full space-y-8 text-center'>
            <Badge
              variant='outline'
              className='px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-xs uppercase tracking-[0.2em] font-medium rounded-full'
            >
              {t('jobDetails')}
            </Badge>

            <div className='w-full space-y-6 flex flex-col items-center'>
              <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] w-full max-w-4xl'>
                {job.title}
              </h1>

              <div className='h-1.5 w-24 bg-primary/40 rounded-full' />

              <p className='text-2xl md:text-3xl text-slate-300 font-medium leading-relaxed w-full max-w-4xl opacity-90'>
                {job.description}
              </p>
            </div>
          </header>

          {/* Rules Section */}
          <section className='space-y-12 w-full'>
            <div className='flex items-center justify-center gap-6 w-full'>
              <div className='h-px flex-1 bg-slate-800' />
              <h2 className='text-sm font-bold uppercase tracking-[0.3em] text-slate-500 shrink-0'>
                {t('apply.rules.title')}
              </h2>
              <div className='h-px flex-1 bg-slate-800' />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full'>
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className='group relative p-12 min-h-[320px] rounded-4xl bg-white/2 border border-white/5 flex flex-col items-center justify-center text-center gap-6 transition-all duration-300 hover:bg-white/4 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1'
                >
                  <div className='p-5 rounded-2xl bg-slate-900 border border-white/5 group-hover:border-primary/30 group-hover:text-primary transition-colors shrink-0 shadow-inner'>
                    {rule.icon}
                  </div>
                  <div className='space-y-4'>
                    <h4 className='text-2xl font-bold text-slate-200 uppercase tracking-tight group-hover:text-white transition-colors'>
                      {rule.title}
                    </h4>
                    <p className='text-lg text-slate-400 leading-relaxed font-normal group-hover:text-slate-300 transition-colors max-w-xs mx-auto'>
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Footer */}
          <footer className='pt-8 text-center flex flex-col items-center gap-10 border-t border-slate-800/50 mt-12'>
            <p className='text-base text-slate-400 font-semibold uppercase tracking-widest max-w-2xl mt-8'>
              {t('apply.rules.intro')}
            </p>

            <Link
              href={`/${locale}/interview/${jobId}/apply`}
              className='w-full max-w-lg cursor-pointer group'
            >
              <Button
                size='lg'
                className='w-full h-20 text-2xl font-bold bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]'
              >
                <span>{t('apply.rules.continue')}</span>
                <ArrowRight className='ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform' />
              </Button>
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
