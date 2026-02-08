'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';

interface JobFormFieldsProps {
  formData: {
    title: string;
    description: string;
    notes: string;
  };
  onChange: (field: string, value: string) => void;
  onRefine: () => void;
  isRefining: boolean;
}

export function JobFormFields({
  formData,
  onChange,
  onRefine,
  isRefining,
}: JobFormFieldsProps) {
  const t = useTranslations('JobWizard');

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
          {t('jobTitle')}
        </Label>
        <Input
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder={t('titlePlaceholder')}
          className='bg-white/5 border-white/5 h-10 focus:border-brand-accent/30 focus:ring-brand-accent/10 transition-all'
        />
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
            {t('jobDescription')}
          </Label>
          <Button
            variant='ghost'
            size='sm'
            onClick={onRefine}
            disabled={isRefining || !formData.description}
            className='h-6 px-2 text-[10px] text-brand-accent hover:text-brand-accent hover:bg-brand-accent/10 gap-1.5'
          >
            <Sparkles
              className={`size-3 ${isRefining ? 'animate-pulse text-brand-accent/50' : ''}`}
            />
            {isRefining ? t('refining') : t('aiRefine')}
          </Button>
        </div>
        <Textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          className='bg-white/5 border-white/5 min-h-[160px] text-sm leading-relaxed focus:border-brand-accent/30 focus:ring-brand-accent/10 transition-all resize-none'
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
          {t('additionalNotes')}
        </Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder={t('notesPlaceholder')}
          className='bg-white/5 border-white/5 min-h-[80px] text-xs focus:border-brand-accent/30 focus:ring-brand-accent/10 transition-all'
        />
      </div>
    </div>
  );
}
