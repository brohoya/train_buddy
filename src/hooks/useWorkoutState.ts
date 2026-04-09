import { useState, useCallback, useRef, useEffect } from 'react';
import { WorkoutState, CompletedSet, Exercise, TranscriptEntry } from '../types';

export function useWorkoutState(
  exercise: Exercise,
  sets: number,
  reps: number,
  weight: number,
) {
  const [state, setState] = useState<WorkoutState>({
    exercise,
    currentSet: 1,
    totalSets: sets,
    targetReps: reps,
    weight,
    completedSets: [],
    isResting: false,
    restTimeRemaining: 0,
    isComplete: false,
  });

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [voiceStatus, setVoiceStatus] = useState<string>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  const completeSet = useCallback(async (params: { reps: number }) => {
    const current = stateRef.current;
    const newSet: CompletedSet = {
      setNumber: current.currentSet,
      reps: params.reps,
      weight: current.weight,
      timestamp: Date.now(),
    };

    const completedSets = [...current.completedSets, newSet];
    const nextSet = current.currentSet + 1;
    const isComplete = nextSet > current.totalSets;

    setState((prev: WorkoutState) => ({
      ...prev,
      completedSets,
      currentSet: isComplete ? prev.currentSet : nextSet,
      isComplete,
      isResting: false,
      restTimeRemaining: 0,
    }));

    if (isComplete) {
      return `Workout complete! All ${current.totalSets} sets done. Total reps: ${completedSets.reduce((sum, s) => sum + s.reps, 0)}.`;
    }
    return `Set ${current.currentSet} logged: ${params.reps} reps. Moving to set ${nextSet} of ${current.totalSets}.`;
  }, []);

  const getWorkoutStatus = useCallback(async () => {
    const s = stateRef.current;
    return `Exercise: ${s.exercise.name}. Set ${s.currentSet} of ${s.totalSets}. Target: ${s.targetReps} reps at ${s.weight} lbs. Completed sets: ${s.completedSets.length}. ${s.isResting ? `Resting: ${s.restTimeRemaining}s remaining.` : 'Not resting.'} ${s.isComplete ? 'WORKOUT COMPLETE.' : ''}`;
  }, []);

  const startRestTimer = useCallback(async (params: { seconds: number }) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);

    setState((prev: WorkoutState) => ({ ...prev, isResting: true, restTimeRemaining: params.seconds }));

    restTimerRef.current = setInterval(() => {
      setState((prev: WorkoutState) => {
        const remaining = prev.restTimeRemaining - 1;
        if (remaining <= 0) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          restTimerRef.current = null;
          return { ...prev, isResting: false, restTimeRemaining: 0 };
        }
        return { ...prev, restTimeRemaining: remaining };
      });
    }, 1000);

    return `Rest timer started: ${params.seconds} seconds.`;
  }, []);

  const addTranscript = useCallback((role: string, message: string) => {
    setTranscript(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        role: role as 'user' | 'agent',
        message,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  return {
    state,
    transcript,
    voiceStatus,
    isSpeaking,
    setVoiceStatus,
    setIsSpeaking,
    addTranscript,
    completeSet,
    getWorkoutStatus,
    startRestTimer,
  };
}
