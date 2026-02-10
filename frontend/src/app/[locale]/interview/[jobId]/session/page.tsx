'use client';

import { use, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { InterviewHeader } from '@/components/features/interview/session/interview-header';
import { QuestionCard } from '@/components/features/interview/session/question-card';
import { useInterviewSessionStore } from '@/store/useInterviewSessionStore';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface SessionPageProps {
  params: Promise<{
    locale: string;
    jobId: string;
  }>;
  searchParams: Promise<{
    sid?: string;
  }>;
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function InterviewSessionPage({
  params,
  searchParams,
}: SessionPageProps) {
  const t = useTranslations('Interview');
  const { sid } = use(searchParams);

  // ── Store ────────────────────────────────────────────────────────────
  const {
    interviewId,
    jobTitle,
    questions,
    currentIndex,
    totalQuestions,
    timeLeft,
    maxTime,
    answers,
    sessionState,
    errorMessage,
    initSession,
    submitCurrentAnswer,
    tick,
    setAnswer,
    recordPaste,
    resetSession,
  } = useInterviewSessionStore();

  // ── Anti-Cheat ──────────────────────────────────────────────────────
  const { checkForSpeedPaste, resetPasteTracker } = useAntiCheat();

  // ── Refs ─────────────────────────────────────────────────────────────
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousIndexRef = useRef(currentIndex);

  // ── Init Session on mount ───────────────────────────────────────────
  useEffect(() => {
    if (sid && sessionState === 'idle') {
      initSession(sid);
    }

    return () => {
      // Clean up on unmount
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  // ── Timer interval ──────────────────────────────────────────────────
  useEffect(() => {
    if (sessionState === 'active') {
      timerRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionState, tick]);

  // ── Reset paste tracker when question changes ──────────────────────
  useEffect(() => {
    if (currentIndex !== previousIndexRef.current) {
      resetPasteTracker();
      previousIndexRef.current = currentIndex;
    }
  }, [currentIndex, resetPasteTracker]);

  // ── Handlers ────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id] || ''
    : '';

  const handleResponseChange = useCallback(
    (value: string) => {
      if (!currentQuestion) return;

      // Speed-paste detection (works even without onPaste)
      checkForSpeedPaste(value);

      setAnswer(currentQuestion.id, value);
    },
    [currentQuestion, checkForSpeedPaste, setAnswer],
  );

  const handlePasteAttempt = useCallback(() => {
    recordPaste();
  }, [recordPaste]);

  const handleSubmit = useCallback(() => {
    submitCurrentAnswer();
  }, [submitCurrentAnswer]);

  // ── Helpers ─────────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercentage = maxTime > 0 ? (timeLeft / maxTime) * 100 : 100;

  // ── RENDER: Loading state ───────────────────────────────────────────
  if (sessionState === 'loading' || sessionState === 'idle') {
    return (
      <div className='min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6'>
        <Loader2 className='w-12 h-12 text-primary animate-spin' />
        <p className='text-slate-400 text-lg font-medium animate-pulse'>
          {t('session.loading')}
        </p>
      </div>
    );
  }

  // ── RENDER: Error state ─────────────────────────────────────────────
  if (sessionState === 'error') {
    return (
      <div className='min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6 px-6'>
        <div className='bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md text-center space-y-4'>
          <AlertTriangle className='w-12 h-12 text-red-400 mx-auto' />
          <h2 className='text-xl font-bold text-red-300'>
            {t('session.errorTitle')}
          </h2>
          <p className='text-slate-400'>
            {errorMessage || t('session.errorGeneric')}
          </p>
        </div>
      </div>
    );
  }

  // ── RENDER: Completed state ─────────────────────────────────────────
  if (sessionState === 'completed') {
    return (
      <div className='min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-8 px-6'>
        <div className='bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12 max-w-lg text-center space-y-6'>
          <div className='flex justify-center'>
            <div className='w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center'>
              <CheckCircle2 className='w-10 h-10 text-emerald-400' />
            </div>
          </div>
          <h2 className='text-3xl font-extrabold text-emerald-300 tracking-tight'>
            {t('session.completedTitle')}
          </h2>
          <p className='text-slate-400 text-lg leading-relaxed'>
            {t('session.completedMessage')}
          </p>
          <div className='h-1 w-16 bg-emerald-500/30 rounded-full mx-auto' />
          <p className='text-xs text-slate-600 uppercase tracking-widest'>
            {t('session.completedFooter')}
          </p>
        </div>
      </div>
    );
  }

  // ── RENDER: Active session ──────────────────────────────────────────
  return (
    <div className='min-h-screen bg-[#020617] text-slate-50 relative font-sans selection:bg-primary/30 overflow-hidden'>
      {/* Background gradients */}
      <div className='fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]' />

      {/* Header */}
      <InterviewHeader
        jobTitle={jobTitle}
        currentQuestionIndex={currentIndex}
        totalQuestions={totalQuestions}
        timeLeftPercentage={timePercentage}
        timeLeftFormatted={formatTime(timeLeft)}
      />

      {/* Main Content Area */}
      <main className='flex flex-col items-center justify-center min-h-screen pt-20 px-6 pb-12'>
        <div className='w-full max-w-5xl'>
          {currentQuestion && (
            <QuestionCard
              questionNumber={currentIndex + 1}
              questionText={currentQuestion.text}
              response={currentAnswer}
              isSubmitting={sessionState === 'submitting'}
              onResponseChange={handleResponseChange}
              onSubmit={handleSubmit}
              onPasteAttempt={handlePasteAttempt}
            />
          )}
        </div>
      </main>
    </div>
  );
}
