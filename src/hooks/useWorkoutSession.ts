import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Workout,
  WorkoutSessionState,
  ExerciseSessionState,
  CompletedSet,
  TranscriptEntry,
} from '../types';

export function useWorkoutSession(workout: Workout) {
  const [state, setState] = useState<WorkoutSessionState>(() => ({
    workout,
    currentExerciseIndex: 0,
    exerciseStates: workout.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      currentSet: 1,
      totalSets: ex.sets,
      targetReps: ex.reps,
      restSeconds: ex.restSeconds,
      completedSets: [],
      isComplete: false,
      isResting: false,
      restTimeRemaining: 0,
    })),
    isComplete: false,
    startedAt: Date.now(),
  }));

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [voiceStatus, setVoiceStatus] = useState('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  // ── Current exercise shorthand ──────────────────────
  const currentExercise = state.exerciseStates[state.currentExerciseIndex];

  // ── Client tools (called by the ElevenLabs agent) ───

  const completeSet = useCallback(async (params: { reps: number }) => {
    const s = stateRef.current;
    const exIdx = s.currentExerciseIndex;
    const ex = s.exerciseStates[exIdx];
    if (!ex || ex.isComplete) return 'No active exercise.';

    const newSet: CompletedSet = {
      setNumber: ex.currentSet,
      reps: params.reps,
      timestamp: Date.now(),
    };

    const isLastSet = ex.currentSet >= ex.totalSets;
    const isLastExercise = exIdx >= s.workout.exercises.length - 1;

    setState((prev: WorkoutSessionState) => {
      const updated = { ...prev };
      const states = [...updated.exerciseStates];
      const cur = { ...states[exIdx] };

      cur.completedSets = [...cur.completedSets, newSet];

      if (isLastSet) {
        cur.isComplete = true;
        cur.isResting = false;
        cur.restTimeRemaining = 0;

        if (isLastExercise) {
          updated.isComplete = true;
        } else {
          updated.currentExerciseIndex = exIdx + 1;
        }
      } else {
        cur.currentSet = cur.currentSet + 1;
      }

      states[exIdx] = cur;
      updated.exerciseStates = states;
      return updated;
    });

    if (isLastSet && isLastExercise) {
      const totalReps = s.exerciseStates.reduce(
        (sum, e) => sum + e.completedSets.reduce((r, set) => r + set.reps, 0),
        params.reps,
      );
      return `WORKOUT COMPLETE! All ${s.workout.exercises.length} exercises done. Total reps: ${totalReps}.`;
    }

    if (isLastSet) {
      const next = s.workout.exercises[exIdx + 1];
      return `${ex.name} done! ${params.reps} reps on the last set. Next up: ${next.name}, ${next.sets} sets of ${next.reps}. Call start_rest_timer for transition rest.`;
    }

    return `Set ${ex.currentSet} done: ${params.reps} reps. Moving to set ${ex.currentSet + 1} of ${ex.totalSets}.`;
  }, []);

  const getWorkoutStatus = useCallback(async () => {
    const s = stateRef.current;
    const ex = s.exerciseStates[s.currentExerciseIndex];
    const completedExCount = s.exerciseStates.filter(e => e.isComplete).length;

    const lines = [
      `Workout: ${s.workout.name}`,
      `Exercise ${s.currentExerciseIndex + 1}/${s.workout.exercises.length}: ${ex?.name ?? 'done'}`,
      ex && !ex.isComplete
        ? `Set ${ex.currentSet}/${ex.totalSets}. Target: ${ex.targetReps} reps.`
        : '',
      `Exercises completed: ${completedExCount}/${s.workout.exercises.length}`,
      ex?.isResting ? `Resting: ${ex.restTimeRemaining}s left.` : '',
      s.isComplete ? 'WORKOUT COMPLETE.' : '',
    ];
    return lines.filter(Boolean).join(' ');
  }, []);

  const startRestTimer = useCallback(async (params: { seconds: number }) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);

    const exIdx = stateRef.current.currentExerciseIndex;

    setState((prev: WorkoutSessionState) => {
      const states = [...prev.exerciseStates];
      states[exIdx] = {
        ...states[exIdx],
        isResting: true,
        restTimeRemaining: params.seconds,
      };
      return { ...prev, exerciseStates: states };
    });

    restTimerRef.current = setInterval(() => {
      setState((prev: WorkoutSessionState) => {
        const idx = prev.currentExerciseIndex;
        const states = [...prev.exerciseStates];
        const ex = { ...states[idx] };
        const remaining = ex.restTimeRemaining - 1;

        if (remaining <= 0) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          restTimerRef.current = null;
          ex.isResting = false;
          ex.restTimeRemaining = 0;
        } else {
          ex.restTimeRemaining = remaining;
        }

        states[idx] = ex;
        return { ...prev, exerciseStates: states };
      });
    }, 1000);

    return `Rest timer started: ${params.seconds} seconds.`;
  }, []);

  // ── Transcript + voice state ────────────────────────

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

  // ── Formatted workout plan for agent context ────────

  const workoutPlanSummary = workout.exercises
    .map(
      (ex, i) =>
        `${i + 1}) ${ex.name} ${ex.sets}x${ex.reps} (${ex.restSeconds}s rest)`,
    )
    .join(' | ');

  return {
    state,
    currentExercise,
    transcript,
    voiceStatus,
    isSpeaking,
    setVoiceStatus,
    setIsSpeaking,
    addTranscript,
    workoutPlanSummary,
    // Client tools for the agent
    completeSet,
    getWorkoutStatus,
    startRestTimer,
  };
}
