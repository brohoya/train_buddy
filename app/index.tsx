import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import ExerciseCard from '../components/ExerciseCard';
import WorkoutCard from '../components/WorkoutCard';
import { EXERCISE_DB } from '../src/constants/exercises';
import { ExerciseDefinition, Workout } from '../src/types';
import { getWorkouts, deleteWorkout } from '../src/services/storage';

// Show a handful of popular exercises for quick start
const QUICK_EXERCISES = EXERCISE_DB.filter(e =>
  ['bench_press', 'squat', 'deadlift', 'overhead_press', 'barbell_row', 'pull_up'].includes(e.id),
);

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition | null>(null);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;
  const agentConfigured = agentId && agentId !== 'your_agent_id_here';

  // Reload workouts every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getWorkouts().then(setWorkouts);
    }, []),
  );

  // ── Saved workout actions ─────────────────────────────
  function startWorkout(workout: Workout) {
    if (!agentConfigured) {
      Alert.alert('Agent Not Configured', 'Set EXPO_PUBLIC_ELEVENLABS_AGENT_ID in .env first.');
      return;
    }
    router.push({ pathname: '/session', params: { workoutId: workout.id } });
  }

  function handleDeleteWorkout(id: string) {
    Alert.alert('Delete Workout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkout(id);
          setWorkouts(prev => prev.filter(w => w.id !== id));
        },
      },
    ]);
  }

  // ── Quick start actions ───────────────────────────────
  function selectExercise(exercise: ExerciseDefinition) {
    setSelectedExercise(exercise);
    setSets(String(exercise.defaultSets));
    setReps(String(exercise.defaultReps));
  }

  function quickStart() {
    if (!agentConfigured) {
      Alert.alert('Agent Not Configured', 'Set EXPO_PUBLIC_ELEVENLABS_AGENT_ID in .env first.');
      return;
    }
    if (!selectedExercise) {
      Alert.alert('Select Exercise', 'Tap an exercise below to select it.');
      return;
    }
    router.push({
      pathname: '/session',
      params: {
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        sets: sets || String(selectedExercise.defaultSets),
        reps: reps || String(selectedExercise.defaultReps),
        weight: weight || '0',
      },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>TRAIN</Text>
          <Text style={styles.titleAccent}>BUDDY</Text>
          <Text style={styles.subtitle}>AI Personal Trainer</Text>
        </View>

        {/* Agent warning */}
        {!agentConfigured && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Set up your ElevenLabs agent ID in .env to get started
            </Text>
          </View>
        )}

        {/* Create / Generate */}
        <Pressable
          onPress={() => router.push('/create')}
          style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
        >
          <Text style={styles.createBtnText}>+ CREATE WORKOUT</Text>
        </Pressable>

        {/* Saved Workouts */}
        {workouts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MY WORKOUTS</Text>
            {workouts.map(w => (
              <WorkoutCard
                key={w.id}
                workout={w}
                onPress={startWorkout}
                onDelete={handleDeleteWorkout}
              />
            ))}
          </View>
        )}

        {/* Quick Start */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK START</Text>
          <View style={styles.exerciseGrid}>
            {QUICK_EXERCISES.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} onPress={selectExercise} />
            ))}
          </View>
        </View>

        {/* Quick start config */}
        {selectedExercise && (
          <View style={styles.configSection}>
            <Text style={styles.configTitle}>
              {selectedExercise.emoji} {selectedExercise.name.toUpperCase()}
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SETS</Text>
                <TextInput
                  style={styles.input}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor="#4A4A4A"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>REPS</Text>
                <TextInput
                  style={styles.input}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  placeholder="10"
                  placeholderTextColor="#4A4A4A"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LBS</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="number-pad"
                  placeholder="135"
                  placeholderTextColor="#4A4A4A"
                />
              </View>
            </View>
            <Pressable
              onPress={quickStart}
              style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
            >
              <Text style={styles.startBtnText}>START SESSION</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 24 },
  title: { fontSize: 48, fontWeight: '900', color: '#FFFFFF', letterSpacing: 6 },
  titleAccent: { fontSize: 48, fontWeight: '900', color: '#FF3B30', letterSpacing: 6, marginTop: -8 },
  subtitle: { fontSize: 14, color: '#8E8E93', letterSpacing: 3, marginTop: 8, textTransform: 'uppercase' },

  warning: { backgroundColor: '#FF3B3020', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#FF3B3040' },
  warningText: { color: '#FF6B6B', fontSize: 13, textAlign: 'center' },

  createBtn: { backgroundColor: '#FF3B30', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 28, shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  createBtnPressed: { backgroundColor: '#CC2F26', transform: [{ scale: 0.98 }] },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },

  section: { marginBottom: 28 },
  sectionTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 2, marginBottom: 14 },

  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },

  configSection: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#FF3B3040' },
  configTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  inputGroup: { flex: 1, alignItems: 'center' },
  inputLabel: { color: '#8E8E93', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  input: { backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 24, fontWeight: '700', textAlign: 'center', width: '100%' },
  startBtn: { backgroundColor: '#FF3B30', borderRadius: 16, paddingVertical: 18, marginTop: 24, alignItems: 'center', shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  startBtnPressed: { backgroundColor: '#CC2F26', transform: [{ scale: 0.98 }] },
  startBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
});
