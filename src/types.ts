export interface Exercise {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: number;
  emoji: string;
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight?: number;
  timestamp: number;
}

export interface WorkoutState {
  exercise: Exercise;
  currentSet: number;
  totalSets: number;
  targetReps: number;
  weight: number;
  completedSets: CompletedSet[];
  isResting: boolean;
  restTimeRemaining: number;
  isComplete: boolean;
}

export interface TranscriptEntry {
  id: string;
  role: 'user' | 'agent';
  message: string;
  timestamp: number;
}
