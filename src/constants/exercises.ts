import { ExerciseDefinition } from '../types';

/**
 * Master exercise database.
 * Every exercise the app and AI generator can reference.
 * IDs are the contract — the generator prompt, storage, and session all key on them.
 */
export const EXERCISE_DB: ExerciseDefinition[] = [
  // ─── CHEST ───────────────────────────────────────────
  { id: 'bench_press',      name: 'Bench Press',            emoji: '🏋️', primaryMuscle: 'chest',     secondaryMuscles: ['triceps', 'shoulders'], equipment: 'barbell',    defaultSets: 4, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'incline_bench',    name: 'Incline Bench Press',    emoji: '🏋️', primaryMuscle: 'chest',     secondaryMuscles: ['shoulders', 'triceps'], equipment: 'barbell',    defaultSets: 4, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'decline_bench',    name: 'Decline Bench Press',    emoji: '🏋️', primaryMuscle: 'chest',     secondaryMuscles: ['triceps'],              equipment: 'barbell',    defaultSets: 3, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'db_bench_press',   name: 'Dumbbell Bench Press',   emoji: '🏋️', primaryMuscle: 'chest',     secondaryMuscles: ['triceps', 'shoulders'], equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },
  { id: 'incline_db_press', name: 'Incline Dumbbell Press', emoji: '🏋️', primaryMuscle: 'chest',     secondaryMuscles: ['shoulders'],            equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },
  { id: 'dumbbell_fly',     name: 'Dumbbell Fly',           emoji: '🏋️', primaryMuscle: 'chest',     secondaryMuscles: [],                       equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'cable_crossover',  name: 'Cable Crossover',        emoji: '🏋️', primaryMuscle: 'chest',     secondaryMuscles: [],                       equipment: 'cable',      defaultSets: 3, defaultReps: 15, defaultRestSeconds: 60 },
  { id: 'push_up',          name: 'Push-ups',               emoji: '🏋️', primaryMuscle: 'chest',     secondaryMuscles: ['triceps', 'shoulders'], equipment: 'bodyweight', defaultSets: 3, defaultReps: 15, defaultRestSeconds: 60 },
  { id: 'chest_dip',        name: 'Chest Dip',              emoji: '🏋️', primaryMuscle: 'chest',     secondaryMuscles: ['triceps'],              equipment: 'bodyweight', defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },

  // ─── BACK ────────────────────────────────────────────
  { id: 'deadlift',         name: 'Deadlift',               emoji: '🏗️', primaryMuscle: 'back',      secondaryMuscles: ['hamstrings', 'glutes'], equipment: 'barbell',    defaultSets: 4, defaultReps: 5,  defaultRestSeconds: 120 },
  { id: 'pull_up',          name: 'Pull-ups',               emoji: '🏗️', primaryMuscle: 'back',      secondaryMuscles: ['biceps'],               equipment: 'bodyweight', defaultSets: 4, defaultReps: 8,  defaultRestSeconds: 90 },
  { id: 'barbell_row',      name: 'Barbell Row',            emoji: '🏗️', primaryMuscle: 'back',      secondaryMuscles: ['biceps'],               equipment: 'barbell',    defaultSets: 4, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'dumbbell_row',     name: 'Dumbbell Row',           emoji: '🏗️', primaryMuscle: 'back',      secondaryMuscles: ['biceps'],               equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },
  { id: 'lat_pulldown',     name: 'Lat Pulldown',           emoji: '🏗️', primaryMuscle: 'back',      secondaryMuscles: ['biceps'],               equipment: 'cable',      defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },
  { id: 'seated_row',       name: 'Seated Cable Row',       emoji: '🏗️', primaryMuscle: 'back',      secondaryMuscles: ['biceps'],               equipment: 'cable',      defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },
  { id: 't_bar_row',        name: 'T-Bar Row',              emoji: '🏗️', primaryMuscle: 'back',      secondaryMuscles: ['biceps'],               equipment: 'barbell',    defaultSets: 4, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'face_pull',        name: 'Face Pull',              emoji: '🏗️', primaryMuscle: 'back',      secondaryMuscles: ['shoulders'],            equipment: 'cable',      defaultSets: 3, defaultReps: 15, defaultRestSeconds: 60 },

  // ─── SHOULDERS ───────────────────────────────────────
  { id: 'overhead_press',   name: 'Overhead Press',         emoji: '🙌', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],              equipment: 'barbell',    defaultSets: 4, defaultReps: 8,  defaultRestSeconds: 90 },
  { id: 'db_shoulder_press',name: 'Dumbbell Shoulder Press', emoji: '🙌', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],              equipment: 'dumbbell',   defaultSets: 3, defaultReps: 10, defaultRestSeconds: 75 },
  { id: 'arnold_press',     name: 'Arnold Press',           emoji: '🙌', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],              equipment: 'dumbbell',   defaultSets: 3, defaultReps: 10, defaultRestSeconds: 75 },
  { id: 'lateral_raise',    name: 'Lateral Raise',          emoji: '🙌', primaryMuscle: 'shoulders', secondaryMuscles: [],                       equipment: 'dumbbell',   defaultSets: 3, defaultReps: 15, defaultRestSeconds: 60 },
  { id: 'front_raise',      name: 'Front Raise',            emoji: '🙌', primaryMuscle: 'shoulders', secondaryMuscles: [],                       equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'rear_delt_fly',    name: 'Rear Delt Fly',          emoji: '🙌', primaryMuscle: 'shoulders', secondaryMuscles: ['back'],                 equipment: 'dumbbell',   defaultSets: 3, defaultReps: 15, defaultRestSeconds: 60 },
  { id: 'upright_row',      name: 'Upright Row',            emoji: '🙌', primaryMuscle: 'shoulders', secondaryMuscles: ['biceps'],               equipment: 'barbell',    defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },

  // ─── BICEPS ──────────────────────────────────────────
  { id: 'barbell_curl',     name: 'Barbell Curl',           emoji: '💪', primaryMuscle: 'biceps',    secondaryMuscles: ['forearms'],             equipment: 'barbell',    defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'dumbbell_curl',    name: 'Dumbbell Curl',          emoji: '💪', primaryMuscle: 'biceps',    secondaryMuscles: ['forearms'],             equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'hammer_curl',      name: 'Hammer Curl',            emoji: '💪', primaryMuscle: 'biceps',    secondaryMuscles: ['forearms'],             equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'preacher_curl',    name: 'Preacher Curl',          emoji: '💪', primaryMuscle: 'biceps',    secondaryMuscles: [],                       equipment: 'barbell',    defaultSets: 3, defaultReps: 10, defaultRestSeconds: 60 },
  { id: 'cable_curl',       name: 'Cable Curl',             emoji: '💪', primaryMuscle: 'biceps',    secondaryMuscles: [],                       equipment: 'cable',      defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'incline_curl',     name: 'Incline Dumbbell Curl',  emoji: '💪', primaryMuscle: 'biceps',    secondaryMuscles: [],                       equipment: 'dumbbell',   defaultSets: 3, defaultReps: 10, defaultRestSeconds: 60 },
  { id: 'concentration_curl', name: 'Concentration Curl',   emoji: '💪', primaryMuscle: 'biceps',    secondaryMuscles: [],                       equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },

  // ─── TRICEPS ─────────────────────────────────────────
  { id: 'tricep_pushdown',  name: 'Tricep Pushdown',        emoji: '💪', primaryMuscle: 'triceps',   secondaryMuscles: [],                       equipment: 'cable',      defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'skull_crusher',    name: 'Skull Crusher',           emoji: '💪', primaryMuscle: 'triceps',   secondaryMuscles: [],                       equipment: 'barbell',    defaultSets: 3, defaultReps: 10, defaultRestSeconds: 75 },
  { id: 'close_grip_bench', name: 'Close Grip Bench Press',  emoji: '💪', primaryMuscle: 'triceps',   secondaryMuscles: ['chest'],                equipment: 'barbell',    defaultSets: 3, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'overhead_extension', name: 'Overhead Tricep Extension', emoji: '💪', primaryMuscle: 'triceps', secondaryMuscles: [],                     equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'tricep_dip',       name: 'Tricep Dip',             emoji: '💪', primaryMuscle: 'triceps',   secondaryMuscles: ['chest', 'shoulders'],   equipment: 'bodyweight', defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },
  { id: 'tricep_kickback',  name: 'Tricep Kickback',        emoji: '💪', primaryMuscle: 'triceps',   secondaryMuscles: [],                       equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },

  // ─── QUADS ───────────────────────────────────────────
  { id: 'squat',            name: 'Barbell Squat',           emoji: '🦵', primaryMuscle: 'quads',     secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'barbell',    defaultSets: 4, defaultReps: 8,  defaultRestSeconds: 120 },
  { id: 'front_squat',      name: 'Front Squat',             emoji: '🦵', primaryMuscle: 'quads',     secondaryMuscles: ['abs', 'glutes'],        equipment: 'barbell',    defaultSets: 4, defaultReps: 8,  defaultRestSeconds: 120 },
  { id: 'leg_press',        name: 'Leg Press',               emoji: '🦵', primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],               equipment: 'machine',    defaultSets: 4, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'leg_extension',    name: 'Leg Extension',           emoji: '🦵', primaryMuscle: 'quads',     secondaryMuscles: [],                       equipment: 'machine',    defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'lunge',            name: 'Lunges',                  emoji: '🦵', primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],               equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },
  { id: 'bulgarian_split',  name: 'Bulgarian Split Squat',   emoji: '🦵', primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],               equipment: 'dumbbell',   defaultSets: 3, defaultReps: 10, defaultRestSeconds: 75 },
  { id: 'hack_squat',       name: 'Hack Squat',              emoji: '🦵', primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],               equipment: 'machine',    defaultSets: 3, defaultReps: 10, defaultRestSeconds: 90 },

  // ─── HAMSTRINGS ──────────────────────────────────────
  { id: 'romanian_deadlift', name: 'Romanian Deadlift',      emoji: '🦵', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'back'],      equipment: 'barbell',    defaultSets: 4, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'leg_curl',         name: 'Leg Curl',                emoji: '🦵', primaryMuscle: 'hamstrings', secondaryMuscles: [],                      equipment: 'machine',    defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'stiff_leg_deadlift', name: 'Stiff-Leg Deadlift',   emoji: '🦵', primaryMuscle: 'hamstrings', secondaryMuscles: ['back', 'glutes'],      equipment: 'barbell',    defaultSets: 3, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'good_morning',     name: 'Good Morning',            emoji: '🦵', primaryMuscle: 'hamstrings', secondaryMuscles: ['back'],                equipment: 'barbell',    defaultSets: 3, defaultReps: 10, defaultRestSeconds: 75 },
  { id: 'nordic_curl',      name: 'Nordic Curl',             emoji: '🦵', primaryMuscle: 'hamstrings', secondaryMuscles: [],                      equipment: 'bodyweight', defaultSets: 3, defaultReps: 8,  defaultRestSeconds: 90 },

  // ─── GLUTES ──────────────────────────────────────────
  { id: 'hip_thrust',       name: 'Hip Thrust',              emoji: '🍑', primaryMuscle: 'glutes',    secondaryMuscles: ['hamstrings'],           equipment: 'barbell',    defaultSets: 4, defaultReps: 10, defaultRestSeconds: 90 },
  { id: 'glute_bridge',     name: 'Glute Bridge',            emoji: '🍑', primaryMuscle: 'glutes',    secondaryMuscles: ['hamstrings'],           equipment: 'bodyweight', defaultSets: 3, defaultReps: 15, defaultRestSeconds: 60 },
  { id: 'cable_kickback',   name: 'Cable Kickback',          emoji: '🍑', primaryMuscle: 'glutes',    secondaryMuscles: [],                       equipment: 'cable',      defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'step_up',          name: 'Step-ups',                emoji: '🍑', primaryMuscle: 'glutes',    secondaryMuscles: ['quads'],                equipment: 'dumbbell',   defaultSets: 3, defaultReps: 12, defaultRestSeconds: 75 },
  { id: 'sumo_deadlift',    name: 'Sumo Deadlift',           emoji: '🍑', primaryMuscle: 'glutes',    secondaryMuscles: ['hamstrings', 'quads'],  equipment: 'barbell',    defaultSets: 4, defaultReps: 8,  defaultRestSeconds: 120 },

  // ─── CALVES ──────────────────────────────────────────
  { id: 'standing_calf_raise', name: 'Standing Calf Raise',  emoji: '🦵', primaryMuscle: 'calves',    secondaryMuscles: [],                       equipment: 'machine',    defaultSets: 4, defaultReps: 15, defaultRestSeconds: 45 },
  { id: 'seated_calf_raise',  name: 'Seated Calf Raise',     emoji: '🦵', primaryMuscle: 'calves',    secondaryMuscles: [],                       equipment: 'machine',    defaultSets: 4, defaultReps: 15, defaultRestSeconds: 45 },

  // ─── ABS ─────────────────────────────────────────────
  { id: 'crunch',           name: 'Crunch',                  emoji: '🔥', primaryMuscle: 'abs',       secondaryMuscles: [],                       equipment: 'bodyweight', defaultSets: 3, defaultReps: 20, defaultRestSeconds: 45 },
  { id: 'plank',            name: 'Plank',                   emoji: '🔥', primaryMuscle: 'abs',       secondaryMuscles: [],                       equipment: 'bodyweight', defaultSets: 3, defaultReps: 1,  defaultRestSeconds: 60 },
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise',      emoji: '🔥', primaryMuscle: 'abs',       secondaryMuscles: [],                       equipment: 'bodyweight', defaultSets: 3, defaultReps: 12, defaultRestSeconds: 60 },
  { id: 'cable_crunch',     name: 'Cable Crunch',            emoji: '🔥', primaryMuscle: 'abs',       secondaryMuscles: [],                       equipment: 'cable',      defaultSets: 3, defaultReps: 15, defaultRestSeconds: 60 },
  { id: 'ab_rollout',       name: 'Ab Rollout',              emoji: '🔥', primaryMuscle: 'abs',       secondaryMuscles: [],                       equipment: 'bodyweight', defaultSets: 3, defaultReps: 10, defaultRestSeconds: 60 },
  { id: 'russian_twist',    name: 'Russian Twist',           emoji: '🔥', primaryMuscle: 'abs',       secondaryMuscles: [],                       equipment: 'bodyweight', defaultSets: 3, defaultReps: 20, defaultRestSeconds: 45 },
];

/** Quick lookup by ID */
export const EXERCISE_MAP = new Map(EXERCISE_DB.map(e => [e.id, e]));

/** Get exercises for a muscle group */
export function getExercisesForMuscle(muscle: string): ExerciseDefinition[] {
  return EXERCISE_DB.filter(
    e => e.primaryMuscle === muscle || e.secondaryMuscles.includes(muscle as any),
  );
}

/** All unique muscle groups */
export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders',
  'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves',
  'abs',
] as const;

/** Friendly display names */
export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  abs: 'Abs',
};
