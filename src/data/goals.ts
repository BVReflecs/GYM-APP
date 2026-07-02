import { Goal, GoalId } from '../types';

export const GOALS: Goal[] = [
  {
    id: 'lose_weight',
    title: 'Bajar de peso',
    emoji: '🔥',
    description: 'Quemar grasa con circuitos, más repeticiones y descansos cortos.',
    repRange: '12–20 reps',
    restSeconds: 45,
  },
  {
    id: 'bulk',
    title: 'Ganar músculo (Bulk)',
    emoji: '💪',
    description: 'Hipertrofia: volumen moderado-alto para crecer.',
    repRange: '8–12 reps',
    restSeconds: 75,
  },
  {
    id: 'strength',
    title: 'Fuerza',
    emoji: '🏋️',
    description: 'Levantar más peso con menos reps y descansos largos.',
    repRange: '3–6 reps',
    restSeconds: 150,
  },
  {
    id: 'endurance',
    title: 'Condición física',
    emoji: '⚡',
    description: 'Resistencia y salud cardiovascular con ritmo constante.',
    repRange: '15–25 reps',
    restSeconds: 40,
  },
  {
    id: 'general',
    title: 'Mantenerme en forma',
    emoji: '✨',
    description: 'Un equilibrio general de fuerza, tono y movilidad.',
    repRange: '10–15 reps',
    restSeconds: 60,
  },
];

export function getGoal(id: GoalId): Goal {
  return GOALS.find((g) => g.id === id) ?? GOALS[4];
}
