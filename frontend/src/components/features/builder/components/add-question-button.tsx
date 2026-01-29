'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AddQuestionButtonProps {
  onClick: () => void;
}

export function AddQuestionButton({ onClick }: AddQuestionButtonProps) {
  const t = useTranslations('JobWizard');

  return (
    <Button
      onClick={onClick}
      variant='outline'
      className='w-full h-16 border-2 border-dashed border-white/10 bg-white/2 hover:bg-white/5 hover:border-brand-accent/30 text-slate-400 hover:text-brand-accent transition-all rounded-2xl group'
    >
      <div className='flex items-center gap-3'>
        <div className='size-8 rounded-full bg-brand-accent/10 group-hover:bg-brand-accent/20 flex items-center justify-center transition-all'>
          <Plus className='size-5 text-brand-accent' />
        </div>
        <span className='font-medium'>{t('addQuestion')}</span>
      </div>
    </Button>
  );
}
