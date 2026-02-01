'use client';

import { useTranslations } from 'next-intl';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useJobBuilderStore } from '@/store/useJobBuilderStore';

export function ActionBar() {
  const t = useTranslations('JobWizard');
  const { hasGenerated, isSaving, canSave, reset } = useJobBuilderStore();

  if (!hasGenerated) {
    return null;
  }

  return (
    <div className='pt-6 flex justify-end gap-4'>
      <Button
        variant='outline'
        type='button'
        onClick={reset}
        className='border-white/10 text-slate-300 hover:bg-white/5 h-12 px-6 rounded-xl'
      >
        {t('startOver') || 'Start Over'}
      </Button>
      <Button
        type='submit'
        disabled={!canSave()}
        className='bg-brand-accent hover:bg-brand-accent/90 text-white px-10 h-12 rounded-xl shadow-xl shadow-brand-accent/20 gap-3 text-base font-bold'
      >
        {isSaving ? (
          <>
            <Loader2 className='size-5 animate-spin' />
            {t('saving') || 'Saving...'}
          </>
        ) : (
          <>
            <Save className='size-5' />
            {t('save') || 'Save Interview'}
          </>
        )}
      </Button>
    </div>
  );
}
