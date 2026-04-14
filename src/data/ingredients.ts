/**
 * Condition → flagged ingredient mapping for scan demos.
 * Each ingredient has a name and a short reason.
 */

export interface FlaggedIngredient {
  name: string;
  reason: string;
}

export const CONDITION_INGREDIENTS: Record<string, FlaggedIngredient[]> = {
  eczema: [
    { name: 'Sodium Lauryl Sulfate', reason: 'linked to eczema flare-ups' },
    { name: 'Fragrance', reason: 'contains undisclosed allergens' },
    { name: 'Methylisothiazolinone', reason: 'EU restricted for leave-on products' },
  ],
  adhd: [
    { name: 'Red 40', reason: 'linked to hyperactivity in children' },
    { name: 'Yellow 5', reason: 'associated with attention issues' },
    { name: 'Sodium Benzoate', reason: 'may exacerbate ADHD symptoms' },
  ],
  food_allergies: [
    { name: 'Casein', reason: 'hidden milk derivative' },
    { name: 'Hydrolyzed Wheat Protein', reason: 'hidden gluten source' },
    { name: 'Cross-contamination risk', reason: 'processed on shared equipment' },
  ],
  asthma: [
    { name: 'Fragrance', reason: 'can trigger respiratory reactions' },
    { name: 'Sodium Lauryl Sulfate', reason: 'airway irritant when inhaled' },
    { name: 'Formaldehyde releasers', reason: 'known asthma trigger' },
  ],
  celiac: [
    { name: 'Hydrolyzed Wheat Protein', reason: 'hidden gluten source' },
    { name: 'Tocopheryl Acetate', reason: 'may be wheat-derived' },
    { name: 'Maltodextrin', reason: 'potentially derived from wheat' },
  ],
  skin_sensitivities: [
    { name: 'Fragrance', reason: 'top cause of contact dermatitis' },
    { name: 'Methylisothiazolinone', reason: 'known skin sensitizer' },
    { name: 'Propylene Glycol', reason: 'can cause irritation in sensitive skin' },
  ],
  autism_sensory: [
    { name: 'Fragrance', reason: 'sensory overwhelm trigger' },
    { name: 'Red 40', reason: 'linked to behavioral changes' },
    { name: 'Sodium Lauryl Sulfate', reason: 'skin irritant affecting comfort' },
  ],
};

/**
 * Pick the top N flagged ingredients based on selected conditions.
 * Deduplicates by ingredient name, prioritizes by condition order.
 */
export function getFlaggedIngredients(
  conditions: string[],
  count: number = 3
): FlaggedIngredient[] {
  const seen = new Set<string>();
  const result: FlaggedIngredient[] = [];

  for (const cond of conditions) {
    const ingredients = CONDITION_INGREDIENTS[cond];
    if (!ingredients) continue;
    for (const ing of ingredients) {
      if (!seen.has(ing.name) && result.length < count) {
        seen.add(ing.name);
        result.push(ing);
      }
    }
  }

  // Fallback if no conditions matched
  if (result.length === 0) {
    return CONDITION_INGREDIENTS.eczema.slice(0, count);
  }

  return result;
}
