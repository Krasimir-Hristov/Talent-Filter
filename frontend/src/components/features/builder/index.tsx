'use client';

import { AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';
import { useJobBuilder } from './use-job-builder';
import { SetupStep } from './steps/setup-step';
import { QuestionsStep } from './steps/questions-step';

export function JobCreationWizard() {
  const t = useTranslations('JobWizard');
  const {
    step,
    mode,
    title,
    description,
    questions,
    isGenerating,
    isSaving,
    setStep,
    setTitle,
    setDescription,
    generateQuestionsWithAI,
    suggestSingleQuestion,
    addQuestion,
    updateQuestion,
    removeQuestion,
    saveJob,
    startManualMode,
    startAIMode,
  } = useJobBuilder();

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Progress Stepper */}
      <div className='mb-8 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {[1, 2].map((i) => (
            <div key={i} className='flex items-center'>
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= i
                    ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20'
                    : 'bg-white/5 text-slate-500 border border-white/10'
                }`}
              >
                {step > i ? <CheckCircle2 className='size-6' /> : i}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${step > i ? 'bg-brand-accent' : 'bg-white/10'}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className='text-right'>
          <h2 className='text-white font-semibold uppercase tracking-widest text-xs opacity-50 mb-1'>
            {step === 1 ? 'Phase 01' : 'Phase 02'}
          </h2>
          <p className='text-slate-300 font-bold'>
            {step === 1 ? t('step1Detail') : t('step2Detail')}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode='wait'>
        {step === 1 ? (
          <SetupStep
            key='setup'
            mode={mode}
            title={title}
            description={description}
            isGenerating={isGenerating}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onStartAI={startAIMode}
            onStartManual={startManualMode}
          />
        ) : (
          <QuestionsStep
            key='questions'
            title={title}
            description={description}
            questions={questions}
            isSaving={isSaving}
            isGenerating={isGenerating}
            onTitleChange={setTitle}
            onUpdateQuestion={updateQuestion}
            onRemoveQuestion={removeQuestion}
            onAddQuestion={addQuestion}
            onSuggestOne={suggestSingleQuestion}
            onBack={() => setStep(1)}
            onSave={saveJob}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
