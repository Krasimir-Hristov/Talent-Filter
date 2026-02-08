'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Loader2,
  Save,
  X,
  Trash2,
  Plus,
  RotateCcw,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { updateJob, refineJob, suggestQuestion } from '@/lib/jobs-api';
import { Job, Question } from '@/types/job';
import { useParams } from 'next/navigation';

interface EditJobSheetProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

type PartialQuestion = Omit<Question, 'id'> & { id?: string };

export function EditJobSheet({ job, isOpen, onClose }: EditJobSheetProps) {
  const t = useTranslations('Dashboard');
  const wizardT = useTranslations('JobWizard');
  const queryClient = useQueryClient();
  const { locale } = useParams();

  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    notes: job.notes || '',
  });

  const [questions, setQuestions] = useState<PartialQuestion[]>(
    job.questions || [],
  );

  // Sync state if job changes
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

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    // Validate questions
    const hasEmptyQuestion = questions.some((q) => !q.text.trim());
    if (hasEmptyQuestion) {
      toast.error('All questions must have text');
      return;
    }

    updateMutation.mutate({ ...formData, questions });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
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
      {
        text: '',
        ideal_answer: '',
        time_limit: 120,
        weight: 5,
      },
      ...questions,
    ]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className='sm:max-w-xl bg-[#0a0a0a] border-white/10 text-white overflow-y-auto'
        side='right'
      >
        <SheetHeader className='space-y-4 mb-8'>
          <SheetTitle className='text-2xl font-bold flex items-center gap-2 text-white'>
            <div className='size-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent'>
              <Save className='size-5' />
            </div>
            Edit Job Position
          </SheetTitle>
          <SheetDescription className='text-slate-400'>
            Update the title, description, and internal notes for this position.
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-6 py-4'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title' className='text-sm font-semibold'>
              Job Title
            </Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder='e.g. Senior Frontend Engineer'
              className='bg-white/5 border-white/10 text-white focus:border-brand-accent/50 focus:ring-brand-accent/20'
            />
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <div className='flex justify-between items-end'>
              <Label htmlFor='description' className='text-sm font-semibold'>
                Job Description
              </Label>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => refineMutation.mutate()}
                disabled={refineMutation.isPending || !formData.description}
                className={`h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5 transition-all
                  ${
                    refineMutation.isPending
                      ? 'text-slate-500 bg-white/5'
                      : 'text-brand-accent hover:text-brand-accent hover:bg-brand-accent/10'
                  }`}
              >
                {refineMutation.isPending ? (
                  <Loader2 className='size-3 animate-spin' />
                ) : (
                  <Sparkles className='size-3' />
                )}
                {refineMutation.isPending ? 'Refining...' : 'AI Refine'}
              </Button>
            </div>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='Describe the role...'
              className='bg-white/5 border-white/10 text-white focus:border-brand-accent/50 focus:ring-brand-accent/20 min-h-[200px] leading-relaxed'
            />
          </div>

          {/* Notes */}
          <div className='space-y-2'>
            <Label htmlFor='notes' className='text-sm font-semibold'>
              Internal Notes
            </Label>
            <Textarea
              id='notes'
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder='Internal context, team specifics...'
              className='bg-white/5 border-white/10 text-white focus:border-brand-accent/50 focus:ring-brand-accent/20 min-h-[100px]'
            />
          </div>

          <Separator className='bg-white/5' />

          {/* Questions Section */}
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <Label className='text-sm font-semibold flex items-center gap-2'>
                Interview Questions
                <span className='size-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] border border-white/5'>
                  {questions.length}
                </span>
              </Label>
              <div className='flex gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => suggestQuestionMutation.mutate()}
                  disabled={
                    suggestQuestionMutation.isPending || !formData.description
                  }
                  className='h-8 text-[10px] font-bold uppercase tracking-wider text-brand-accent hover:text-white hover:bg-brand-accent/20 gap-1.5'
                >
                  {suggestQuestionMutation.isPending ? (
                    <Loader2 className='size-3 animate-spin' />
                  ) : (
                    <Sparkles className='size-3' />
                  )}
                  AI Suggest
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleAddQuestion}
                  className='h-8 text-[10px] font-bold uppercase tracking-wider bg-white/5 border-white/10 hover:bg-white/10 text-white gap-1.5'
                >
                  <Plus className='size-3' />
                  Add Manual
                </Button>
              </div>
            </div>

            <div className='space-y-4 pb-10'>
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className='p-4 rounded-xl border border-white/10 bg-white/2 space-y-4 group relative'
                >
                  <div className='flex justify-between gap-4'>
                    <div className='flex-none size-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-white/5'>
                      {idx + 1}
                    </div>
                    <div className='flex-1 space-y-1'>
                      <div className='flex items-center gap-1 mb-1'>
                        <span className='text-[10px] font-bold uppercase tracking-widest text-[#666]'>
                          Question Text
                        </span>
                        <span className='text-red-500 text-[10px]'>*</span>
                      </div>
                      <Textarea
                        value={q.text}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, 'text', e.target.value)
                        }
                        placeholder='Type your question here...'
                        className={`bg-transparent border-none p-0 focus-visible:ring-0 text-sm h-auto min-h-[40px] resize-none transition-colors
                        ${!q.text.trim() ? 'text-red-400 placeholder:text-red-900/50' : 'text-white'}`}
                      />
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveQuestion(idx)}
                      className='size-8 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                      Ideal Answer
                    </Label>
                    <Textarea
                      value={q.ideal_answer}
                      onChange={(e) =>
                        handleUpdateQuestion(
                          idx,
                          'ideal_answer',
                          e.target.value,
                        )
                      }
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
                          isNaN(q.time_limit as number) ? '' : q.time_limit
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          handleUpdateQuestion(
                            idx,
                            'time_limit',
                            isNaN(val) ? 0 : val,
                          );
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
                        min={1}
                        max={10}
                        value={isNaN(q.weight as number) ? '' : q.weight}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          handleUpdateQuestion(
                            idx,
                            'weight',
                            isNaN(val) ? 0 : val,
                          );
                        }}
                        className='bg-white/5 border-white/5 h-8 text-xs'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className='mt-8 pt-6 border-t border-white/5 gap-3'>
          <Button
            variant='ghost'
            onClick={onClose}
            className='text-slate-400 hover:text-white hover:bg-white/5'
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className='bg-brand-accent hover:bg-brand-accent/90 text-white gap-2 shadow-lg shadow-brand-accent/20 px-8'
          >
            {updateMutation.isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Save className='size-4' />
            )}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
