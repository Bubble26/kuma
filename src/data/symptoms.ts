/**
 * Condition → symptom mapping.
 * Symptoms are dynamically composed based on selected conditions.
 */

export const CONDITION_SYMPTOMS: Record<string, string[]> = {
  eczema: ['Rashes', 'Dry patches', 'Itching', 'Redness', 'Flare-ups'],
  adhd: ['Hyperactivity', 'Difficulty focusing', 'Restlessness', 'Sleep issues'],
  food_allergies: ['Stomach pain', 'Hives', 'Swelling', 'Vomiting'],
  asthma: ['Wheezing', 'Coughing', 'Chest tightness'],
  celiac: ['Bloating', 'Stomach pain', 'Fatigue', 'Diarrhea'],
  skin_sensitivities: ['Redness', 'Dry patches', 'Irritation', 'Burning'],
  autism_sensory: ['Sensory overload', 'Meltdowns', 'Sleep issues', 'Restlessness'],
};

export const GENERAL_SYMPTOMS = [
  'Headaches',
  'Fatigue',
  'Mood changes',
  'Congestion',
];

/**
 * Build a deduplicated symptom list from selected conditions.
 */
export function getSymptomsForConditions(conditions: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  // Add condition-specific symptoms
  for (const cond of conditions) {
    const symptoms = CONDITION_SYMPTOMS[cond];
    if (symptoms) {
      for (const s of symptoms) {
        if (!seen.has(s)) {
          seen.add(s);
          result.push(s);
        }
      }
    }
  }

  // Always add general symptoms
  for (const s of GENERAL_SYMPTOMS) {
    if (!seen.has(s)) {
      seen.add(s);
      result.push(s);
    }
  }

  return result;
}
