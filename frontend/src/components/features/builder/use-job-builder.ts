import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export interface AIQuestion {
  text: string;
  ideal_answer: string;
  time_limit: number;
  weight: number;
}

interface AIResponse {
  title: string;
  questions: AIQuestion[];
}

export function useJobBuilder() {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'ai' | 'manual' | 'hybrid' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateQuestionsWithAI = async () => {
    if (!description.trim()) {
      toast.error('Job description is required for AI generation');
      return;
    }

    setIsGenerating(true);
    try {
      const data = await apiFetch<AIResponse>('/jobs/analyze', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description }),
      });

      setTitle(data.title || title);
      setQuestions(data.questions);
      setStep(2);
      toast.success('AI successfully generated questions!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestSingleQuestion = async () => {
    if (!description.trim()) {
      toast.error('Provide a job description first so AI has context!');
      return;
    }

    setIsGenerating(true);
    try {
      // We can use the same endpoint but maybe with a hint to just give one new one
      // For now, let's assume the backend handles it or we pick one that's not already there
      const data = await apiFetch<AIResponse>('/jobs/analyze', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          existing_questions: questions.map((q) => q.text),
        }),
      });

      if (data.questions && data.questions.length > 0) {
        const newQuestion = data.questions[0];
        setQuestions([...questions, newQuestion]);
        toast.success('AI suggested a new question!');
      }
    } catch (error: any) {
      toast.error('AI could not suggest a question right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', ideal_answer: '', time_limit: 120, weight: 1 },
    ]);
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

  const saveJob = async () => {
    if (!title.trim()) {
      toast.error('Job title is required');
      return;
    }

    if (questions.length === 0) {
      toast.error('At least one question is required');
      return;
    }

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

  const startManualMode = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide a title and description first.');
      return;
    }
    setMode('manual');
    setStep(2);
    if (questions.length === 0) {
      addQuestion();
    }
  };

  const startAIMode = () => {
    generateQuestionsWithAI();
    setMode('ai');
  };

  return {
    // State
    step,
    mode,
    title,
    description,
    questions,
    isGenerating,
    isSaving,

    // Actions
    setStep,
    setTitle,
    setDescription,
    generateQuestionsWithAI,
    suggestSingleQuestion,
    addQuestion,
    updateQuestion,
    removeQuestion,
    saveJob,
    startManualMode,
    startAIMode,
  };
}
