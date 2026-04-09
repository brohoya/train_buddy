import { Workout, WorkoutExercise } from '../types';
import { EXERCISE_MAP } from '../constants/exercises';
import { buildGeneratorPrompt } from '../constants/generatorPrompt';

function generateId(): string {
  return `w_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Generate a workout using the Anthropic Claude API.
 * The prompt constrains output to our exact exercise IDs and JSON schema.
 */
export async function generateWorkout(
  userRequest: string,
  apiKey: string,
): Promise<Workout> {
  const systemPrompt = buildGeneratorPrompt();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userRequest }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const text: string = data.content[0].text;

  // Parse — handle potential markdown wrapping
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI did not return valid JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate every exercise ID exists in our database
  const validatedExercises: WorkoutExercise[] = [];
  for (const ex of parsed.exercises ?? []) {
    const dbEntry = EXERCISE_MAP.get(ex.exerciseId);
    if (!dbEntry) continue; // skip unknown exercises

    validatedExercises.push({
      exerciseId: ex.exerciseId,
      name: dbEntry.name, // always use DB name, not AI's
      sets: Math.max(1, Math.min(10, Number(ex.sets) || dbEntry.defaultSets)),
      reps: Math.max(1, Math.min(30, Number(ex.reps) || dbEntry.defaultReps)),
      restSeconds: Math.max(15, Math.min(300, Number(ex.restSeconds) || dbEntry.defaultRestSeconds)),
      order: validatedExercises.length + 1,
      notes: ex.notes,
    });
  }

  if (validatedExercises.length === 0) {
    throw new Error('AI generated no valid exercises');
  }

  // Recalculate estimated time
  const totalSeconds = validatedExercises.reduce(
    (sum, ex) => sum + ex.sets * (40 + ex.restSeconds),
    0,
  );

  return {
    id: generateId(),
    name: parsed.name || 'Custom Workout',
    description: parsed.description || '',
    targetMuscleGroups: parsed.targetMuscleGroups || [],
    exercises: validatedExercises,
    estimatedMinutes: Math.ceil(totalSeconds / 60),
    createdAt: Date.now(),
    isAIGenerated: true,
  };
}
