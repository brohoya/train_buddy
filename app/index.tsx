import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import ExerciseCard from '../components/ExerciseCard';
import { EXERCISES } from '../src/constants/exercises';
import { Exercise } from '../src/types';

export default function HomeScreen() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;

  function selectExercise(exercise: Exercise) {
    setSelectedExercise(exercise);
    setSets(String(exercise.defaultSets));
    setReps(String(exercise.defaultReps));
  }

  function startSession() {
    if (!agentId || agentId === 'your_agent_id_here') {
      Alert.alert(
        'Agent Not Configured',
        'Set EXPO_PUBLIC_ELEVENLABS_AGENT_ID in your .env file. See README for setup instructions.',
      );
      return;
    }

    if (!selectedExercise) {
      Alert.alert('Select an Exercise', 'Tap an exercise above to select it.');
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>TRAIN</Text>
            <Text style={styles.titleAccent}>BUDDY</Text>
            <Text style={styles.subtitle}>AI Personal Trainer</Text>
          </View>

          {/* Agent status */}
          {(!agentId || agentId === 'your_agent_id_here') && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                Set up your ElevenLabs agent ID in .env to get started
              </Text>
            </View>
          )}

          {/* Exercise Selection */}
          <Text style={styles.sectionTitle}>CHOOSE YOUR EXERCISE</Text>
          <View style={styles.exerciseGrid}>
            {EXERCISES.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPress={selectExercise}
              />
            ))}
          </View>

          {/* Selected Exercise Config */}
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
                onPress={startSession}
                style={({ pressed }) => [
                  styles.startButton,
                  pressed && styles.startButtonPressed,
                ]}
              >
                <Text style={styles.startButtonText}>START SESSION</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  titleAccent: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FF3B30',
    letterSpacing: 6,
    marginTop: -8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    letterSpacing: 3,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  warning: {
    backgroundColor: '#FF3B3020',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FF3B3040',
  },
  warningText: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  configSection: {
    marginTop: 32,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FF3B3040',
  },
  configTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  startButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonPressed: {
    backgroundColor: '#CC2F26',
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
