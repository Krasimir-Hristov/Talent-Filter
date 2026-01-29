'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/layout/landing-header';
import { useAuthStore } from '@/store/useAuthStore';

export default function HomePage() {
  const t = useTranslations('Landing');
  const { isAuthenticated } = useAuthStore();

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-[#0f172a] text-white'>
      <LandingHeader />
      {/* Background Animated Glows (Matching Auth Layout) */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className='absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-brand-accent/10 blur-[150px]'
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className='absolute -bottom-[20%] -right-[10%] h-[900px] w-[900px] rounded-full bg-brand-glow/10 blur-[130px]'
        />
      </div>

      {/* Hero Section */}
      <main className='relative z-10 container mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-accent text-sm font-medium mb-8'
        >
          <Sparkles className='size-4' />
          <span>AI-Powered Recruitment 2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent'
        >
          {t('title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed'
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='flex flex-col sm:flex-row items-center gap-4'
        >
          <Button
            asChild
            size='lg'
            className='h-14 px-8 rounded-2xl bg-linear-to-r from-brand-accent to-brand-glow text-white font-bold text-lg shadow-2xl shadow-brand-accent/20 hover:scale-105 transition-transform'
          >
            <Link href={isAuthenticated ? '/dashboard' : '/auth/register'}>
              {isAuthenticated ? t('goToDashboard') : t('getStarted')}
              <ArrowRight className='ml-2 size-5' />
            </Link>
          </Button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-5xl'
        >
          <div className='p-8 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-sm space-y-4'>
            <div className='size-10 rounded-xl bg-brand-accent/20 flex items-center justify-center text-brand-accent'>
              <Zap className='size-6' />
            </div>
            <h3 className='text-xl font-semibold'>Fast Screening</h3>
            <p className='text-slate-400 text-sm leading-relaxed'>
              Automate initial screenings and identify top talent in minutes,
              not weeks.
            </p>
          </div>
          <div className='p-8 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-sm space-y-4'>
            <div className='size-10 rounded-xl bg-brand-glow/20 flex items-center justify-center text-brand-glow'>
              <ShieldCheck className='size-6' />
            </div>
            <h3 className='text-xl font-semibold'>Bias-Free</h3>
            <p className='text-slate-400 text-sm leading-relaxed'>
              AI objective scoring ensures every candidate is evaluated purely
              on competence.
            </p>
          </div>
          <div className='p-8 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-sm space-y-4'>
            <div className='size-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400'>
              <Sparkles className='size-6' />
            </div>
            <h3 className='text-xl font-semibold'>Smart Insights</h3>
            <p className='text-slate-400 text-sm leading-relaxed'>
              Deep analysis of candidate responses beyond just keywords.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />
    </div>
  );
}
