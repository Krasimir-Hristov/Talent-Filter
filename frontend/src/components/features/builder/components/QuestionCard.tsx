'use client';

import { useTranslations } from 'next-intl';
import { Trash2, Clock, Wand2, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import type { ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useJobBuilderStore, type Question } from '@/store/useJobBuilderStore';
import { useJobBuilderActions } from '../hooks/useJobBuilderActions';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const t = useTranslations('JobWizard');
  const { updateQuestion, removeQuestion } = useJobBuilderStore();
  const { generateAnswer, fillSmartQuestion } = useJobBuilderActions();
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);

  const handleUpdate = (
    field: keyof Omit<Question, 'id'>,
    value: string | number,
  ) => {
    updateQuestion(question.id, { [field]: value });
  };

  const handleGenerateClick = async () => {
    setIsGeneratingAnswer(true);
    if (!question.text.trim()) {
      await fillSmartQuestion(question.id);
    } else {
      await generateAnswer(question.id, question.text);
    }
    setIsGeneratingAnswer(false);
  };

  return (
    <Card className='bg-white/5 border-white/10 hover:border-white/20 transition-all group'>
      <CardContent className='p-6 space-y-4'>
        <div className='flex gap-4'>
          <div className='flex-1 space-y-4'>
            {/* Question Text */}
            <div className='space-y-3'>
              <Label className='text-slate-300 text-sm font-medium pl-1'>
                {t('question') || 'Question'} {index + 1}
              </Label>
              <Textarea
                value={question.text}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleUpdate('text', e.target.value)
                }
                className='bg-white/5 border-white/10 focus:border-brand-accent/50 text-white text-base leading-relaxed rounded-xl resize-none min-h-[90px] p-4 placeholder:text-slate-500'
                placeholder={
                  t('questionPlaceholder') || 'Enter your question...'
                }
              />
            </div>

            {/* Ideal Answer */}
            <div className='space-y-3 pt-2'>
              <Label className='text-slate-300 text-sm font-medium pl-1 flex items-center justify-between'>
                <span>
                  {t('idealAnswer') || 'Ideal Answer / Evaluation Criteria'}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  type='button'
                  onClick={handleGenerateClick}
                  disabled={isGeneratingAnswer}
                  className='h-7 text-xs font-medium text-brand-accent hover:bg-brand-accent/10 hover:text-brand-accent gap-1.5 px-3 rounded-full border border-brand-accent/20 transition-all'
                >
                  {isGeneratingAnswer ? (
                    <Loader2 className='size-3.5 animate-spin' />
                  ) : (
                    <Wand2 className='size-3.5' />
                  )}
                  {!question.text.trim()
                    ? t('autoFill') || 'Smart Auto-Fill'
                    : t('generate') || 'Generate Answer'}
                </Button>
              </Label>
              <Textarea
                value={question.ideal_answer}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleUpdate('ideal_answer', e.target.value)
                }
                className='bg-white/5 border-white/10 focus:border-brand-accent/50 text-slate-200 text-sm leading-relaxed rounded-xl resize-none min-h-[110px] p-4 placeholder:text-slate-500'
                placeholder={
                  t('answerPlaceholder') || 'What should a good answer include?'
                }
              />
            </div>

            {/* Time & Weight */}
            <div className='flex items-center gap-6 pt-2'>
              <div className='flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors'>
                <Clock className='size-4 text-slate-400' />
                <Input
                  type='number'
                  value={question.time_limit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleUpdate('time_limit', parseInt(e.target.value) || 0)
                  }
                  className='bg-transparent border-0 w-16 p-0 h-auto text-base font-medium text-white focus-visible:ring-0 text-center'
                />
                <span className='text-sm text-slate-400 font-medium'>sec</span>
              </div>
              <div className='flex items-center gap-3'>
                <Label className='text-slate-400 text-sm font-medium'>
                  {t('weight') || 'Weight'}:
                </Label>
                <Input
                  type='number'
                  min='1'
                  max='10'
                  value={question.weight}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    let val = parseInt(e.target.value) || 1;
                    if (val > 10) val = 10;
                    if (val < 1) val = 1;
                    handleUpdate('weight', val);
                  }}
                  className='bg-white/5 border-white/10 w-16 h-10 text-center text-base font-medium text-white rounded-lg focus-visible:ring-brand-accent/50'
                />
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <Button
            variant='ghost'
            size='icon'
            type='button'
            onClick={() => removeQuestion(question.id)}
            className='text-slate-600 hover:text-red-400 hover:bg-red-400/10 self-start'
          >
            <Trash2 className='size-5' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
