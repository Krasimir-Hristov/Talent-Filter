'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Loader2, Save, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  updateJob,
  refineJob,
  suggestQuestion,
  generateAnswer,
} from '@/lib/jobs-api';
import { Job, Question } from '@/types/job';
import { useParams } from 'next/navigation';
import { QuestionCard } from './question-card';
import { JobFormFields } from './job-form-sections';

interface EditJobSheetProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

type PartialQuestion = Omit<Question, 'id'> & { id?: string };

export function EditJobSheet({ job, isOpen, onClose }: EditJobSheetProps) {
  const { locale } = useParams();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    notes: job.notes || '',
  });
  const [questions, setQuestions] = useState<PartialQuestion[]>(
    job.questions || [],
  );

  useEffect(() => {
    setFormData({
      title: job.title,
      description: job.description,
      notes: job.notes || '',
    });
    setQuestions(job.questions || []);
  }, [job]);

  const updateMutation = useMutation({
    mutationFn: (
      data: Omit<Partial<Job>, 'questions'> & { questions?: PartialQuestion[] },
    ) => updateJob(job.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', job.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update job');
    },
  });

  const refineMutation = useMutation({
    mutationFn: () =>
      refineJob({
        description: formData.description,
        notes: formData.notes,
        locale: (locale as string) || 'en',
      }),
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        title: data.refined_title || prev.title,
        description: data.refined_description,
      }));
      toast.success('Description refined by AI');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'AI refinement failed');
    },
  });

  const suggestQuestionMutation = useMutation({
    mutationFn: () =>
      suggestQuestion({
        job_title: formData.title,
        job_description: formData.description,
        current_questions: questions.map((q) => q.text),
        notes: formData.notes,
        locale: (locale as string) || 'en',
      }),
    onSuccess: (newQuestion) => {
      setQuestions([newQuestion, ...questions]);
      toast.success('New question suggested by AI');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to suggest question');
    },
  });

  const generateAnswerMutation = useMutation({
    mutationFn: ({ index, text }: { index: number; text: string }) =>
      generateAnswer({
        job_title: formData.title,
        job_description: formData.description,
        question_text: text,
        locale: (locale as string) || 'en',
      }),
    onSuccess: (data, variables) => {
      handleUpdateQuestion(variables.index, 'ideal_answer', data.ideal_answer);
      toast.success('Ideal answer generated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate answer');
    },
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const hasEmptyQuestion = questions.some((q) => !q.text.trim());
    if (hasEmptyQuestion) {
      toast.error('All questions must have text');
      return;
    }

    updateMutation.mutate({ ...formData, questions });
  };

  const handleUpdateQuestion = (
    index: number,
    field: keyof PartialQuestion,
    value: any,
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value } as PartialQuestion;
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([
      { text: '', ideal_answer: '', time_limit: 120, weight: 5 },
      ...questions,
    ]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className='w-full sm:max-w-2xl bg-[#09090b] border-white/5 p-0 overflow-hidden flex flex-col'>
        <SheetHeader className='p-6 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl z-10'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <SheetTitle className='text-xl font-bold tracking-tight text-white flex items-center gap-2'>
                Edit Job Details
                <span className='px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent text-[10px] uppercase tracking-wider font-bold'>
                  Draft
                </span>
              </SheetTitle>
              <SheetDescription className='text-slate-500 text-sm'>
                Adjust the job description and interview criteria.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-6 custom-scrollbar'>
          <div className='space-y-8'>
            <JobFormFields
              formData={formData}
              onChange={(field, value) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
              onRefine={() => refineMutation.mutate()}
              isRefining={refineMutation.isPending}
            />

            <Separator className='bg-white/5' />

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <h3 className='text-sm font-semibold text-white'>
                    Interview Questions
                  </h3>
                  <p className='text-[10px] text-slate-500 uppercase tracking-widest'>
                    {questions.length} Questions Defined
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => suggestQuestionMutation.mutate()}
                    disabled={
                      suggestQuestionMutation.isPending || !formData.description
                    }
                    className='h-8 bg-white/5 border-white/5 hover:bg-white/10 text-xs gap-1.5'
                  >
                    {suggestQuestionMutation.isPending ? (
                      <Loader2 className='size-3 animate-spin' />
                    ) : (
                      <Sparkles className='size-3 text-brand-accent' />
                    )}
                    AI Suggest
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleAddQuestion}
                    className='h-8 bg-white/5 border-white/5 hover:bg-white/10 text-xs gap-1.5'
                  >
                    <Plus className='size-3' />
                    Add Manual
                  </Button>
                </div>
              </div>

              <div className='space-y-4'>
                {questions.map((q, idx) => (
                  <QuestionCard
                    key={q.id || `new-${idx}`}
                    question={q}
                    index={idx}
                    onUpdate={handleUpdateQuestion}
                    onRemove={(i) =>
                      setQuestions(questions.filter((_, idx) => idx !== i))
                    }
                    onSuggestAnswer={(i) =>
                      generateAnswerMutation.mutate({
                        index: i,
                        text: questions[i].text,
                      })
                    }
                    isSuggestingAnswer={
                      generateAnswerMutation.isPending &&
                      generateAnswerMutation.variables?.index === idx
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className='p-6 border-t border-white/5 bg-[#09090b]/80 backdrop-blur-xl shrink-0'>
          <div className='flex items-center justify-between w-full gap-4'>
            <Button
              variant='ghost'
              onClick={onClose}
              className='text-slate-400 hover:text-white hover:bg-white/5 px-6'
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className='bg-brand-accent hover:bg-brand-accent/90 text-black font-bold px-8 shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.3)]'
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='mr-2 size-4' />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
