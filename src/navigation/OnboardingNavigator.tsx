import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createPlaceholder } from '../screens/onboarding/PlaceholderScreen';
import S01_Welcome from '../screens/onboarding/S01_Welcome';
import S02_ScaryStat from '../screens/onboarding/S02_ScaryStat';
import S03_GentleLie from '../screens/onboarding/S03_GentleLie';
import S04_DifferentChildren from '../screens/onboarding/S04_DifferentChildren';
import S05_HiddenTriggers from '../screens/onboarding/S05_HiddenTriggers';
import S06_BannedEurope from '../screens/onboarding/S06_BannedEurope';
import S07_DifferentFormulas from '../screens/onboarding/S07_DifferentFormulas';
import S08_Testimonials from '../screens/onboarding/S08_Testimonials';
import S09_AddChild from '../screens/onboarding/S09_AddChild';
import S10_SelectConditions from '../screens/onboarding/S10_SelectConditions';
import S11_SymptomGrid from '../screens/onboarding/S11_SymptomGrid';
import S12_Allergies from '../screens/onboarding/S12_Allergies';
import S13_ScentedReaction from '../screens/onboarding/S13_ScentedReaction';
import S14_Worries from '../screens/onboarding/S14_Worries';
import S15_PriorApps from '../screens/onboarding/S15_PriorApps';
import S16_ScanDemoBad from '../screens/onboarding/S16_ScanDemoBad';
import S17_ScanDemoGood from '../screens/onboarding/S17_ScanDemoGood';
import S18_IngredientDecoder from '../screens/onboarding/S18_IngredientDecoder';
import S19_ZipCode from '../screens/onboarding/S19_ZipCode';

// ─── Param list for all 31 onboarding screens + post-payment ─────────────
export type OnboardingStackParamList = {
  // Block 1: EDUCATION (1-8)
  S01_Welcome: undefined;
  S02_ScaryStat: undefined;
  S03_GentleLie: undefined;
  S04_DifferentChildren: undefined;
  S05_HiddenTriggers: undefined;
  S06_BannedEurope: undefined;
  S07_DifferentFormulas: undefined;
  S08_Testimonials: undefined;

  // Block 2: PERSONALIZE (9-15)
  S09_WhoAreYouProtecting: undefined;
  S10_SelectConditions: undefined;
  S11_SymptomGrid: undefined;
  S12_Allergies: undefined;
  S13_ScentedReaction: undefined;
  S14_Worries: undefined;
  S15_UsedOtherApps: undefined;

  // Block 3: FEATURES (16-23)
  S16_ScanDemo_Bad: undefined;
  S17_ScanDemo_GoodSwap: undefined;
  S18_IngredientDecoder: undefined;
  S19_EnterZip: undefined;
  S20_WaterTrends: undefined;
  S21_CommunityRatings: undefined;
  S22_LowStimShows: undefined;
  S23_BenefitCarousel: undefined;

  // Block 4: CLOSE (24-31)
  S24_Notifications: undefined;
  S25_KumaPledge: undefined;
  S26_FakeLoading: undefined;
  S27_ProfileReveal: undefined;
  S28_RatingPrompt: undefined;
  S29_CommitmentRitual: undefined;
  S30_ReferralGate: undefined;
  S31_Paywall: undefined;

  // Post-paywall
  PostPaymentLoading: undefined;
};

export const SCREEN_ORDER: (keyof OnboardingStackParamList)[] = [
  'S01_Welcome',
  'S02_ScaryStat',
  'S03_GentleLie',
  'S04_DifferentChildren',
  'S05_HiddenTriggers',
  'S06_BannedEurope',
  'S07_DifferentFormulas',
  'S08_Testimonials',
  'S09_WhoAreYouProtecting',
  'S10_SelectConditions',
  'S11_SymptomGrid',
  'S12_Allergies',
  'S13_ScentedReaction',
  'S14_Worries',
  'S15_UsedOtherApps',
  'S16_ScanDemo_Bad',
  'S17_ScanDemo_GoodSwap',
  'S18_IngredientDecoder',
  'S19_EnterZip',
  'S20_WaterTrends',
  'S21_CommunityRatings',
  'S22_LowStimShows',
  'S23_BenefitCarousel',
  'S24_Notifications',
  'S25_KumaPledge',
  'S26_FakeLoading',
  'S27_ProfileReveal',
  'S28_RatingPrompt',
  'S29_CommitmentRitual',
  'S30_ReferralGate',
  'S31_Paywall',
  'PostPaymentLoading',
];

// ─── Screen configs: title, subtitle, block label, background, skip ─────
type ScreenConfig = {
  title: string;
  subtitle: string;
  block: string;
  background: 'navy' | 'navyDark' | 'navyExtraDark' | 'cream';
  canSkip: boolean;
};

const CONFIGS: Record<keyof OnboardingStackParamList, ScreenConfig> = {
  S01_Welcome:            { title: 'Welcome Splash', subtitle: 'Welcome to Kuma', block: 'EDUCATION', background: 'navy', canSkip: true },
  S02_ScaryStat:          { title: 'Scary Stat', subtitle: 'The truth about children\'s products', block: 'EDUCATION', background: 'navy', canSkip: true },
  S03_GentleLie:        { title: 'The Gentle Lie', subtitle: 'Marketing labels vs. reality', block: 'EDUCATION', background: 'navy', canSkip: true },
  S04_DifferentChildren:    { title: 'Different Children', subtitle: 'Same product, different scores', block: 'EDUCATION', background: 'navy', canSkip: true },
  S05_HiddenTriggers:     { title: 'Hidden Triggers', subtitle: 'Real ingredients linked to conditions', block: 'EDUCATION', background: 'cream', canSkip: true },
  S06_BannedEurope:     { title: 'Banned in Europe', subtitle: 'Banned for EU kids, sold to US kids', block: 'EDUCATION', background: 'navy', canSkip: true },
  S07_DifferentFormulas:  { title: 'Different Formulas', subtitle: 'Same brand, different ingredients by country', block: 'EDUCATION', background: 'navy', canSkip: true },
  S08_Testimonials:       { title: 'Parent Testimonials', subtitle: 'Real parents, real results', block: 'EDUCATION', background: 'navy', canSkip: true },

  S09_WhoAreYouProtecting: { title: 'Who Are You Protecting?', subtitle: 'Enter your child\'s name and birthday', block: 'PERSONALIZE', background: 'navy', canSkip: false },
  S10_SelectConditions:    { title: 'Select Conditions', subtitle: 'What conditions does your child have?', block: 'PERSONALIZE', background: 'navy', canSkip: false },
  S11_SymptomGrid:         { title: 'Symptom Grid', subtitle: 'Which symptoms do they experience?', block: 'PERSONALIZE', background: 'navy', canSkip: false },
  S12_Allergies:           { title: 'Allergies', subtitle: 'Select any known allergies', block: 'PERSONALIZE', background: 'navy', canSkip: false },
  S13_ScentedReaction:     { title: 'Scented Product Reaction', subtitle: 'How does your child react to scented products?', block: 'PERSONALIZE', background: 'navy', canSkip: false },
  S14_Worries:             { title: 'What Worries You Most?', subtitle: 'Select your top concerns', block: 'PERSONALIZE', background: 'navy', canSkip: false },
  S15_UsedOtherApps:       { title: 'Used Other Apps?', subtitle: 'Have you tried other product scanning apps?', block: 'PERSONALIZE', background: 'navy', canSkip: false },

  S16_ScanDemo_Bad:       { title: 'Scan Demo — Bad Result', subtitle: 'See how Kuma flags harmful ingredients', block: 'FEATURES', background: 'cream', canSkip: false },
  S17_ScanDemo_GoodSwap:  { title: 'Scan Demo — Good Swap', subtitle: 'A safer alternative for your child', block: 'FEATURES', background: 'cream', canSkip: false },
  S18_IngredientDecoder:  { title: 'Ingredient Decoder', subtitle: 'Understand what\'s really in the products', block: 'FEATURES', background: 'navy', canSkip: false },
  S19_EnterZip:           { title: 'Enter Zip Code', subtitle: 'Check your local water quality', block: 'FEATURES', background: 'navy', canSkip: false },
  S20_WaterTrends:        { title: 'Water Trends', subtitle: 'Your area\'s water quality over time', block: 'FEATURES', background: 'navy', canSkip: false },
  S21_CommunityRatings:   { title: 'Community Ratings', subtitle: 'What other parents with similar children say', block: 'FEATURES', background: 'navy', canSkip: false },
  S22_LowStimShows:       { title: 'Low-Stim Shows', subtitle: 'Screen time recommendations for your child', block: 'FEATURES', background: 'navy', canSkip: false },
  S23_BenefitCarousel:    { title: 'Benefit Carousel', subtitle: 'Everything Kuma does for your family', block: 'FEATURES', background: 'navy', canSkip: false },

  S24_Notifications:      { title: 'Notifications', subtitle: 'Stay updated on recalls and alerts', block: 'CLOSE', background: 'navy', canSkip: false },
  S25_KumaPledge:         { title: 'Kuma Pledge', subtitle: 'Our promise to your family', block: 'CLOSE', background: 'navyExtraDark', canSkip: false },
  S26_FakeLoading:        { title: 'Building Your Profile', subtitle: 'Personalizing Kuma for your child', block: 'CLOSE', background: 'navy', canSkip: false },
  S27_ProfileReveal:      { title: 'Profile Reveal', subtitle: 'Your child\'s personalized safety profile', block: 'CLOSE', background: 'navy', canSkip: false },
  S28_RatingPrompt:       { title: 'Rate Kuma', subtitle: 'Help other parents find us', block: 'CLOSE', background: 'navy', canSkip: false },
  S29_CommitmentRitual:   { title: 'Commitment Ritual', subtitle: 'One small step for your child\'s safety', block: 'CLOSE', background: 'navyExtraDark', canSkip: false },
  S30_ReferralGate:       { title: 'Referral', subtitle: 'Share Kuma, get a longer trial', block: 'CLOSE', background: 'navy', canSkip: false },
  S31_Paywall:            { title: 'Paywall', subtitle: 'Start protecting your child today', block: 'CLOSE', background: 'navy', canSkip: false },

  PostPaymentLoading:     { title: 'Setting Up...', subtitle: 'Preparing your personalized experience', block: 'POST', background: 'navy', canSkip: false },
};

// ─── Real screen components (replace placeholders as built) ─────────────
const REAL_SCREENS: Partial<Record<keyof OnboardingStackParamList, React.ComponentType<any>>> = {
  S01_Welcome,
  S02_ScaryStat,
  S03_GentleLie,
  S04_DifferentChildren,
  S05_HiddenTriggers,
  S06_BannedEurope,
  S07_DifferentFormulas,
  S08_Testimonials,
  S09_WhoAreYouProtecting: S09_AddChild,
  S10_SelectConditions,
  S11_SymptomGrid,
  S12_Allergies,
  S13_ScentedReaction,
  S14_Worries,
  S15_UsedOtherApps: S15_PriorApps,
  S16_ScanDemo_Bad: S16_ScanDemoBad,
  S17_ScanDemo_GoodSwap: S17_ScanDemoGood,
  S18_IngredientDecoder,
  S19_EnterZip: S19_ZipCode,
};

// ─── Create placeholder components for remaining screens ────────────────
const screens = Object.fromEntries(
  SCREEN_ORDER.map((name, index) => [
    name,
    REAL_SCREENS[name] ?? createPlaceholder({
      ...CONFIGS[name],
      screenNumber: index + 1,
    }),
  ])
) as Record<keyof OnboardingStackParamList, React.ComponentType<any>>;

// ─── Navigator ──────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      {SCREEN_ORDER.map((name) => (
        <Stack.Screen
          key={name}
          name={name}
          component={screens[name]}
        />
      ))}
    </Stack.Navigator>
  );
}
