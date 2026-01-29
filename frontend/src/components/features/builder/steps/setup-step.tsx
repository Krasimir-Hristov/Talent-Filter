'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles, FileText, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SetupStepProps {
  mode: 'ai' | 'manual' | 'hybrid' | null;
  title: string;
  description: string;
  isGenerating: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartAI: () => void;
  onStartManual: () => void;
}

export function SetupStep({
  title,
  description,
  isGenerating,
  onTitleChange,
  onDescriptionChange,
  onStartAI,
  onStartManual,
}: SetupStepProps) {
  const t = useTranslations('JobWizard');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-8'
    >
      {/* Form Section */}
      <div className='bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl space-y-6'>
        <div className='flex items-center gap-3 pb-2 border-b border-white/5'>
          <div className='size-8 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-accent'>
            <Info className='size-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-white'>{t('step1Detail')}</h3>
            <p className='text-slate-400 text-sm'>{t('description')}</p>
          </div>
        </div>

        {/* Job Title */}
        <div className='space-y-2'>
          <Label className='text-slate-300 text-sm font-medium uppercase tracking-wider'>
            {t('jobTitle')}
          </Label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder='e.g. Senior Frontend Developer'
            className='bg-white/2 border-white/5 focus:border-brand-accent/50 focus:ring-brand-accent/20 text-white rounded-xl h-12 px-4 transition-all placeholder:text-slate-600'
          />
        </div>

        {/* Job Description */}
        <div className='space-y-2'>
          <Label className='text-slate-300 text-sm font-medium uppercase tracking-wider'>
            {t('jobDescription')}
          </Label>
          <Textarea
            placeholder={t('placeholder')}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className='min-h-[250px] bg-white/2 border-white/5 focus:border-brand-accent/50 focus:ring-brand-accent/20 text-white rounded-2xl p-6 transition-all placeholder:text-slate-600'
          />
        </div>
      </div>

      {/* Validation Message */}
      <AnimatePresence>
        {(!title.trim() || !description.trim()) && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className='flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-sm'
          >
            <Sparkles className='size-4 text-amber-500' />
            <p>{t('validationDetails')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choice Section */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* AI Mode */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartAI}
          disabled={isGenerating || !description.trim() || !title.trim()}
          className='relative p-8 rounded-3xl bg-linear-to-br from-brand-accent/10 to-brand-glow/10 border-2 border-brand-accent/20 hover:border-brand-accent/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left group overflow-hidden'
        >
          <div className='absolute inset-0 bg-linear-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
          <div className='relative z-10'>
            <div className='size-14 rounded-2xl bg-linear-to-br from-brand-accent to-brand-glow flex items-center justify-center mb-4 shadow-xl shadow-brand-accent/20 transition-transform group-hover:rotate-6'>
              {isGenerating ? (
                <Loader2 className='size-7 text-white animate-spin' />
              ) : (
                <Sparkles className='size-7 text-white' />
              )}
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              {t('btnGenerate')}
            </h3>
            <p className='text-slate-400 text-sm leading-relaxed'>
              Use AI to analyze your description and generate optimal interview
              questions instantly.
            </p>
          </div>
        </motion.button>

        {/* Manual Mode */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartManual}
          disabled={isGenerating || !description.trim() || !title.trim()}
          className='relative p-8 rounded-3xl bg-white/5 border-2 border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left group overflow-hidden'
        >
          <div className='absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity' />
          <div className='relative z-10'>
            <div className='size-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4 transition-transform group-hover:-rotate-6'>
              <FileText className='size-7 text-slate-300' />
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              {t('createManually')}
            </h3>
            <p className='text-slate-400 text-sm leading-relaxed'>
              Skip AI and start adding your own specific questions one by one.
            </p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
