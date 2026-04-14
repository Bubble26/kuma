export interface Condition {
  id: string;
  label: string;
  emoji: string;
}

export const CONDITIONS: Condition[] = [
  { id: 'eczema',            label: 'Eczema / Skin',       emoji: '🐻' },
  { id: 'adhd',              label: 'ADHD / Focus',        emoji: '⚡' },
  { id: 'asthma',            label: 'Asthma',              emoji: '💨' },
  { id: 'food_allergies',    label: 'Food Allergies',      emoji: '🤧' },
  { id: 'celiac',            label: 'Celiac / Gut',        emoji: '🍽️' },
  { id: 'skin_sensitivities',label: 'Skin Sensitivities',  emoji: '✨' },
  { id: 'autism_sensory',    label: 'Autism / Sensory',     emoji: '🧘' },
  { id: 'none',              label: 'None of these',        emoji: '💪' },
];
