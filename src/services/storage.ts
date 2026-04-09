import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout } from '../types';

const WORKOUTS_KEY = 'train_buddy_workouts';

export async function getWorkouts(): Promise<Workout[]> {
  const raw = await AsyncStorage.getItem(WORKOUTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getWorkout(id: string): Promise<Workout | null> {
  const all = await getWorkouts();
  return all.find(w => w.id === id) ?? null;
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const all = await getWorkouts();
  const idx = all.findIndex(w => w.id === workout.id);
  if (idx >= 0) {
    all[idx] = workout;
  } else {
    all.unshift(workout); // newest first
  }
  await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(all));
}

export async function deleteWorkout(id: string): Promise<void> {
  const all = await getWorkouts();
  await AsyncStorage.setItem(
    WORKOUTS_KEY,
    JSON.stringify(all.filter(w => w.id !== id)),
  );
}
