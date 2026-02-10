import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionQuestion {
  id: string;
  text: string;
  time_limit: number;
  order_index: number;
}

type SessionState =
  | 'idle'
  | 'loading'
  | 'active'
  | 'submitting'
  | 'completed'
  | 'error';

interface InterviewSessionState {
  // Session identity
  interviewId: string | null;
  jobTitle: string;

  // Questions
  questions: SessionQuestion[];
  currentIndex: number;
  totalQuestions: number;

  // Timer
  timeLeft: number; // seconds remaining for current question
  maxTime: number; // max time for current question (for progress bar %)

  // Answers (keyed by question ID)
  answers: Record<string, string>;

  // Session flow
  sessionState: SessionState;
  errorMessage: string | null;

  // Anti-cheat counters (per-question, reset on each new question)
  pasteCount: number;
  tabSwitchCount: number;
}

interface InterviewSessionActions {
  // Session lifecycle
  initSession: (interviewId: string) => Promise<void>;
  submitCurrentAnswer: () => Promise<void>;

  // Timer
  tick: () => void;

  // Answer input
  setAnswer: (questionId: string, text: string) => void;

  // Anti-cheat
  recordPaste: () => void;
  recordTabSwitch: () => void;

  // Helpers
  resetSession: () => void;
}

type InterviewSessionStore = InterviewSessionState & InterviewSessionActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: InterviewSessionState = {
  interviewId: null,
  jobTitle: '',
  questions: [],
  currentIndex: 0,
  totalQuestions: 0,
  timeLeft: 0,
  maxTime: 0,
  answers: {},
  sessionState: 'idle',
  errorMessage: null,
  pasteCount: 0,
  tabSwitchCount: 0,
};

// ============================================================================
// API BASE URL
// Uses the Next.js proxy (/api/v1) on the browser side to avoid CORS issues.
// Matches the pattern used in interview-api.ts.
// ============================================================================

const API_BASE =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
    : '/api/v1';

// ============================================================================
// STORE
// ============================================================================

export const useInterviewSessionStore = create<InterviewSessionStore>(
  (set, get) => ({
    ...initialState,

    // ----------------------------------------------------------------------
    // INIT: Load the session from the backend
    // ----------------------------------------------------------------------
    initSession: async (interviewId: string) => {
      set({ sessionState: 'loading', interviewId, errorMessage: null });

      try {
        const res = await fetch(
          `${API_BASE}/interviews/${interviewId}/session`,
        );

        if (!res.ok) {
          const error = await res
            .json()
            .catch(() => ({ detail: 'Unknown error' }));
          throw new Error(error.detail || `HTTP ${res.status}`);
        }

        const data = await res.json();

        const firstQuestion = data.questions[0];
        const timeLimit = firstQuestion?.time_limit ?? 180;

        set({
          sessionState: 'active',
          jobTitle: data.job_title,
          questions: data.questions,
          totalQuestions: data.total_questions,
          currentIndex: 0,
          timeLeft: timeLimit === 0 ? 0 : timeLimit,
          maxTime: timeLimit,
          pasteCount: 0,
          tabSwitchCount: 0,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load session';
        set({ sessionState: 'error', errorMessage: message });
      }
    },

    // ----------------------------------------------------------------------
    // SUBMIT: Send the current answer to the backend
    // ----------------------------------------------------------------------
    submitCurrentAnswer: async () => {
      const {
        interviewId,
        questions,
        currentIndex,
        answers,
        maxTime,
        timeLeft,
        pasteCount,
        tabSwitchCount,
      } = get();

      if (!interviewId || currentIndex >= questions.length) return;

      const currentQuestion = questions[currentIndex];
      const answerText = answers[currentQuestion.id] || '';
      // If maxTime is 0, we count UP, so timeSpent is just timeLeft.
      // If maxTime > 0, we count DOWN, so timeSpent is maxTime - timeLeft.
      const timeSpent = maxTime === 0 ? timeLeft : maxTime - timeLeft;

      set({ sessionState: 'submitting' });

      try {
        const res = await fetch(
          `${API_BASE}/interviews/${interviewId}/submit-answer`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question_id: currentQuestion.id,
              answer_text: answerText,
              time_spent_seconds: timeSpent,
              paste_count: pasteCount,
              tab_switches: tabSwitchCount,
            }),
          },
        );

        if (!res.ok) {
          const error = await res
            .json()
            .catch(() => ({ detail: 'Unknown error' }));
          throw new Error(error.detail || `HTTP ${res.status}`);
        }

        const data = await res.json();

        if (
          data.next_question_index === null ||
          data.next_question_index === undefined
        ) {
          // Interview complete!
          set({ sessionState: 'completed' });
        } else {
          // Advance to next question
          const nextQuestion = questions[data.next_question_index];
          const nextTimeLimit = nextQuestion?.time_limit ?? 180;

          set({
            sessionState: 'active',
            currentIndex: data.next_question_index,
            timeLeft: nextTimeLimit === 0 ? 0 : nextTimeLimit,
            maxTime: nextTimeLimit,
            // Reset per-question anti-cheat counters
            pasteCount: 0,
            tabSwitchCount: 0,
          });
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to submit answer';
        set({ sessionState: 'error', errorMessage: message });
      }
    },

    // ----------------------------------------------------------------------
    // TIMER: Decrement every second (called by useEffect interval)
    // ----------------------------------------------------------------------
    tick: () => {
      const { timeLeft, maxTime, sessionState, submitCurrentAnswer } = get();

      if (sessionState !== 'active') return;

      if (Number(maxTime) === 0) {
        // Unlimited time: count UP
        set({ timeLeft: timeLeft + 1 });
      } else {
        // Limited time: count DOWN
        if (timeLeft <= 1) {
          // Time's up — auto-submit
          submitCurrentAnswer();
        } else {
          set({ timeLeft: timeLeft - 1 });
        }
      }
    },

    // ----------------------------------------------------------------------
    // ANSWER: Update the answer text for a question
    // ----------------------------------------------------------------------
    setAnswer: (questionId: string, text: string) => {
      set((state) => ({
        answers: { ...state.answers, [questionId]: text },
      }));
    },

    // ----------------------------------------------------------------------
    // ANTI-CHEAT: Increment violation counters
    // ----------------------------------------------------------------------
    recordPaste: () => {
      set((state) => ({ pasteCount: state.pasteCount + 1 }));
    },

    recordTabSwitch: () => {
      set((state) => ({ tabSwitchCount: state.tabSwitchCount + 1 }));
    },

    // ----------------------------------------------------------------------
    // RESET: Clean up when leaving the session
    // ----------------------------------------------------------------------
    resetSession: () => set(initialState),
  }),
);
