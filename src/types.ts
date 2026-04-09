// ─── Taxonomy ────────────────────────────────────────────

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'band';

// ─── Exercise Database ───────────────────────────────────

export interface ExerciseDefinition {
  id: string;
  name: string;
  emoji: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
}

// ─── Workout Template ────────────────────────────────────

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  order: number;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  targetMuscleGroups: MuscleGroup[];
  exercises: WorkoutExercise[];
  estimatedMinutes: number;
  createdAt: number;
  isAIGenerated: boolean;
}

// ─── Session Tracking ────────────────────────────────────

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight?: number;
  timestamp: number;
}

export interface ExerciseSessionState {
  exerciseId: string;
  name: string;
  currentSet: number;
  totalSets: number;
  targetReps: number;
  restSeconds: number;
  completedSets: CompletedSet[];
  isComplete: boolean;
  isResting: boolean;
  restTimeRemaining: number;
}

export interface WorkoutSessionState {
  workout: Workout;
  currentExerciseIndex: number;
  exerciseStates: ExerciseSessionState[];
  isComplete: boolean;
  startedAt: number;
}

export interface TranscriptEntry {
  id: string;
  role: 'user' | 'agent';
  message: string;
  timestamp: number;
}
