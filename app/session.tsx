import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import VoiceAgent from '../components/VoiceAgent';
import { useWorkoutState } from '../src/hooks/useWorkoutState';
import { EXERCISES } from '../src/constants/exercises';

export default function SessionScreen() {
  const params = useLocalSearchParams<{
    exerciseId: string;
    exerciseName: string;
    sets: string;
    reps: string;
    weight: string;
  }>();

  const exercise = useMemo(
    () =>
      EXERCISES.find(e => e.id === params.exerciseId) ?? {
        id: params.exerciseId ?? 'custom',
        name: params.exerciseName ?? 'Exercise',
        defaultSets: Number(params.sets) || 5,
        defaultReps: Number(params.reps) || 10,
        emoji: '💪',
      },
    [params.exerciseId],
  );

  const totalSets = Number(params.sets) || exercise.defaultSets;
  const targetReps = Number(params.reps) || exercise.defaultReps;
  const weight = Number(params.weight) || 0;

  const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID ?? '';

  const {
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
  } = useWorkoutState(exercise, totalSets, targetReps, weight);

  const handleStatusChange = useCallback(
    (status: string) => setVoiceStatus(status),
    [],
  );

  const handleTranscript = useCallback(
    (role: string, message: string) => addTranscript(role, message),
    [],
  );

  const handleModeChange = useCallback(
    (speaking: boolean) => setIsSpeaking(speaking),
    [],
  );

  const lastAgentMessage = [...transcript]
    .reverse()
    .find(t => t.role === 'agent');

  const endSession = () => router.back();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={endSession} style={styles.backButton}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </Pressable>
        <Text style={styles.exerciseName}>{exercise.name.toUpperCase()}</Text>
        {weight > 0 && <Text style={styles.weight}>{weight} lbs</Text>}
      </View>

      {/* Set Progress Dots */}
      <View style={styles.setDots}>
        {Array.from({ length: state.totalSets }).map((_, i) => {
          const isCompleted = i < state.completedSets.length;
          const isCurrent = i === state.currentSet - 1 && !state.isComplete;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                isCompleted && styles.dotCompleted,
                isCurrent && styles.dotCurrent,
              ]}
            >
              <Text
                style={[
                  styles.dotText,
                  isCompleted && styles.dotTextCompleted,
                ]}
              >
                {isCompleted ? '✓' : i + 1}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Main Display */}
      <View style={styles.mainDisplay}>
        {state.isComplete ? (
          <View style={styles.completeContainer}>
            <Text style={styles.completeEmoji}>🔥</Text>
            <Text style={styles.completeText}>WORKOUT COMPLETE</Text>
            <Text style={styles.completeSummary}>
              {state.completedSets.length} sets |{' '}
              {state.completedSets.reduce((sum, s) => sum + s.reps, 0)} total
              reps
            </Text>
          </View>
        ) : state.isResting ? (
          <View style={styles.restContainer}>
            <Text style={styles.restLabel}>REST</Text>
            <Text style={styles.restTimer}>{state.restTimeRemaining}</Text>
            <Text style={styles.restUnit}>seconds</Text>
            <Text style={styles.nextSetText}>
              Next: Set {state.currentSet} of {state.totalSets}
            </Text>
          </View>
        ) : (
          <View style={styles.repContainer}>
            <View style={styles.repCircle}>
              <Text style={styles.setLabel}>
                SET {state.currentSet}/{state.totalSets}
              </Text>
              <Text style={styles.repCount}>{state.targetReps}</Text>
              <Text style={styles.repLabel}>REPS</Text>
            </View>
          </View>
        )}
      </View>

      {/* Agent Message */}
      {lastAgentMessage && (
        <View style={styles.agentMessage}>
          <Text style={styles.agentMessageText} numberOfLines={3}>
            "{lastAgentMessage.message}"
          </Text>
        </View>
      )}

      {/* Transcript */}
      {transcript.length > 0 && (
        <ScrollView
          style={styles.transcript}
          contentContainerStyle={styles.transcriptContent}
        >
          {transcript.slice(-6).map(entry => (
            <View key={entry.id} style={styles.transcriptEntry}>
              <Text
                style={[
                  styles.transcriptRole,
                  entry.role === 'agent' && styles.transcriptRoleAgent,
                ]}
              >
                {entry.role === 'agent' ? 'TRAINER' : 'YOU'}
              </Text>
              <Text style={styles.transcriptText}>{entry.message}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Voice Agent (DOM Component) */}
      <View style={styles.voiceContainer}>
        <VoiceAgent
          dom={{ style: { width: 160, height: 140, backgroundColor: 'transparent' } }}
          agentId={agentId}
          exerciseName={exercise.name}
          totalSets={totalSets}
          targetReps={targetReps}
          weight={weight}
          autoStart={false}
          onStatusChange={handleStatusChange}
          onTranscript={handleTranscript}
          onModeChange={handleModeChange}
          completeSet={completeSet}
          getWorkoutStatus={getWorkoutStatus}
          startRestTimer={startRestTimer}
        />
      </View>

      {/* End Button */}
      <Pressable
        onPress={endSession}
        style={({ pressed }) => [
          styles.endButton,
          pressed && styles.endButtonPressed,
        ]}
      >
        <Text style={styles.endButtonText}>END WORKOUT</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 8,
    padding: 8,
  },
  backText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  weight: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  setDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  dot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: '#FF3B30',
  },
  dotCurrent: {
    borderWidth: 2,
    borderColor: '#FF3B30',
    backgroundColor: '#FF3B3020',
  },
  dotText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '700',
  },
  dotTextCompleted: {
    color: '#FFFFFF',
  },
  mainDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  repContainer: {
    alignItems: 'center',
  },
  repCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  setLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  repCount: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
    marginVertical: -4,
  },
  repLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
  },
  restContainer: {
    alignItems: 'center',
  },
  restLabel: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 4,
  },
  restTimer: {
    color: '#FF6B35',
    fontSize: 80,
    fontWeight: '900',
    marginVertical: -8,
  },
  restUnit: {
    color: '#8E8E93',
    fontSize: 14,
    letterSpacing: 2,
  },
  nextSetText: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 12,
  },
  completeContainer: {
    alignItems: 'center',
  },
  completeEmoji: {
    fontSize: 64,
  },
  completeText: {
    color: '#30D158',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 12,
  },
  completeSummary: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 8,
  },
  agentMessage: {
    marginHorizontal: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FF3B3015',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  agentMessageText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  transcript: {
    maxHeight: 120,
    marginHorizontal: 20,
    marginTop: 12,
  },
  transcriptContent: {
    paddingVertical: 4,
  },
  transcriptEntry: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 8,
  },
  transcriptRole: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    width: 56,
  },
  transcriptRoleAgent: {
    color: '#FF3B30',
  },
  transcriptText: {
    color: '#CCCCCC',
    fontSize: 13,
    flex: 1,
  },
  voiceContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  endButton: {
    backgroundColor: '#2C2C2E',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  endButtonPressed: {
    backgroundColor: '#3C3C3E',
  },
  endButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
