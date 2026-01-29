'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Sparkles, Loader2 } from 'lucide-react';
import type { AIQuestion } from '../use-job-builder';

interface QuestionCardProps {
  question: AIQuestion;
  index: number;
  onUpdate: (field: keyof AIQuestion, value: any) => void;
  onRemove: () => void;
  jobDescription?: string;
}

export function QuestionCard({
  question,
  index,
  onUpdate,
  onRemove,
  jobDescription,
}: QuestionCardProps) {
  const t = useTranslations('JobWizard');
  const [isRefining, setIsRefining] = useState(false);

  // Future feature: Actually call AI to refine this specific question
  const handleAIRefine = async () => {
    if (!jobDescription) return;
    setIsRefining(true);
    // Placeholder for actual AI refinement logic
    setTimeout(() => setIsRefining(false), 1000);
  };

  return (
    <Card className='bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/[0.07] transition-all relative'>
      <CardContent className='p-6 space-y-4 text-white'>
        <div className='flex gap-4'>
          <div className='flex-1 space-y-4'>
            {/* Question Text */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-slate-400 text-xs font-medium uppercase tracking-wider'>
                  {t('questions')} {index + 1}
                </Label>
                <Button
                  onClick={handleAIRefine}
                  variant='ghost'
                  size='sm'
                  className='h-7 text-[10px] uppercase tracking-tighter text-brand-accent hover:bg-brand-accent/10 gap-1.5'
                >
                  {isRefining ? (
                    <Loader2 className='size-3 animate-spin' />
                  ) : (
                    <Sparkles className='size-3' />
                  )}
                  {t('btnRefine')}
                </Button>
              </div>
              <Textarea
                value={question.text}
                onChange={(e) => onUpdate('text', e.target.value)}
                placeholder='Enter your interview question...'
                className='bg-white/2 border-white/5 focus:border-brand-accent/50 focus:ring-brand-accent/20 text-white rounded-xl resize-none min-h-[80px] transition-all'
              />
            </div>

            {/* Ideal Answer */}
            <div className='space-y-2'>
              <Label className='text-slate-400 text-xs font-medium uppercase tracking-wider'>
                {t('idealAnswer')}
              </Label>
              <Textarea
                value={question.ideal_answer}
                onChange={(e) => onUpdate('ideal_answer', e.target.value)}
                placeholder='Describe what makes a great answer to this question...'
                className='bg-white/2 border-white/5 focus:border-brand-accent/50 focus:ring-brand-accent/20 text-white/70 rounded-xl resize-none min-h-[100px] transition-all'
              />
            </div>

            {/* Time Limit */}
            <div className='flex items-center gap-6'>
              <div className='flex items-center gap-2 bg-white/2 px-3 py-2 rounded-lg border border-white/5'>
                <Clock className='size-4 text-slate-500' />
                <Input
                  type='number'
                  value={question.time_limit === 0 ? '' : question.time_limit}
                  onChange={(e) => {
                    const val =
                      e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    onUpdate('time_limit', isNaN(val) ? 0 : val);
                  }}
                  onKeyDown={(e) => {
                    // Prevent "-", "+", ".", "e", "E" and allow only digits/control keys
                    if (['-', '+', '.', 'e', 'E'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder='0'
                  min={0}
                  max={3600}
                  className='bg-transparent border-0 w-20 p-0 h-auto text-sm text-white focus-visible:ring-0'
                />
                <span className='text-xs text-slate-500'>
                  {t('secondsUnit')}
                </span>
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <Button
            variant='ghost'
            size='icon'
            onClick={onRemove}
            className='text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors self-start'
          >
            <Trash2 className='size-5' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
