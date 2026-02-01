'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useJobBuilderStore } from '@/store/useJobBuilderStore';

interface JobInputFormProps {
  onGenerate: () => Promise<void>;
}

export function JobInputForm({ onGenerate }: JobInputFormProps) {
  const t = useTranslations('JobWizard');

  const {
    title,
    description,
    notes,
    hasGenerated,
    isGenerating,
    setTitle,
    setDescription,
    setNotes,
    canGenerate,
  } = useJobBuilderStore();

  const handleGenerateClick = async () => {
    await onGenerate();
  };

  return (
    <Card className='bg-white/5 border-white/10 backdrop-blur-xl'>
      <CardContent className='p-8 space-y-6'>
        {/* Job Title */}
        <div className='space-y-2'>
          <Label className='text-slate-300 text-sm font-medium uppercase tracking-wider'>
            {t('jobTitle') || 'Job Title'}{' '}
            <span className='text-red-400'>*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              t('titlePlaceholder') || 'e.g., Senior React Developer'
            }
            className='bg-white/5 border-white/10 focus:border-brand-accent/50 text-white text-lg h-12 rounded-xl'
            disabled={hasGenerated}
          />
        </div>

        {/* Job Description */}
        <div className='space-y-2'>
          <Label className='text-slate-300 text-sm font-medium uppercase tracking-wider'>
            {t('jobDescription') || 'Job Description'}{' '}
            <span className='text-red-400'>*</span>
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              t('descriptionPlaceholder') ||
              'Describe the role, required skills, responsibilities...'
            }
            className='min-h-[200px] bg-white/5 border-white/10 focus:border-brand-accent/50 text-white rounded-xl resize-none'
            disabled={hasGenerated}
          />
        </div>

        {/* Additional Notes */}
        <div className='space-y-2'>
          <Label className='text-slate-300 text-sm font-medium uppercase tracking-wider'>
            {t('additionalNotes') || 'Additional Notes (Optional)'}
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              t('notesPlaceholder') ||
              'Any specific instructions for the AI? (e.g., "Focus on soft skills")'
            }
            className='min-h-[100px] bg-white/5 border-white/10 focus:border-brand-accent/50 text-white/70 rounded-xl resize-none'
            disabled={hasGenerated}
          />
        </div>

        {/* Generate Button - Only visible before generation */}
        {!hasGenerated && (
          <div className='pt-4'>
            <Button
              type='button'
              onClick={handleGenerateClick}
              disabled={!canGenerate()}
              className='w-full bg-linear-to-r from-brand-accent to-brand-glow text-white h-14 rounded-xl shadow-lg shadow-brand-accent/20 gap-3 text-lg font-bold group'
            >
              {isGenerating ? (
                <>
                  <Loader2 className='size-6 animate-spin' />
                  {t('generating') || 'Generating Interview...'}
                </>
              ) : (
                <>
                  <Sparkles className='size-6 transition-transform group-hover:rotate-12' />
                  {t('generate') || 'Generate Smart Interview'}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
