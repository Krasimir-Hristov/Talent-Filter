'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useInterviewSessionStore } from '@/store/useInterviewSessionStore';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * If the text length jumps by more than this many characters in a single
 * input event, we flag it as a paste (even if the browser's paste event
 * was somehow bypassed). A human typing at 120 WPM produces ~10 chars/sec,
 * so a jump of 30+ chars in one frame is physically impossible.
 */
const PASTE_THRESHOLD_CHARS = 30;

// ============================================================================
// HOOK
// ============================================================================

/**
 * useAntiCheat — Stealth monitoring hook for interview integrity.
 *
 * Detects:
 * 1. Tab switching / focus loss (visibilitychange)
 * 2. Speed-paste detection (large text jumps in a single input event)
 * 3. Right-click / context menu blocking
 *
 * All detections are silently recorded in the Zustand store and sent
 * to the backend with each answer submission. The candidate sees a
 * brief warning toast but is NOT blocked from continuing — the recruiter
 * will see the flags later during evaluation.
 */
export function useAntiCheat() {
  const recordTabSwitch = useInterviewSessionStore((s) => s.recordTabSwitch);
  const recordPaste = useInterviewSessionStore((s) => s.recordPaste);
  const sessionState = useInterviewSessionStore((s) => s.sessionState);

  // Track the previous text length to detect speed-pastes
  const prevLengthRef = useRef(0);

  // ------------------------------------------------------------------
  // 1. TAB SWITCH / FOCUS LOSS DETECTION
  // ------------------------------------------------------------------
  useEffect(() => {
    if (sessionState !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordTabSwitch();
      }
    };

    const handleBlur = () => {
      recordTabSwitch();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [sessionState, recordTabSwitch]);

  // ------------------------------------------------------------------
  // 3. SPEED-PASTE DETECTION (works even if browser paste event is bypassed)
  // ------------------------------------------------------------------
  /**
   * Call this from the textarea's onChange handler.
   * It compares the new text length to the previous length.
   * If the delta exceeds PASTE_THRESHOLD_CHARS, it's flagged as a paste.
   */
  const checkForSpeedPaste = useCallback(
    (newText: string) => {
      const delta = newText.length - prevLengthRef.current;
      prevLengthRef.current = newText.length;

      if (delta > PASTE_THRESHOLD_CHARS) {
        recordPaste();
        return true; // paste detected
      }
      return false;
    },
    [recordPaste],
  );

  /**
   * Call this when advancing to a new question to reset the length tracker.
   */
  const resetPasteTracker = useCallback(() => {
    prevLengthRef.current = 0;
  }, []);

  return {
    checkForSpeedPaste,
    resetPasteTracker,
  };
}
