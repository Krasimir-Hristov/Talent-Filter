'use client';

import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Question } from '@/types/job';

type PartialQuestion = Omit<Question, 'id'> & { id?: string };

interface QuestionCardProps {
  question: PartialQuestion;
  index: number;
  onUpdate: (index: number, field: keyof PartialQuestion, value: any) => void;
  onRemove: (index: number) => void;
  onSuggestAnswer: (index: number) => void;
  isSuggestingAnswer?: boolean;
}

export function QuestionCard({
  question,
  index,
  onUpdate,
  onRemove,
  onSuggestAnswer,
  isSuggestingAnswer,
}: QuestionCardProps) {
  return (
    <div className='group relative p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-brand-accent/20 transition-all space-y-4'>
      <div className='flex items-start justify-between'>
        <div className='flex-none size-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-white/5'>
          {index + 1}
        </div>
        <div className='flex-1 ml-3 space-y-1'>
          <div className='flex items-center gap-1 mb-1'>
            <span className='text-[10px] font-bold uppercase tracking-widest text-[#666]'>
              Question Text
            </span>
            <span className='text-red-500 text-[10px]'>*</span>
          </div>
          <Textarea
            value={question.text}
            onChange={(e) => onUpdate(index, 'text', e.target.value)}
            placeholder='Type your question here...'
            className={`bg-transparent border-none p-0 focus-visible:ring-0 text-sm h-auto min-h-[40px] resize-none transition-colors
            ${!question.text.trim() ? 'text-red-400 placeholder:text-red-900/50' : 'text-white'}`}
          />
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => onRemove(index)}
          className='size-8 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'
        >
          <Trash2 className='size-4' />
        </Button>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
            Ideal Answer
          </Label>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onSuggestAnswer(index)}
            disabled={isSuggestingAnswer || !question.text.trim()}
            className='h-6 px-2 text-[10px] text-brand-accent hover:text-brand-accent hover:bg-brand-accent/10 gap-1.5'
          >
            <RotateCcw
              className={`size-3 ${isSuggestingAnswer ? 'animate-spin' : ''}`}
            />
            {isSuggestingAnswer ? 'Generating...' : 'Regenerate'}
          </Button>
        </div>
        <Textarea
          value={question.ideal_answer}
          onChange={(e) => onUpdate(index, 'ideal_answer', e.target.value)}
          className='bg-white/5 border-white/5 text-xs min-h-[60px] focus:border-brand-accent/30 focus:ring-brand-accent/10 transition-all'
        />
      </div>

      <div className='flex gap-4'>
        <div className='flex-1 space-y-1.5'>
          <Label className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
            Time Limit (s)
          </Label>
          <Input
            type='number'
            value={
              isNaN(question.time_limit as number) ? '' : question.time_limit
            }
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onUpdate(index, 'time_limit', isNaN(val) ? 0 : val);
            }}
            className='bg-white/5 border-white/5 h-8 text-xs'
          />
        </div>
        <div className='flex-1 space-y-1.5'>
          <Label className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
            Weight (1-10)
          </Label>
          <Input
            type='number'
            min={0}
            max={10}
            value={isNaN(question.weight as number) ? '' : question.weight}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onUpdate(index, 'weight', isNaN(val) ? 0 : val);
            }}
            className='bg-white/5 border-white/5 h-8 text-xs'
          />
        </div>
      </div>
    </div>
  );
}
