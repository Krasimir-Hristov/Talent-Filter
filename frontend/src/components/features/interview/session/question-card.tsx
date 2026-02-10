'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  questionText: string;
  response: string;
  isSubmitting: boolean;
  onResponseChange: (value: string) => void;
  onSubmit: () => void;
  onPasteAttempt?: () => void;
  maxChars?: number;
}

export function QuestionCard({
  questionNumber,
  questionText,
  response,
  isSubmitting,
  onResponseChange,
  onSubmit,
  onPasteAttempt,
  maxChars = 2000,
}: QuestionCardProps) {
  const t = useTranslations('Interview');
  const charCount = response.length;
  const isApproachingLimit = charCount > maxChars * 0.9;
  const isOverLimit = charCount > maxChars;

  return (
    <div className='w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700'>
      {/* Question Header */}
      <div className='space-y-6 text-center'>
        <div className='flex justify-center'>
          <Badge
            variant='outline'
            className='px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-[0.2em] font-normal rounded-full'
          >
            {t('session.question')} {questionNumber}
          </Badge>
        </div>

        <h1 className='text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight'>
          {questionText}
        </h1>

        <div className='h-1.5 w-24 bg-primary/40 rounded-full mx-auto mt-6' />
      </div>

      {/* Answer Area */}
      <div className='relative group'>
        <div className='absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-1000 -z-10 rounded-full pointer-events-none' />

        <div className='relative bg-white/2 border border-white/5 rounded-4xl p-1 md:p-2 backdrop-blur-xl shadow-2xl overflow-hidden focus-within:border-primary/30 focus-within:bg-white/5 transition-all duration-300'>
          <Textarea
            value={response}
            onChange={(e) => onResponseChange(e.target.value)}
            onPaste={() => {
              onPasteAttempt?.();
            }}
            disabled={isSubmitting}
            placeholder={t('session.answerPlaceholder')}
            className='bg-transparent border-0 focus-visible:ring-0 text-lg md:text-xl text-slate-200 placeholder:text-slate-600 min-h-[300px] resize-none p-6 md:p-8 selection:bg-primary/30 font-medium leading-relaxed rounded-[1.8rem]'
            maxLength={maxChars}
          />

          {/* Footer inside Textarea */}
          <div className='absolute bottom-6 right-8 flex items-center justify-between pointer-events-none w-full px-8'>
            <span
              className={`text-xs uppercase tracking-widest font-bold ${isApproachingLimit ? 'text-amber-500' : 'text-slate-600'} ${isOverLimit ? 'text-destructive' : ''}`}
            >
              {charCount} / {maxChars}
            </span>
            {/* Just a decorative element */}
            <div
              className={`h-1.5 w-1.5 rounded-full ${charCount > 0 ? 'bg-primary animate-pulse' : 'bg-slate-800'}`}
            />
          </div>
        </div>
      </div>

      {/* Submit Controls */}
      <div className='flex justify-center pt-8'>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || charCount === 0}
          size='lg'
          className='h-16 px-10 rounded-full bg-primary hover:bg-primary/90 text-white text-xl font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting ? (
            <div className='flex items-center gap-3'>
              <Loader2 className='w-6 h-6 animate-spin' />
              <span>{t('session.submitting')}</span>
            </div>
          ) : (
            <div className='flex items-center gap-3'>
              <Sparkles className='w-6 h-6 text-white/50 group-hover:text-white transition-colors' />
              <span>{t('session.submitAnswer')}</span>
              <ArrowRight className='w-6 h-6 group-hover:translate-x-1.5 transition-transform' />
            </div>
          )}
        </Button>
      </div>

      {/* Helper text */}
      <p className='text-center text-xs text-slate-500 uppercase tracking-widest font-medium opacity-60'>
        {t('session.autoSave')} • {t('session.noGoingBack')}
      </p>
    </div>
  );
}
