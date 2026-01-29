'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionCard } from '../components/question-card';
import { AddQuestionButton } from '../components/add-question-button';
import type { AIQuestion } from '../use-job-builder';

interface QuestionsStepProps {
  title: string;
  description: string;
  questions: AIQuestion[];
  isSaving: boolean;
  isGenerating: boolean;
  onTitleChange: (value: string) => void;
  onUpdateQuestion: (
    index: number,
    field: keyof AIQuestion,
    value: any,
  ) => void;
  onRemoveQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onSuggestOne: () => void;
  onBack: () => void;
  onSave: () => void;
}

export function QuestionsStep({
  title,
  description,
  questions,
  isSaving,
  isGenerating,
  onTitleChange,
  onUpdateQuestion,
  onRemoveQuestion,
  onAddQuestion,
  onSuggestOne,
  onBack,
  onSave,
}: QuestionsStepProps) {
  const t = useTranslations('JobWizard');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
    >
      {/* Job Title Header */}
      <div className='flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl'>
        <div className='flex-1'>
          <Label className='text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 block'>
            {t('jobTitle')}
          </Label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className='bg-transparent border-0 text-xl font-bold text-white p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto placeholder:text-slate-700'
            placeholder='Enter job title...'
          />
        </div>
        <Button
          variant='outline'
          onClick={onBack}
          className='border-white/10 text-slate-300 hover:bg-white/5 h-12 rounded-xl'
        >
          <ChevronLeft className='size-4 mr-2' />
          Back
        </Button>
      </div>

      {/* Questions List */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between pb-2'>
          <h3 className='text-white font-semibold flex items-center gap-2'>
            <Sparkles className='size-5 text-brand-accent' />
            {t('questions')}
            <span className='size-6 rounded-full bg-brand-accent/20 text-brand-accent text-xs flex items-center justify-center font-bold'>
              {questions.length}
            </span>
          </h3>

          <Button
            onClick={onSuggestOne}
            disabled={isGenerating}
            variant='ghost'
            size='sm'
            className='text-brand-accent hover:bg-brand-accent/10 gap-2 h-9 rounded-xl border border-brand-accent/20'
          >
            {isGenerating ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Wand2 className='size-4' />
            )}
            Suggest with AI
          </Button>
        </div>

        {/* Empty State */}
        {questions.length === 0 ? (
          <div className='text-center py-16 px-6 bg-white/2 border-2 border-dashed border-white/10 rounded-3xl'>
            <div className='size-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4'>
              <Sparkles className='size-8 text-slate-500' />
            </div>
            <h4 className='text-white font-semibold mb-2'>No questions yet</h4>
            <p className='text-slate-400 text-sm mb-6 max-w-md mx-auto'>
              Your interview is empty. Use the buttons below to build your
              screening session.
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <AddQuestionButton onClick={onAddQuestion} />
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {questions.map((q, index) => (
              <QuestionCard
                key={index}
                question={q}
                index={index}
                jobDescription={description}
                onUpdate={(field, value) =>
                  onUpdateQuestion(index, field as keyof AIQuestion, value)
                }
                onRemove={() => onRemoveQuestion(index)}
              />
            ))}

            <div className='flex flex-col sm:flex-row gap-4 pt-2'>
              <AddQuestionButton onClick={onAddQuestion} />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className='pt-6 flex justify-end border-t border-white/5'>
        <Button
          onClick={onSave}
          disabled={
            isSaving || isGenerating || questions.length === 0 || !title.trim()
          }
          className='bg-linear-to-r from-brand-accent to-brand-glow hover:opacity-90 text-white px-10 h-14 rounded-xl shadow-xl shadow-brand-accent/20 gap-3 text-lg font-bold transition-all hover:scale-[1.02]'
        >
          {isSaving ? (
            <>
              <Loader2 className='size-6 animate-spin' />
              {t('btnSaving')}
            </>
          ) : (
            <>
              {t('btnSave')}
              <ChevronRight className='size-6' />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
