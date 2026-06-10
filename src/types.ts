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
  dynamicId: string; // Index or Name of selected dynamic, which can be "אחר"
  customSituation: string;
  participantsCount: 2 | 3;
  durationMinutes: number;
  outputLanguage: 'עברית' | 'אנגלית' | 'ערבית';
  outputFormat: 'script' | 'flashcards';
  structureType?: 'full' | 'segments';
  tone: ConversationTone;
  customDynamicName?: string;
  customDynamicStructure?: string;
}

