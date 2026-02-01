'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus, Sparkles, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useJobBuilderStore } from '@/store/useJobBuilderStore';
import { QuestionCard } from './QuestionCard';
import { useJobBuilderActions } from '../hooks/useJobBuilderActions';

export function QuestionList() {
  const t = useTranslations('JobWizard');
  const { questions, hasGenerated, addQuestion } = useJobBuilderStore();
  const { suggestQuestion } = useJobBuilderActions();

  if (!hasGenerated || questions.length === 0) {
    return null;
  }

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
          <Button
            variant='ghost'
            size='sm'
            type='button'
            onClick={() => addQuestion()}
            className='text-slate-400 hover:text-white hover:bg-white/5 gap-2'
          >
            <Plus className='size-4' />
            {t('addQuestion') || 'Add Question'}
          </Button>
        </div>
      </div>

      {/* Question Cards */}
      <div className='space-y-4'>
        <AnimatePresence>
          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <QuestionCard question={q} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
