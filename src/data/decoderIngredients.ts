/**
 * Condition → decoder ingredient for the Ingredient Decoder screen.
 * Each has a chemical name, plain-english description, and condition-specific flag.
 */

export interface DecoderIngredient {
  name: string;
  description: string;
  conditionTag: string;
}

export const CONDITION_DECODER: Record<string, DecoderIngredient> = {
  eczema: {
    name: 'Methylparaben',
    description: "A preservative linked to hormone disruption. Flagged for {childName}'s skin sensitivity.",
    conditionTag: 'Eczema',
  },
  adhd: {
    name: 'Red 40',
    description: 'An artificial dye linked to hyperactivity and attention issues in children. Banned in several EU countries.',
    conditionTag: 'ADHD',
  },
  food_allergies: {
    name: 'Casein',
    description: "A milk-derived protein hidden under a chemical name. Can trigger allergic reactions in dairy-sensitive children.",
    conditionTag: 'Food Allergies',
  },
  asthma: {
    name: 'Sodium Lauryl Sulfate',
    description: 'A foaming agent that can irritate airways when inhaled during bathing. Common asthma trigger.',
    conditionTag: 'Asthma',
  },
  celiac: {
    name: 'Hydrolyzed Wheat Protein',
    description: 'A hidden gluten source that can trigger immune responses in celiac children, even in skincare products.',
    conditionTag: 'Celiac',
  },
  skin_sensitivities: {
    name: 'Fragrance',
    description: 'An umbrella term hiding 30+ undisclosed chemicals. The #1 cause of contact dermatitis in children.',
    conditionTag: 'Skin Sensitivity',
  },
  autism_sensory: {
    name: 'Fragrance',
    description: 'Strong synthetic scents can cause sensory overwhelm and discomfort for children with sensory processing differences.',
    conditionTag: 'Sensory',
  },
};

/** Default fallback if no conditions selected */
export const DEFAULT_DECODER: DecoderIngredient = {
  name: 'Methylparaben',
  description: "A preservative linked to hormone disruption. Flagged for {childName}'s safety profile.",
  conditionTag: 'General',
};

/**
 * Pick the best decoder ingredient based on selected conditions.
 */
export function getDecoderIngredient(conditions: string[]): DecoderIngredient {
  for (const cond of conditions) {
    if (CONDITION_DECODER[cond]) {
      return CONDITION_DECODER[cond];
    }
  }
  return DEFAULT_DECODER;
}
