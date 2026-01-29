'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Plus,
  Sparkles,
  Trash2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

interface AIQuestion {
  text: string;
  ideal_answer: string;
  time_limit: number;
  weight: number;
}

interface AIResponse {
  title: string;
  questions: AIQuestion[];
}

export function JobCreationWizard() {
  const t = useTranslations('JobWizard');
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!description.trim()) {
      toast.error(t('validation.required') || 'Description is required');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiFetch<AIResponse>('/jobs/analyze', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description }),
      });

      setTitle(data.title);
      setQuestions(data.questions);
      setStep(2);
      toast.success('AI successfully generated questions!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async () => {
    setIsSaving(true);
    try {
      await apiFetch('/jobs/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          questions,
        }),
      });

      toast.success('Job created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof AIQuestion,
    value: any,
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    toast.info('Question removed');
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', ideal_answer: '', time_limit: 120, weight: 1 },
    ]);
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-8 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {[1, 2].map((i) => (
            <div key={i} className='flex items-center'>
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= i
                    ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20'
                    : 'bg-white/5 text-slate-500 border border-white/10'
                }`}
              >
                {step > i ? <CheckCircle2 className='size-6' /> : i}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${step > i ? 'bg-brand-accent' : 'bg-white/10'}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className='text-right'>
          <h2 className='text-white font-semibold'>{t(`step${step}`)}</h2>
          <p className='text-slate-400 text-sm'>Step {step} of 2</p>
        </div>
      </div>

      <AnimatePresence mode='wait'>
        {step === 1 ? (
          <motion.div
            key='step1'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='space-y-6'
          >
            <div className='bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl'>
              <Label className='text-slate-300 text-sm font-medium uppercase tracking-wider mb-4 block'>
                {t('jobDescription')}
              </Label>
              <Textarea
                placeholder={t('placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='min-h-[300px] bg-white/2 border-white/5 focus:border-brand-accent/50 focus:ring-brand-accent/20 text-white rounded-2xl p-6 transition-all'
              />
              <div className='mt-8 flex justify-end'>
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={isLoading || !description.trim()}
                  className='bg-linear-to-r from-brand-accent to-brand-glow text-white px-8 h-12 rounded-xl shadow-lg shadow-brand-accent/20 gap-2 overflow-hidden group'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='size-5 animate-spin' />
                      {t('btnRefining')}
                    </>
                  ) : (
                    <>
                      <Sparkles className='size-5 transition-transform group-hover:rotate-12' />
                      {t('btnGenerate')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key='step2'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='space-y-6'
          >
            <div className='flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl'>
              <div className='flex-1'>
                <Label className='text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 block'>
                  {t('jobTitle')}
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='bg-transparent border-0 text-xl font-bold text-white p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto'
                />
              </div>
              <Button
                variant='outline'
                onClick={() => setStep(1)}
                className='border-white/10 text-slate-300 hover:bg-white/5 h-12 rounded-xl'
              >
                <ChevronLeft className='size-4 mr-2' />
                Back
              </Button>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-white font-semibold flex items-center gap-2'>
                  <Sparkles className='size-5 text-brand-accent' />
                  {t('questions')}
                  <span className='size-6 rounded-full bg-brand-accent/20 text-brand-accent text-xs flex items-center justify-center font-bold'>
                    {questions.length}
                  </span>
                </h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={addQuestion}
                  className='text-brand-accent hover:bg-brand-accent/10'
                >
                  <Plus className='size-4 mr-1' />
                  {t('addQuestion')}
                </Button>
              </div>

              {questions.map((q, index) => (
                <Card
                  key={index}
                  className='bg-white/5 border-white/10 border-0 rounded-2xl overflow-hidden group'
                >
                  <CardContent className='p-6 space-y-4'>
                    <div className='flex gap-4'>
                      <div className='flex-1 space-y-4'>
                        <div className='space-y-2'>
                          <Label className='text-slate-400 text-xs'>
                            {t('questions')} {index + 1}
                          </Label>
                          <Textarea
                            value={q.text}
                            onChange={(e) =>
                              updateQuestion(index, 'text', e.target.value)
                            }
                            className='bg-white/2 border-white/5 focus:border-brand-accent/50 text-white rounded-xl resize-none'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label className='text-slate-400 text-xs'>
                            {t('idealAnswer')}
                          </Label>
                          <Textarea
                            value={q.ideal_answer}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                'ideal_answer',
                                e.target.value,
                              )
                            }
                            className='bg-white/2 border-white/5 focus:border-brand-accent/50 text-white/70 rounded-xl resize-none min-h-[100px]'
                          />
                        </div>
                        <div className='flex items-center gap-6'>
                          <div className='flex items-center gap-2 bg-white/2 px-3 py-2 rounded-lg border border-white/5'>
                            <Clock className='size-4 text-slate-500' />
                            <Input
                              type='number'
                              value={q.time_limit}
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  'time_limit',
                                  parseInt(e.target.value),
                                )
                              }
                              className='bg-transparent border-0 w-20 p-0 h-auto text-sm text-white focus-visible:ring-0'
                            />
                            <span className='text-xs text-slate-500'>sec</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => removeQuestion(index)}
                        className='text-slate-600 hover:text-red-400 hover:bg-red-400/10'
                      >
                        <Trash2 className='size-5' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='pt-6 flex justify-end'>
              <Button
                onClick={handleSaveJob}
                disabled={isSaving || questions.length === 0}
                className='bg-brand-accent hover:bg-brand-accent/90 text-white px-10 h-14 rounded-xl shadow-xl shadow-brand-accent/20 gap-3 text-lg font-bold'
              >
                {isSaving ? (
                  <>
                    <Loader2 className='size-6 animate-spin' />
                    {t('btnSaving')}
                  </>
                ) : (
                  <>
                    {t('btnSave')}
                    <ChevronRight className='size-6' />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
