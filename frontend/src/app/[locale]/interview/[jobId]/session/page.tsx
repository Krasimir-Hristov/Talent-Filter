'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { InterviewHeader } from '@/components/features/interview/session/interview-header';
import { QuestionCard } from '@/components/features/interview/session/question-card';
import { notFound } from 'next/navigation';

interface SessionPageProps {
  params: Promise<{
    locale: string;
    jobId: string;
  }>;
  searchParams: Promise<{
    sid: string;
  }>;
}

export default function InterviewSessionPage({
  params,
  searchParams,
}: SessionPageProps) {
  // Mock Data for UI Development
  const jobTitle = 'Senior React Developer'; // eventually fetched
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const totalQuestions = 5;
  const [timeLeft, setTimeLeft] = useState(120); // seconds
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResponseChange = (value: string) => {
    setResponse(value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    // Next question logic (mock)
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setResponse('');
      setTimeLeft(120); // reset timer
    } else {
      alert('Interview Completed (Mock)');
    }
  };

  const currentQuestionMock =
    'Describe a challenging technical problem you solved recently and how you approached it.';

  return (
    <div className='min-h-screen bg-[#020617] text-slate-50 relative font-sans selection:bg-primary/30 overflow-hidden'>
      {/* Background gradients (consistent with other pages) */}
      <div className='fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]' />

      {/* Header */}
      <InterviewHeader
        jobTitle={jobTitle}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        timeLeftPercentage={(timeLeft / 120) * 100}
        timeLeftFormatted={formatTime(timeLeft)}
      />

      {/* Main Content Area */}
      <main className='flex flex-col items-center justify-center min-h-screen pt-20 px-6 pb-12'>
        <div className='w-full max-w-5xl'>
          <QuestionCard
            questionNumber={currentQuestionIndex + 1}
            questionText={currentQuestionMock}
            response={response}
            isSubmitting={isSubmitting}
            onResponseChange={handleResponseChange}
            onSubmit={handleSubmit}
          />
        </div>
      </main>
    </div>
  );
}
