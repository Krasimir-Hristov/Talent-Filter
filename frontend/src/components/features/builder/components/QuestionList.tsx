'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useJobBuilderStore } from '@/store/useJobBuilderStore';
import { QuestionCard } from './QuestionCard';

export function QuestionList() {
  const t = useTranslations('JobWizard');
  const { questions, hasGenerated, addQuestion } = useJobBuilderStore();

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
        <Button
          variant='ghost'
          size='sm'
          type='button'
          onClick={() => addQuestion()}
          className='text-brand-accent hover:bg-brand-accent/10 gap-2'
        >
          <Plus className='size-4' />
          {t('addQuestion') || 'Add Question'}
        </Button>
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
