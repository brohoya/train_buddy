import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import VoiceAgent from '../components/VoiceAgent';
import { useWorkoutSession } from '../src/hooks/useWorkoutSession';
import { getWorkout } from '../src/services/storage';
import { EXERCISE_MAP } from '../src/constants/exercises';
import { Workout } from '../src/types';

export default function SessionScreen() {
  const params = useLocalSearchParams<{
    workoutId?: string;
    // Legacy single-exercise quick start
    exerciseId?: string;
    exerciseName?: string;
    sets?: string;
    reps?: string;
    weight?: string;
  }>();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (params.workoutId) {
        const w = await getWorkout(params.workoutId);
        setWorkout(w);
      } else if (params.exerciseId) {
        // Legacy: wrap single exercise in a workout
        const dbEx = EXERCISE_MAP.get(params.exerciseId);
        const name = params.exerciseName ?? dbEx?.name ?? 'Exercise';
        setWorkout({
          id: 'quick',
          name,
          description: 'Quick start',
          targetMuscleGroups: dbEx ? [dbEx.primaryMuscle] : [],
          exercises: [
            {
              exerciseId: params.exerciseId,
              name,
              sets: Number(params.sets) || dbEx?.defaultSets || 5,
              reps: Number(params.reps) || dbEx?.defaultReps || 10,
              restSeconds: dbEx?.defaultRestSeconds || 90,
              order: 1,
            },
          ],
          estimatedMinutes: 15,
          createdAt: Date.now(),
          isAIGenerated: false,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF3B30" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Workout not found</Text>
        <Pressable onPress={() => router.back()} style={styles.endButton}>
          <Text style={styles.endButtonText}>GO BACK</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return <ActiveSession workout={workout} />;
}

function ActiveSession({ workout }: { workout: Workout }) {
  const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID ?? '';

  const {
    state,
    currentExercise,
    transcript,
    voiceStatus,
    isSpeaking,
    setVoiceStatus,
    setIsSpeaking,
    addTranscript,
    workoutPlanSummary,
    completeSet,
    getWorkoutStatus,
    startRestTimer,
  } = useWorkoutSession(workout);

  const handleStatusChange = useCallback((s: string) => setVoiceStatus(s), []);
  const handleTranscript = useCallback((r: string, m: string) => addTranscript(r, m), []);
  const handleModeChange = useCallback((s: boolean) => setIsSpeaking(s), []);

  const lastAgentMessage = useMemo(
    () => [...transcript].reverse().find(t => t.role === 'agent'),
    [transcript],
  );

  const totalExercises = state.workout.exercises.length;
  const completedExercises = state.exerciseStates.filter(e => e.isComplete).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'}</Text>
        </Pressable>
        <Text style={styles.workoutName} numberOfLines={1}>
          {workout.name.toUpperCase()}
        </Text>
        <Text style={styles.exerciseProgress}>
          Exercise {state.currentExerciseIndex + 1}/{totalExercises}
        </Text>
      </View>

      {/* Exercise name — only show when multi-exercise (avoids duplication for quick start) */}
      {totalExercises > 1 && currentExercise && !state.isComplete && (
        <Text style={styles.currentExerciseName}>
          {currentExercise.name}
        </Text>
      )}

      {/* Exercise dots (which exercises are done) */}
      {totalExercises > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exerciseDots}>
          {state.exerciseStates.map((ex, i) => (
            <View
              key={i}
              style={[
                styles.exerciseDot,
                ex.isComplete && styles.exerciseDotDone,
                i === state.currentExerciseIndex && !state.isComplete && styles.exerciseDotCurrent,
              ]}
            >
              <Text style={[styles.exerciseDotText, ex.isComplete && styles.exerciseDotTextDone]} numberOfLines={1}>
                {ex.name.split(' ')[0]}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Set dots for current exercise */}
      {currentExercise && !state.isComplete && (
        <View style={styles.setDots}>
          {Array.from({ length: currentExercise.totalSets }).map((_, i) => {
            const done = i < currentExercise.completedSets.length;
            const active = i === currentExercise.currentSet - 1 && !currentExercise.isComplete;
            return (
              <View key={i} style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
                <Text style={[styles.dotText, done && styles.dotTextDone]}>
                  {done ? '✓' : i + 1}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Main display */}
      <View style={styles.mainDisplay}>
        {state.isComplete ? (
          <View style={styles.completeContainer}>
            <Text style={styles.completeEmoji}>🔥</Text>
            <Text style={styles.completeText}>WORKOUT COMPLETE</Text>
            <Text style={styles.completeSummary}>
              {completedExercises} exercises | {state.exerciseStates.reduce(
                (sum, ex) => sum + ex.completedSets.reduce((r, s) => r + s.reps, 0), 0,
              )} total reps
            </Text>
          </View>
        ) : currentExercise?.isResting ? (
          <View style={styles.restContainer}>
            <Text style={styles.restLabel}>REST</Text>
            <Text style={styles.restTimer}>{currentExercise.restTimeRemaining}</Text>
            <Text style={styles.restUnit}>seconds</Text>
          </View>
        ) : currentExercise ? (
          <View style={styles.repContainer}>
            <View style={styles.repCircle}>
              <Text style={styles.setLabel}>
                SET {currentExercise.currentSet}/{currentExercise.totalSets}
              </Text>
              <Text style={styles.repCount}>{currentExercise.targetReps}</Text>
              <Text style={styles.repLabel}>REPS</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Agent message */}
      {lastAgentMessage && (
        <View style={styles.agentMessage}>
          <Text style={styles.agentMessageText} numberOfLines={3}>
            "{lastAgentMessage.message}"
          </Text>
        </View>
      )}

      {/* Transcript */}
      {transcript.length > 0 && (
        <ScrollView style={styles.transcript} contentContainerStyle={styles.transcriptContent}>
          {transcript.slice(-6).map(entry => (
            <View key={entry.id} style={styles.transcriptEntry}>
              <Text style={[styles.transcriptRole, entry.role === 'agent' && styles.transcriptRoleAgent]}>
                {entry.role === 'agent' ? 'TRAINER' : 'YOU'}
              </Text>
              <Text style={styles.transcriptText}>{entry.message}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Voice agent */}
      <View style={styles.voiceContainer}>
        <VoiceAgent
          dom={{ style: { width: 160, height: 140, backgroundColor: 'transparent' } }}
          agentId={agentId}
          workoutName={workout.name}
          workoutPlan={workoutPlanSummary}
          onStatusChange={handleStatusChange}
          onTranscript={handleTranscript}
          onModeChange={handleModeChange}
          completeSet={completeSet}
          getWorkoutStatus={getWorkoutStatus}
          startRestTimer={startRestTimer}
        />
      </View>

      {/* End button */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}
      >
        <Text style={styles.endButtonText}>END WORKOUT</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  errorText: { color: '#FF3B30', fontSize: 18, textAlign: 'center', marginTop: 100 },

  // Header
  header: { alignItems: 'center', paddingTop: 8, paddingHorizontal: 20 },
  backButton: { position: 'absolute', left: 20, top: 8, padding: 8 },
  backText: { color: '#8E8E93', fontSize: 22, fontWeight: '700' },
  workoutName: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  exerciseProgress: { color: '#8E8E93', fontSize: 12, marginTop: 2, letterSpacing: 1 },
  currentExerciseName: { color: '#FF3B30', fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 8, letterSpacing: 1 },

  // Exercise progress dots
  exerciseDots: { paddingHorizontal: 20, paddingVertical: 10, gap: 6 },
  exerciseDot: { backgroundColor: '#1A1A1A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  exerciseDotDone: { backgroundColor: '#FF3B30' },
  exerciseDotCurrent: { borderWidth: 1, borderColor: '#FF3B30', backgroundColor: '#FF3B3020' },
  exerciseDotText: { color: '#8E8E93', fontSize: 11, fontWeight: '600' },
  exerciseDotTextDone: { color: '#FFFFFF' },

  // Set dots
  setDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 6 },
  dot: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: '#FF3B30' },
  dotActive: { borderWidth: 2, borderColor: '#FF3B30', backgroundColor: '#FF3B3020' },
  dotText: { color: '#8E8E93', fontSize: 13, fontWeight: '700' },
  dotTextDone: { color: '#FFFFFF' },

  // Main display
  mainDisplay: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 180 },
  repContainer: { alignItems: 'center' },
  repCircle: {
    width: 170, height: 170, borderRadius: 85, borderWidth: 4, borderColor: '#FF3B30',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20,
  },
  setLabel: { color: '#8E8E93', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  repCount: { color: '#FFFFFF', fontSize: 60, fontWeight: '900', marginVertical: -4 },
  repLabel: { color: '#8E8E93', fontSize: 13, fontWeight: '700', letterSpacing: 3 },

  // Rest
  restContainer: { alignItems: 'center' },
  restLabel: { color: '#FF6B35', fontSize: 16, fontWeight: '800', letterSpacing: 4 },
  restTimer: { color: '#FF6B35', fontSize: 72, fontWeight: '900', marginVertical: -6 },
  restUnit: { color: '#8E8E93', fontSize: 14, letterSpacing: 2 },

  // Complete
  completeContainer: { alignItems: 'center' },
  completeEmoji: { fontSize: 56 },
  completeText: { color: '#30D158', fontSize: 26, fontWeight: '900', letterSpacing: 3, marginTop: 12 },
  completeSummary: { color: '#8E8E93', fontSize: 15, marginTop: 8 },

  // Agent message
  agentMessage: { marginHorizontal: 24, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#FF3B3015', borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#FF3B30' },
  agentMessageText: { color: '#FF6B6B', fontSize: 14, fontWeight: '600', fontStyle: 'italic' },

  // Transcript
  transcript: { maxHeight: 100, marginHorizontal: 20, marginTop: 8 },
  transcriptContent: { paddingVertical: 4 },
  transcriptEntry: { flexDirection: 'row', marginBottom: 5, gap: 8 },
  transcriptRole: { color: '#8E8E93', fontSize: 10, fontWeight: '800', letterSpacing: 1, width: 52 },
  transcriptRoleAgent: { color: '#FF3B30' },
  transcriptText: { color: '#CCCCCC', fontSize: 12, flex: 1 },

  // Voice
  voiceContainer: { alignItems: 'center', marginVertical: 4 },

  // End button
  endButton: { backgroundColor: '#2C2C2E', marginHorizontal: 20, marginBottom: 14, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  endButtonPressed: { backgroundColor: '#3C3C3E' },
  endButtonText: { color: '#8E8E93', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
});
