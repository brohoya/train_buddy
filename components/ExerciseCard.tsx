import { Pressable, Text, View, StyleSheet } from 'react-native';
import { ExerciseDefinition } from '../src/types';

interface ExerciseCardProps {
  exercise: ExerciseDefinition;
  onPress: (exercise: ExerciseDefinition) => void;
}

export default function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  return (
    <Pressable
      onPress={() => onPress(exercise)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.emoji}>{exercise.emoji}</Text>
      <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {exercise.defaultSets} x {exercise.defaultReps}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    width: '47%',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardPressed: {
    backgroundColor: '#2C2C2E',
    transform: [{ scale: 0.97 }],
  },
  emoji: { fontSize: 32 },
  name: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 10 },
  meta: { marginTop: 6, flexDirection: 'row', alignItems: 'center' },
  metaText: { color: '#8E8E93', fontSize: 13, fontWeight: '500' },
});
