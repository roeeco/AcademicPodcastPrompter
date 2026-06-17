export interface EducationalDynamic {
  name: string;
  defaultSituation: string;
}

export interface TeacherConfig {
  criteria: string;
  dynamicsText: string; // The raw line-separated text editable by the mentor
}

export type ConversationTone = 'ידידותי' | 'עצבני' | 'רשמי' | 'אנליטי' | 'גס';

export interface StudentSelection {
  sourceText: string;
  dynamicId?: string; // empty or undefined initially
  customSituation: string;
  participantsCount?: 1 | 2 | 3; // unselected initially (1 = Monologue, 2, 3)
  durationMinutes?: number; // unselected initially, maps to structure duration
  outputLanguage: 'עברית'; // Hebrew only per guidelines
  structureType?: 'full' | 'segments'; // unselected initially
  tone?: ConversationTone; // unselected initially
  customDynamicName?: string;
  workMode?: 'individual' | 'together'; // unselected initially (עובדים בנפרד / ביחד)
}


