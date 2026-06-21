export interface EducationalDynamic {
  name: string;
  defaultSituation: string;
}

export interface TeacherConfig {
  dynamicsText: string; // The raw line-separated text editable by the mentor
  enableTextAnalyzer?: boolean; // Toggle for student draft evaluation
}

export type ConversationTone = 'ידידותי' | 'עצבני' | 'רשמי' | 'אנליטי' | 'גס';
export type SimulationType = 'pedagogical' | 'absolute';

export interface StudentSelection {
  stanceText: string;
  counterText: string;
  reflectionText: string;
  dynamicId?: string; // empty or undefined initially
  customSituation: string;
  participantsCount?: 1 | 2 | 3; // unselected initially (1 = Monologue, 2, 3)
  durationMinutes?: number; // unselected initially, maps to structure duration
  outputLanguage: 'עברית'; // Hebrew only per guidelines
  structureType?: 'full' | 'segments'; // unselected initially
  tone?: ConversationTone; // unselected initially
  customDynamicName?: string;
  workMode?: 'individual' | 'together'; // unselected initially (עובדים בנפרד / ביחד)
  simulationType?: SimulationType; // 'pedagogical' (סימולציה) or 'absolute' (סימולציה מוחלטת)
  genderSelected?: string; // e.g. 'זכר + נקבה' etc.
}


