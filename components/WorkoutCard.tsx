import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Workout } from '../src/types';

interface WorkoutCardProps {
  workout: Workout;
  onPress: (workout: Workout) => void;
  onDelete: (id: string) => void;
}

export default function WorkoutCard({ workout, onPress, onDelete }: WorkoutCardProps) {
  return (
    <Pressable
      onPress={() => onPress(workout)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{workout.name}</Text>
          <Text style={styles.meta}>
            {workout.exercises.length} exercises · ~{workout.estimatedMinutes} min
            {workout.isAIGenerated ? ' · AI' : ''}
          </Text>
          <Text style={styles.muscles} numberOfLines={1}>
            {workout.targetMuscleGroups.join(', ')}
          </Text>
        </View>
        <View style={styles.actions}>
          <View style={styles.playCircle}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
          <Pressable onPress={() => onDelete(workout.id)} hitSlop={8}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardPressed: { backgroundColor: '#2C2C2E' },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  meta: { color: '#8E8E93', fontSize: 12, marginTop: 4 },
  muscles: { color: '#FF3B30', fontSize: 11, fontWeight: '600', marginTop: 3, textTransform: 'capitalize' },
  actions: { alignItems: 'center', gap: 8 },
  playCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 14, marginLeft: 2 },
  deleteText: { color: '#8E8E93', fontSize: 11 },
});
