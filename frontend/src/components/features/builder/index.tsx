'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

import { useJobBuilderStore } from '@/store/useJobBuilderStore';
import { JobInputForm } from './JobInputForm';
import { QuestionList } from './QuestionList';
import { ActionBar } from './ActionBar';
import { useJobBuilderActions } from './useJobBuilderActions';

export function JobCreationWizard() {
  const t = useTranslations('JobWizard');
  const { reset } = useJobBuilderStore();
  const { generateInterview, saveJob } = useJobBuilderActions();

  // Reset store when component unmounts (user leaves page)
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveJob();
  };

  return (
    <form onSubmit={handleSubmit} className='max-w-5xl mx-auto space-y-8'>
      {/* Header */}
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-bold text-white flex items-center justify-center gap-3'>
          <Sparkles className='size-8 text-brand-accent' />
          {t('title') || 'Create Smart Interview'}
        </h1>
        <p className='text-slate-400'>
          {t('subtitle') ||
            'AI will generate questions based on your job description. You can refine them afterwards.'}
        </p>
      </div>

      {/* Input Form */}
      <JobInputForm onGenerate={generateInterview} />

      {/* Questions */}
      <QuestionList />

      {/* Action Buttons */}
      <ActionBar />
    </form>
  );
}

// Re-export for convenience
export { JobInputForm } from './JobInputForm';
export { QuestionCard } from './QuestionCard';
export { QuestionList } from './QuestionList';
export { ActionBar } from './ActionBar';
