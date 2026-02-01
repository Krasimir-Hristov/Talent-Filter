import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export interface Question {
  id: string;
  text: string;
  ideal_answer: string;
  time_limit: number;
  weight: number;
}

interface JobBuilderState {
  // Form fields
  title: string;
  description: string;
  notes: string;
  questions: Question[];

  // UI state
  isGenerating: boolean;
  isSaving: boolean;
  hasGenerated: boolean;
}

interface JobBuilderActions {
  // Form setters
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setNotes: (notes: string) => void;

  // Questions management
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question?: Partial<Question>, index?: number) => void;
  updateQuestion: (id: string, updates: Partial<Omit<Question, 'id'>>) => void;
  removeQuestion: (id: string) => void;

  // UI state
  setIsGenerating: (val: boolean) => void;
  setIsSaving: (val: boolean) => void;
  setHasGenerated: (val: boolean) => void;

  // Computed / Helpers
  canGenerate: () => boolean;
  canSave: () => boolean;

  // Reset
  reset: () => void;
}

type JobBuilderStore = JobBuilderState & JobBuilderActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: JobBuilderState = {
  title: '',
  description: '',
  notes: '',
  questions: [],
  isGenerating: false,
  isSaving: false,
  hasGenerated: false,
};

// ============================================================================
// STORE
// ============================================================================

export const useJobBuilderStore = create<JobBuilderStore>((set, get) => ({
  ...initialState,

  // --------------------------------------------------------------------------
  // Form setters
  // --------------------------------------------------------------------------
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setNotes: (notes) => set({ notes }),

  // --------------------------------------------------------------------------
  // Questions management
  // --------------------------------------------------------------------------
  setQuestions: (questions) => set({ questions }),

  addQuestion: (partial, index) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: partial?.text ?? '',
      ideal_answer: partial?.ideal_answer ?? '',
      time_limit: partial?.time_limit ?? 120,
      weight: partial?.weight ?? 1,
    };

    set((state) => {
      if (
        typeof index === 'number' &&
        index >= 0 &&
        index <= state.questions.length
      ) {
        const newQuestions = [...state.questions];
        newQuestions.splice(index, 0, newQuestion);
        return { questions: newQuestions };
      }
      return { questions: [...state.questions, newQuestion] };
    });
  },

  updateQuestion: (id, updates) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q,
      ),
    }));
  },

  removeQuestion: (id) => {
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
    }));
  },

  // --------------------------------------------------------------------------
  // UI state
  // --------------------------------------------------------------------------
  setIsGenerating: (val) => set({ isGenerating: val }),
  setIsSaving: (val) => set({ isSaving: val }),
  setHasGenerated: (val) => set({ hasGenerated: val }),

  // --------------------------------------------------------------------------
  // Computed / Helpers
  // --------------------------------------------------------------------------
  canGenerate: () => {
    const { title, description, isGenerating, hasGenerated } = get();
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      !isGenerating &&
      !hasGenerated
    );
  },

  canSave: () => {
    const { title, questions, isSaving } = get();
    return title.trim().length > 0 && questions.length > 0 && !isSaving;
  },

  // --------------------------------------------------------------------------
  // Reset
  // --------------------------------------------------------------------------
  reset: () => set(initialState),
}));
