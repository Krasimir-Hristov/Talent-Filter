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
            <div className='space-y-2'>
              <Label className='text-slate-400 text-xs'>
                {t('question') || 'Question'} {index + 1}
              </Label>
              <Textarea
                value={question.text}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleUpdate('text', e.target.value)
                }
                className='bg-white/5 border-white/10 focus:border-brand-accent/50 text-white rounded-xl resize-none min-h-[80px]'
                placeholder={
                  t('questionPlaceholder') || 'Enter your question...'
                }
              />
            </div>

            {/* Ideal Answer */}
            <div className='space-y-2'>
              <Label className='text-slate-400 text-xs flex items-center justify-between'>
                <span>
                  {t('idealAnswer') || 'Ideal Answer / Evaluation Criteria'}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  type='button'
                  onClick={handleGenerateClick}
                  disabled={isGeneratingAnswer}
                  className='h-6 text-xs text-brand-accent hover:bg-brand-accent/10 gap-1'
                >
                  {isGeneratingAnswer ? (
                    <Loader2 className='size-3 animate-spin' />
                  ) : (
                    <Wand2 className='size-3' />
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
                className='bg-white/5 border-white/10 focus:border-brand-accent/50 text-white/70 rounded-xl resize-none min-h-[100px]'
                placeholder={
                  t('answerPlaceholder') || 'What should a good answer include?'
                }
              />
            </div>

            {/* Time & Weight */}
            <div className='flex items-center gap-6'>
              <div className='flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10'>
                <Clock className='size-4 text-slate-500' />
                <Input
                  type='number'
                  value={question.time_limit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleUpdate('time_limit', parseInt(e.target.value) || 0)
                  }
                  className='bg-transparent border-0 w-16 p-0 h-auto text-sm text-white focus-visible:ring-0'
                />
                <span className='text-xs text-slate-500'>sec</span>
              </div>
              <div className='flex items-center gap-2'>
                <Label className='text-slate-500 text-xs'>
                  {t('weight') || 'Weight'}:
                </Label>
                <Input
                  type='number'
                  min='1'
                  max='5'
                  value={question.weight}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleUpdate('weight', parseInt(e.target.value) || 1)
                  }
                  className='bg-white/5 border-white/10 w-16 h-8 text-center text-white rounded-lg'
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
