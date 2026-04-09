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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { EXERCISE_DB, MUSCLE_GROUPS, MUSCLE_GROUP_LABELS } from '../src/constants/exercises';
import { ExerciseDefinition, Workout, WorkoutExercise } from '../src/types';
import { generateWorkout } from '../src/services/workoutGenerator';
import { saveWorkout } from '../src/services/storage';

export default function CreateScreen() {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  // ── AI Generation ─────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    if (!apiKey) {
      Alert.alert('API Key Missing', 'Set EXPO_PUBLIC_ANTHROPIC_API_KEY in .env for AI generation.');
      return;
    }

    setGenerating(true);
    try {
      const workout = await generateWorkout(aiPrompt.trim(), apiKey);
      setName(workout.name);
      setExercises(workout.exercises);
      setAiPrompt('');
    } catch (err: any) {
      Alert.alert('Generation Failed', err.message || 'Try a different prompt.');
    } finally {
      setGenerating(false);
    }
  }, [aiPrompt, apiKey]);

  // ── Manual exercise management ────────────────────────
  const addExercise = useCallback((def: ExerciseDefinition) => {
    setExercises(prev => [
      ...prev,
      {
        exerciseId: def.id,
        name: def.name,
        sets: def.defaultSets,
        reps: def.defaultReps,
        restSeconds: def.defaultRestSeconds,
        order: prev.length + 1,
      },
    ]);
    setShowPicker(false);
  }, []);

  const removeExercise = useCallback((index: number) => {
    setExercises(prev =>
      prev.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, order: i + 1 })),
    );
  }, []);

  const updateExercise = useCallback(
    (index: number, field: 'sets' | 'reps' | 'restSeconds', value: string) => {
      setExercises(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: Math.max(1, Number(value) || 1) };
        return updated;
      });
    },
    [],
  );

  // ── Save ──────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Give your workout a name.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise.');
      return;
    }

    const muscles = [...new Set(
      exercises.flatMap(ex => {
        const def = EXERCISE_DB.find(d => d.id === ex.exerciseId);
        return def ? [def.primaryMuscle] : [];
      }),
    )];

    const totalSeconds = exercises.reduce(
      (s, ex) => s + ex.sets * (40 + ex.restSeconds),
      0,
    );

    const workout: Workout = {
      id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      description: `${exercises.length} exercises, ~${Math.ceil(totalSeconds / 60)} min`,
      targetMuscleGroups: muscles as any[],
      exercises,
      estimatedMinutes: Math.ceil(totalSeconds / 60),
      createdAt: Date.now(),
      isAIGenerated: false,
    };

    await saveWorkout(workout);
    router.back();
  }, [name, exercises]);

  // ── Filtered exercises for picker ─────────────────────
  const filteredExercises = muscleFilter
    ? EXERCISE_DB.filter(e => e.primaryMuscle === muscleFilter)
    : EXERCISE_DB;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{'<'} Back</Text>
          </Pressable>
          <Text style={styles.title}>CREATE WORKOUT</Text>
        </View>

        {/* AI Generate */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI GENERATE</Text>
          <View style={styles.aiRow}>
            <TextInput
              style={styles.aiInput}
              placeholder="e.g. arms, push day, heavy legs..."
              placeholderTextColor="#4A4A4A"
              value={aiPrompt}
              onChangeText={setAiPrompt}
              onSubmitEditing={handleGenerate}
              returnKeyType="go"
            />
            <Pressable
              onPress={handleGenerate}
              style={[styles.aiButton, generating && styles.aiButtonDisabled]}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.aiButtonText}>GO</Text>
              )}
            </Pressable>
          </View>
          {!apiKey && (
            <Text style={styles.hint}>Set EXPO_PUBLIC_ANTHROPIC_API_KEY in .env for AI generation</Text>
          )}
        </View>

        {/* Workout Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WORKOUT NAME</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Push Day, Arm Blaster..."
            placeholderTextColor="#4A4A4A"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Exercise List */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            EXERCISES ({exercises.length})
          </Text>
          {exercises.map((ex, i) => (
            <View key={`${ex.exerciseId}-${i}`} style={styles.exerciseRow}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseOrder}>{i + 1}</Text>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Pressable onPress={() => removeExercise(i)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>X</Text>
                </Pressable>
              </View>
              <View style={styles.exerciseFields}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Sets</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={String(ex.sets)}
                    onChangeText={v => updateExercise(i, 'sets', v)}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Reps</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={String(ex.reps)}
                    onChangeText={v => updateExercise(i, 'reps', v)}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Rest</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={String(ex.restSeconds)}
                    onChangeText={v => updateExercise(i, 'restSeconds', v)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>
          ))}

          <Pressable onPress={() => setShowPicker(!showPicker)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>{showPicker ? 'CLOSE' : '+ ADD EXERCISE'}</Text>
          </Pressable>
        </View>

        {/* Exercise Picker */}
        {showPicker && (
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <Pressable
                onPress={() => setMuscleFilter(null)}
                style={[styles.filterChip, !muscleFilter && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, !muscleFilter && styles.filterChipTextActive]}>All</Text>
              </Pressable>
              {MUSCLE_GROUPS.map(m => (
                <Pressable
                  key={m}
                  onPress={() => setMuscleFilter(m)}
                  style={[styles.filterChip, muscleFilter === m && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, muscleFilter === m && styles.filterChipTextActive]}>
                    {MUSCLE_GROUP_LABELS[m]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {filteredExercises.map(def => (
              <Pressable key={def.id} onPress={() => addExercise(def)} style={styles.pickerItem}>
                <Text style={styles.pickerEmoji}>{def.emoji}</Text>
                <View style={styles.pickerInfo}>
                  <Text style={styles.pickerName}>{def.name}</Text>
                  <Text style={styles.pickerMeta}>
                    {MUSCLE_GROUP_LABELS[def.primaryMuscle]} · {def.equipment} · {def.defaultSets}x{def.defaultReps}
                  </Text>
                </View>
                <Text style={styles.pickerAdd}>+</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Save */}
        {exercises.length > 0 && (
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          >
            <Text style={styles.saveBtnText}>SAVE WORKOUT</Text>
          </Pressable>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { paddingHorizontal: 20 },

  header: { alignItems: 'center', paddingTop: 10, marginBottom: 20 },
  backBtn: { position: 'absolute', left: 0, top: 10 },
  backText: { color: '#8E8E93', fontSize: 16 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 2 },

  section: { marginBottom: 24 },
  sectionLabel: { color: '#8E8E93', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },

  // AI Generate
  aiRow: { flexDirection: 'row', gap: 10 },
  aiInput: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#2C2C2E' },
  aiButton: { backgroundColor: '#FF3B30', borderRadius: 12, width: 56, alignItems: 'center', justifyContent: 'center' },
  aiButtonDisabled: { opacity: 0.5 },
  aiButtonText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  hint: { color: '#4A4A4A', fontSize: 11, marginTop: 6 },

  // Name
  nameInput: { backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 17, fontWeight: '700', borderWidth: 1, borderColor: '#2C2C2E' },

  // Exercise list
  exerciseRow: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2C2C2E' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  exerciseOrder: { color: '#FF3B30', fontSize: 16, fontWeight: '900', width: 24 },
  exerciseName: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 },
  removeBtn: { padding: 6 },
  removeBtnText: { color: '#8E8E93', fontSize: 14, fontWeight: '700' },
  exerciseFields: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, alignItems: 'center' },
  fieldLabel: { color: '#8E8E93', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  fieldInput: { backgroundColor: '#2C2C2E', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', width: '100%' },

  addBtn: { borderWidth: 1, borderColor: '#2C2C2E', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  addBtnText: { color: '#8E8E93', fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  // Picker
  filterRow: { gap: 8, marginBottom: 12, paddingVertical: 4 },
  filterChip: { backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  filterChipActive: { backgroundColor: '#FF3B30' },
  filterChipText: { color: '#8E8E93', fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: '#fff' },

  pickerItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, marginBottom: 6 },
  pickerEmoji: { fontSize: 20, width: 32 },
  pickerInfo: { flex: 1 },
  pickerName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  pickerMeta: { color: '#8E8E93', fontSize: 11, marginTop: 2 },
  pickerAdd: { color: '#FF3B30', fontSize: 22, fontWeight: '700', width: 28, textAlign: 'center' },

  // Save
  saveBtn: { backgroundColor: '#FF3B30', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8, shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  saveBtnPressed: { backgroundColor: '#CC2F26', transform: [{ scale: 0.98 }] },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 3 },
});
