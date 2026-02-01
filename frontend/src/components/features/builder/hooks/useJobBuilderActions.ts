import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
  const token = useAuthStore((state: any) => state.accessToken);

  const {
    title,
    description,
    questions,
    setTitle,
    setQuestions,
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
        body: JSON.stringify({ description }),
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
    saveJob,
  };
}
