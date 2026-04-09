import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  {
    id: 'bench',
    name: 'Bench Press',
    defaultSets: 5,
    defaultReps: 10,
    emoji: '🏋️',
  },
  {
    id: 'squat',
    name: 'Squat',
    defaultSets: 5,
    defaultReps: 8,
    emoji: '🦵',
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    defaultSets: 5,
    defaultReps: 5,
    emoji: '💪',
  },
  {
    id: 'ohp',
    name: 'Overhead Press',
    defaultSets: 4,
    defaultReps: 8,
    emoji: '🙌',
  },
  {
    id: 'row',
    name: 'Barbell Row',
    defaultSets: 4,
    defaultReps: 10,
    emoji: '🚣',
  },
  {
    id: 'pullup',
    name: 'Pull-ups',
    defaultSets: 4,
    defaultReps: 8,
    emoji: '🧗',
  },
];
