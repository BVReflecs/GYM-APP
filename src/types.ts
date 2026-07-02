/** Core domain model for GymForge. */

export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Piernas'
  | 'Hombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Core'
  | 'Glúteos'
  | 'Cardio'
  | 'Cuerpo completo';

export type Difficulty = 'Principiante' | 'Intermedio' | 'Avanzado';

export type GoalId = 'lose_weight' | 'endurance' | 'bulk' | 'strength' | 'general';

export interface Goal {
  id: GoalId;
  title: string;
  emoji: string;
  description: string;
  /** Suggested working range shown when building routines. */
  repRange: string;
  restSeconds: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  /** Muscles that do most of the work. */
  primaryMuscles: string[];
  /** Assisting/stabilizing muscles. */
  secondaryMuscles: string[];
  equipment: string;
  difficulty: Difficulty;
  /** Step-by-step technique cues. */
  instructions: string[];
  tips: string[];
  /** ids of related exercises to try as variations. */
  variations: string[];
  /** Search phrase used to open a tutorial video. */
  videoQuery: string;
}

/** A planned exercise inside a routine (targets, not results). */
export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  /** Optional starting/target weight in the user's unit. */
  weight?: number;
}

export interface Routine {
  id: string;
  name: string;
  goal: GoalId;
  exercises: RoutineExercise[];
  createdAt: number;
}

/** A single logged set during a workout. */
export interface LoggedSet {
  weight: number;
  reps: number;
  done: boolean;
}

/** All the sets logged for one exercise in one session. */
export interface LoggedExercise {
  exerciseId: string;
  sets: LoggedSet[];
}

/** A completed (or in-progress) training session. */
export interface WorkoutLog {
  id: string;
  routineId: string;
  routineName: string;
  date: number;
  exercises: LoggedExercise[];
  /** Total volume (Σ weight × reps) — cached for fast dashboards. */
  totalVolume: number;
}

export type Unit = 'lb' | 'kg';

export interface UserProfile {
  name: string;
  goal: GoalId;
  unit: Unit;
  onboarded: boolean;
}

/** A personal record derived from workout history, per exercise. */
export interface PersonalRecord {
  exerciseId: string;
  bestWeight: number;
  bestReps: number;
  /** Weight × reps of the best single set. */
  bestSetVolume: number;
  /** Last session's best set — the target to beat next time. */
  lastWeight: number;
  lastReps: number;
  date: number;
}
