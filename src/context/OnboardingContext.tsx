import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface OnboardingState {
  // Screen 9 — Who are you protecting?
  childName: string;
  childDOB: string;
  childPhoto: string;

  // Screen 10 — Conditions
  conditions: string[];

  // Screen 11 — Symptoms
  symptoms: string[];

  // Screen 12 — Allergies
  allergies: string[];

  // Screen 13 — Fragrance sensitivity
  fragranceSensitivity: 'none' | 'mild' | 'high' | 'unknown';

  // Screen 14 — Worries
  worries: string[];

  // Screen 15 — Used other apps?
  usedOtherApps: boolean;

  // Screen 19 — Zip code
  zipCode: string;

  // Screen 24 — Notifications
  notificationsEnabled: boolean;

  // Screen 30 — Referral
  referralShared: boolean;

  // Computed
  trialDays: 7 | 14;
}

const INITIAL_STATE: OnboardingState = {
  childName: '',
  childDOB: '',
  childPhoto: '',
  conditions: [],
  symptoms: [],
  allergies: [],
  fragranceSensitivity: 'unknown',
  worries: [],
  usedOtherApps: false,
  zipCode: '',
  notificationsEnabled: false,
  referralShared: false,
  trialDays: 7,
};

type OnboardingAction =
  | { type: 'SET_CHILD_INFO'; payload: { childName: string; childDOB?: string; childPhoto?: string } }
  | { type: 'SET_CONDITIONS'; payload: string[] }
  | { type: 'SET_SYMPTOMS'; payload: string[] }
  | { type: 'SET_ALLERGIES'; payload: string[] }
  | { type: 'SET_FRAGRANCE_SENSITIVITY'; payload: OnboardingState['fragranceSensitivity'] }
  | { type: 'SET_WORRIES'; payload: string[] }
  | { type: 'SET_USED_OTHER_APPS'; payload: boolean }
  | { type: 'SET_ZIP_CODE'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: boolean }
  | { type: 'SET_REFERRAL_SHARED'; payload: boolean }
  | { type: 'RESET' };

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_CHILD_INFO':
      return {
        ...state,
        childName: action.payload.childName,
        childDOB: action.payload.childDOB ?? state.childDOB,
        childPhoto: action.payload.childPhoto ?? state.childPhoto,
      };
    case 'SET_CONDITIONS':
      return { ...state, conditions: action.payload };
    case 'SET_SYMPTOMS':
      return { ...state, symptoms: action.payload };
    case 'SET_ALLERGIES':
      return { ...state, allergies: action.payload };
    case 'SET_FRAGRANCE_SENSITIVITY':
      return { ...state, fragranceSensitivity: action.payload };
    case 'SET_WORRIES':
      return { ...state, worries: action.payload };
    case 'SET_USED_OTHER_APPS':
      return { ...state, usedOtherApps: action.payload };
    case 'SET_ZIP_CODE':
      return { ...state, zipCode: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notificationsEnabled: action.payload };
    case 'SET_REFERRAL_SHARED':
      return {
        ...state,
        referralShared: action.payload,
        trialDays: action.payload ? 14 : 7,
      };
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}

interface OnboardingContextValue {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, INITIAL_STATE);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return ctx;
}
