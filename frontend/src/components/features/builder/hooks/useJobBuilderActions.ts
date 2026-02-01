import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';

import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useJobBuilderStore, type Question } from '@/store/useJobBuilderStore';

interface AIResponse {
  title: string;
  questions: Array<Omit<Question, 'id'>>;
}

export function useJobBuilderActions() {
  const t = useTranslations('JobWizard');
  const router = useRouter();
  const locale = useLocale();
  const token = useAuthStore((state: any) => state.accessToken);

  const {
    title,
    description,
    notes,
    questions,
    setTitle,
    setQuestions,
    addQuestion,
    updateQuestion,
    setIsGenerating,
    setIsSaving,
    setHasGenerated,
    canGenerate,
    canSave,
  } = useJobBuilderStore();

  const generateInterview = async () => {
    if (!canGenerate()) {
      toast.error(
        t('validation.titleRequired') || 'Please fill all required fields',
      );
      return;
    }

    setIsGenerating(true);
    try {
      const data = await apiFetch<AIResponse>('/jobs/analyze', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          notes: notes.trim() || undefined,
          locale,
        }),
      });

      // Add unique IDs to questions
      const questionsWithIds: Question[] = data.questions.map(
        (q: Omit<Question, 'id'>, idx: number) => ({
          ...q,
          id: `q-${Date.now()}-${idx}`,
        }),
      );

      // If AI suggested a title and user didn't provide one, use it
      if (!title.trim() && data.title) {
        setTitle(data.title);
      }

      setQuestions(questionsWithIds);
      setHasGenerated(true);
      toast.success(
        t('success.generated') || 'Interview generated successfully!',
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate interview');
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestQuestion = async () => {
    try {
      const data = await apiFetch<Omit<Question, 'id'>>(
        '/jobs/suggest-question',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_title: title,
            job_description: description,
            current_questions: questions.map((q) => q.text),
            notes: notes.trim() || undefined,
            locale,
          }),
        },
      );

      addQuestion(data);
      toast.success('New question suggested!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to suggest question');
    }
  };

  const generateAnswer = async (questionId: string, questionText: string) => {
    try {
      const data = await apiFetch<{ ideal_answer: string }>(
        '/jobs/generate-answer',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_title: title,
            job_description: description,
            question_text: questionText,
            locale,
          }),
        },
      );

      updateQuestion(questionId, { ideal_answer: data.ideal_answer });
      toast.success('Answer generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate answer');
    }
  };

  const fillSmartQuestion = async (questionId: string) => {
    try {
      // Get all OTHER questions to avoid duplicates
      const otherQuestions = questions
        .filter((q) => q.id !== questionId)
        .map((q) => q.text)
        .filter(Boolean);

      const data = await apiFetch<Omit<Question, 'id'>>(
        '/jobs/suggest-question',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_title: title,
            job_description: description,
            current_questions: otherQuestions,
            notes: notes.trim() || undefined,
            locale,
          }),
        },
      );

      // Update the specific question with the AI result
      updateQuestion(questionId, data);
      toast.success('Question auto-filled!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to suggest question');
    }
  };

  const saveJob = async () => {
    if (!canSave()) {
      toast.error('Please generate questions before saving');
      return;
    }

    setIsSaving(true);
    try {
      // Remove IDs before sending to backend
      const questionsForBackend = questions.map(({ id, ...q }: Question) => q);

      await apiFetch('/jobs/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          notes: notes.trim() || undefined, // Include notes in payload
          questions: questionsForBackend,
        }),
      });

      toast.success(t('success.saved') || 'Job created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    generateInterview,
    suggestQuestion,
    generateAnswer,
    fillSmartQuestion,
    saveJob,
  };
}
