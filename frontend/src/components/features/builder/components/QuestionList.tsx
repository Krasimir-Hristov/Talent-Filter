'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Plus, Sparkles, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useJobBuilderStore } from '@/store/useJobBuilderStore';
import { QuestionCard } from './QuestionCard';
import { useJobBuilderActions } from '../hooks/useJobBuilderActions';

export function QuestionList() {
  const t = useTranslations('JobWizard');
  const { questions, hasGenerated, addQuestion } = useJobBuilderStore();
  const { suggestQuestion } = useJobBuilderActions();

  if (!hasGenerated) {
    return null;
  }

  // Handle empty state (after generation, user deleted all)
  if (questions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-xl bg-white/5 gap-4'>
        <p className='text-slate-400'>
          {t('noQuestions') || 'No questions yet'}
        </p>
        <Button
          variant='ghost'
          onClick={() => addQuestion()}
          className='text-brand-accent hover:bg-brand-accent/10 border border-brand-accent/20'
        >
          <Plus className='size-4 mr-2' />
          {t('addFirstQuestion') || 'Add Question'}
        </Button>
      </div>
    );
  }

  const handleAdd = (index: number) => {
    addQuestion({}, index);
    setTimeout(() => {
      const el = document.getElementById(`question-card-${index}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: flash the card to indicate it's new?
      }
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
    >
      {/* Section Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-white font-semibold text-xl flex items-center gap-3'>
          <Sparkles className='size-6 text-brand-accent' />
          {t('questions') || 'Interview Questions'}
          <span className='size-7 rounded-full bg-brand-accent/20 text-brand-accent text-sm flex items-center justify-center font-bold'>
            {questions.length}
          </span>
        </h2>
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='sm'
            type='button'
            onClick={() => suggestQuestion()}
            className='text-brand-accent hover:bg-brand-accent/10 gap-2 border border-brand-accent/20'
          >
            <Wand2 className='size-4' />
            {t('suggestQuestion') || 'AI Suggestion'}
          </Button>
        </div>
      </div>

      {/* Question Cards */}
      <div className='space-y-2'>
        <AnimatePresence>
          {questions.map((q, index) => (
            <React.Fragment key={q.id}>
              <motion.div
                id={`question-card-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.05 }}
              >
                <QuestionCard question={q} index={index} />
              </motion.div>

              {/* Interstitial Add Button */}
              <div className='flex justify-center py-2'>
                <Button
                  size='sm'
                  variant='ghost'
                  type='button'
                  onClick={() => handleAdd(index + 1)}
                  className='rounded-full size-8 p-0 bg-white/5 hover:bg-brand-accent hover:text-white text-slate-500 transition-all'
                  title={t('addQuestion') || 'Add Question Below'}
                >
                  <Plus className='size-4' />
                </Button>
              </div>
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
