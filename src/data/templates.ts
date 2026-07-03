import { GoalId, RoutineExercise } from '../types';

export interface RoutineTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  goal: GoalId;
  exercises: RoutineExercise[];
}

/**
 * Ready-made routines so a new user can start training with one tap.
 * Exercise ids must exist in src/data/exercises.ts.
 */
export const TEMPLATES: RoutineTemplate[] = [
  {
    id: 'tpl_push',
    name: 'Push · Pecho, hombro y tríceps',
    emoji: '🔺',
    description: 'Día de empuje clásico para hipertrofia.',
    goal: 'bulk',
    exercises: [
      { exerciseId: 'bench_press', sets: 4, reps: 8 },
      { exerciseId: 'incline_bench', sets: 3, reps: 10 },
      { exerciseId: 'dumbbell_shoulder_press', sets: 3, reps: 10 },
      { exerciseId: 'lateral_raise', sets: 3, reps: 12 },
      { exerciseId: 'tricep_pushdown', sets: 3, reps: 12 },
    ],
  },
  {
    id: 'tpl_pull',
    name: 'Pull · Espalda y bíceps',
    emoji: '🔻',
    description: 'Día de jalón para una espalda ancha.',
    goal: 'bulk',
    exercises: [
      { exerciseId: 'lat_pulldown', sets: 4, reps: 10 },
      { exerciseId: 'barbell_row', sets: 3, reps: 8 },
      { exerciseId: 'seated_row', sets: 3, reps: 10 },
      { exerciseId: 'face_pull', sets: 3, reps: 15 },
      { exerciseId: 'barbell_curl', sets: 3, reps: 10 },
      { exerciseId: 'hammer_curl', sets: 3, reps: 12 },
    ],
  },
  {
    id: 'tpl_legs',
    name: 'Piernas y glúteos',
    emoji: '🦵',
    description: 'Día completo de tren inferior.',
    goal: 'bulk',
    exercises: [
      { exerciseId: 'squat', sets: 4, reps: 8 },
      { exerciseId: 'romanian_deadlift', sets: 3, reps: 10 },
      { exerciseId: 'leg_press', sets: 3, reps: 12 },
      { exerciseId: 'hip_thrust', sets: 3, reps: 10 },
      { exerciseId: 'leg_curl', sets: 3, reps: 12 },
      { exerciseId: 'calf_raise', sets: 4, reps: 15 },
    ],
  },
  {
    id: 'tpl_fullbody',
    name: 'Full Body · Principiante',
    emoji: '🌱',
    description: 'Todo el cuerpo en una sesión, ideal para empezar (2-3x por semana).',
    goal: 'general',
    exercises: [
      { exerciseId: 'goblet_squat', sets: 3, reps: 12 },
      { exerciseId: 'dumbbell_press', sets: 3, reps: 12 },
      { exerciseId: 'lat_pulldown', sets: 3, reps: 12 },
      { exerciseId: 'dumbbell_shoulder_press', sets: 3, reps: 12 },
      { exerciseId: 'plank', sets: 3, reps: 30 },
    ],
  },
  {
    id: 'tpl_fatburn',
    name: 'Quema grasa · Circuito',
    emoji: '🔥',
    description: 'Circuito de alta intensidad con descansos cortos.',
    goal: 'lose_weight',
    exercises: [
      { exerciseId: 'burpee', sets: 4, reps: 12 },
      { exerciseId: 'goblet_squat', sets: 4, reps: 15 },
      { exerciseId: 'pushup', sets: 4, reps: 15 },
      { exerciseId: 'lunge', sets: 4, reps: 16 },
      { exerciseId: 'plank', sets: 3, reps: 45 },
    ],
  },
];
