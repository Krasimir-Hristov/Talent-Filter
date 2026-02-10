'use client';

import { useTranslations } from 'next-intl';
import { Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InterviewHeaderProps {
  jobTitle: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeLeftPercentage?: number; // 0-100
  timeLeftFormatted?: string;
}

export function InterviewHeader({
  jobTitle,
  currentQuestionIndex,
  totalQuestions,
  timeLeftPercentage = 100,
  timeLeftFormatted = '02:00',
}: InterviewHeaderProps) {
  const t = useTranslations('Interview');

  return (
    <header className='fixed top-0 left-0 w-full z-50 bg-[#020617]/90 backdrop-blur-md border-b border-white/5 shadow-2xl shadow-black/40'>
      <div className='max-w-7xl mx-auto px-8 h-24 flex items-center justify-between'>
        {/* Left: Branding & Job Title */}
        <div className='flex items-center gap-6'>
          <Badge
            variant='outline'
            className='hidden md:flex shrink-0 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[11px] uppercase tracking-[0.25em] font-bold rounded-full px-4 py-1.5'
          >
            {t('session.liveSession')}
          </Badge>

          <div className='h-8 w-px bg-white/10 hidden md:block' />

          <h2 className='text-base md:text-lg font-bold text-slate-100 truncate max-w-[300px] md:max-w-2xl tracking-tight'>
            {jobTitle}
          </h2>
        </div>

        {/* Right: Timer & Count */}
        <div className='flex items-center gap-6'>
          {/* Question Count (Moved to right side for better balance) */}
          <div className='text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:block'>
            <span className='text-slate-400 mr-2'>{t('session.question')}</span>
            <span className='text-white text-base bg-white/5 px-3 py-1 rounded-lg border border-white/5'>
              {currentQuestionIndex + 1}{' '}
              <span className='text-slate-600 mx-1'>/</span> {totalQuestions}
            </span>
          </div>

          <div className='h-8 w-px bg-white/10 hidden md:block' />

          {/* Timer */}
          <div className='flex items-center gap-3 bg-slate-900 rounded-full px-5 py-2 border border-white/10 shadow-inner'>
            <Timer className='w-5 h-5 text-primary animate-pulse' />
            <span className='text-base font-mono font-medium text-slate-100 w-[5ch] text-center tracking-wider'>
              {timeLeftFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Timer Progress Bar (Visual) */}
      <div className='absolute bottom-0 left-0 w-full h-px bg-slate-800'>
        <div
          className='h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] transition-all duration-1000 ease-linear'
          style={{ width: `${timeLeftPercentage}%` }}
        />
      </div>
    </header>
  );
}
