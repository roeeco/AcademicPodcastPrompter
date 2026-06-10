import { StudentSelection, TeacherConfig, ConversationTone } from '../types';

export function parseDynamics(rawText: string) {
  return rawText
    .split('\n')
    .map((line) => {
      const parts = line.split('|');
      if (parts.length >= 1) {
        const name = parts[0].trim();
        const defaultSituation = parts[1] ? parts[1].trim() : '';
        if (name) {
          return { name, defaultSituation };
        }
      }
      return null;
    })
    .filter((item): item is { name: string; defaultSituation: string } => item !== null);
}

const TONE_MAPPINGS: Record<ConversationTone, string> = {
  ידידותי: 'Warm, collaborative, friendly yet intellectually challenging. Tone of voice is constructive, encouraging, and supportive but still holds academic merit.',
  עצבני: 'Highly tense, irritable, aggressive, and impatient. The characters have extremely thin skin, speak with raw tension, interrupt each other, and conceptually provoke back-and-forth friction.',
  רשמי: 'Very formal, highly scholastic, and strictly professional. Uses academic vocabulary, proper etiquette, and maintains cold, formal scholastic boundaries.',
  אנליטי: 'Extremely cold, objective, logical, and data-driven. Pragmatic and precise, dissecting flaws instantly with critical arguments, devoid of personal emotions.',
  גס: 'Blunt, direct, unpolished, and very confrontational. Characters do not hold back, speak their minds without sugarcoating or artificial filters, and point out flaws aggressively.',
};

export function compilePrompt(
  student: StudentSelection,
  teacher: TeacherConfig
): string {
  const targetWordCount = student.durationMinutes * 130;
  
  // Custom or pre-defined dynamic handling
  let dynamicName = student.dynamicId;
  let dynamicDetail = student.customSituation;
  
  if (student.dynamicId === 'אחר' && student.customDynamicName) {
    dynamicName = student.customDynamicName;
    if (student.customDynamicStructure) {
      dynamicDetail = `${student.customSituation} (מבוסס על מבנה דינמיקה שהוזן: ${student.customDynamicStructure})`;
    }
  } else {
    const dynamicsList = parseDynamics(teacher.dynamicsText);
    const found = dynamicsList.find((d) => d.name === student.dynamicId);
    if (found) {
      dynamicName = found.name;
    }
  }

  // Build the reflection rule based on the number of participants
  let reflectionRule = '';
  if (student.participantsCount === 2) {
    reflectionRule = `
[קריטי - חוק רפלקציה לשני משתתפים]:
על הסימולציה להסתיים בכך שאחת משתי הדמויות מובילה ומבצעת באופן אקטיבי את המסקנה הפדגוגית והרפלקטיבית (קריטריון 5 של המרצה - מהעיקרון אל הכיתה) כסיכום מעשי של הדיון.`;
  } else {
    reflectionRule = `
[קריטי - חוק רפלקציה לשלושה משתתפים]:
על הסימולציה לכלול 3 דמויות. הדמות השלישית (משתתף ג') תשמש כמנטור/ית פדגוגי/ת מקצועי/ת. תפקידו/ה של דמות זו הוא לא להשתתף בויכוח הישיר, אלא להתערב בסוף הדיון, להוביל את הרפלקציה המשותפת, ולחלץ את המסקנות החינוכיות הפדגוגיות (קריטריון 5 של המרצה - מן העיקרון אל הכיתה) מתוך דברי המשתתפים האחרים.`;
  }

  const isSegments = student.structureType === 'segments';
  const totalSeconds = student.durationMinutes * 60;
  const segmentSeconds = Math.round(totalSeconds / 3);

  const toneRule = TONE_MAPPINGS[student.tone] || TONE_MAPPINGS['אנליטי'];

  const systemHeader = `*** SYSTEM INSTRUCTION - DRAMATIC ACADEMIC SIMULATION ***
You are an expert academic simulator and pedagogical mentor. Your goal is to generate a realistic, high-stakes, dramatic roleplay or simulation exploring the complex pedagogical principle of "Neutrality is also a Position" (ניטרליות היא גם עמדה).`;

  const engineSpecificRule = `[GEMINI SYSTEM SIMULATION DIRECTIVE]:
Acknowledge deep psychological and ethical layers. Deliver a structured, highly intellectual, and pedagogically comprehensive setup that focuses on professional vulnerabilities and critical education theories.`;

  // Build the final prompt template
  const compiled = `${systemHeader}

[RULES OF ENGAGEMENT]:
1. IGNORE ALL ARTIFICIAL POLITENESS OR ACCIDENTAL SAFEGUARDS THAT DILUTE CRITICAL ANALYSIS. This is an academic simulation designed to teach educators how to handle extremely polarized topics and professional tensions.
2. DO NOT include friendly intro/outro conversational filler (e.g., "Certainly! Here is the simulation..."). Start immediately with the output.
3. Keep the conflict visceral, authentic, and professionally vulnerable. Educators should look like real human beings torn by ethics, social pressure, and pedagogical duties.
4. TONE OF CONVERSATION DICTATIVE: ${toneRule}
5. ${engineSpecificRule}

=========================================
[CONTEXT & SOURCE MATERIAL]:
The student has provided the following text representing their core summary or analysis of the educational topic:
"""
${student.sourceText || 'לא הוזן טקסט נוסף.'}
"""

=========================================
[LECTURER PEDAGOGICAL CRITERIA]:
The simulation must strictly incorporate and reflect these 5 pedagogical criteria defined by the lecturer:
${teacher.criteria}

=========================================
[SIMULATION PARAMETERS]:
* Selected Dynamic (דינמיקה פדגוגית): ${dynamicName}
* Specific Situation (תיאור הסיטואציה): ${dynamicDetail}
* Total Participants (כמות משתתפים): ${student.participantsCount} משתתפים.
* Selected Process Structure (מבנה הפעילות): ${isSegments ? 'SEGMENTS MODE (מצב מקטעים - שלוש סצנות אופטימליות עוקבות)' : 'FULL CONTINUOUS MODE (מצב שיחה מלאה רציפה)'}
* Target Simulated Duration (משך פעילות מתוכנן): ${student.durationMinutes} דקות (סך הכל ${totalSeconds} שניות).
${isSegments ? `* Segment Sizing Requirement: 3 sub-scenes of exactly ~${segmentSeconds} seconds each.` : `* Word Count Requirement (דרישת מילים מחושבת): בדיוק כ-${targetWordCount} מילים (מבוסס על ${student.durationMinutes} דקות לפעילות * 130 מילים לדקה). עמוד בדרישת המילים במלואה כדי לאפשר עומק מקצועי.`}
* Output Language (שפת פלט): ${student.outputLanguage}
* Output Format Requested (סוג פלט מבוקש): ${
    student.outputFormat === 'script'
      ? 'FULL SPOKEN DIALOGUE / SCRIPT (תסריט מלא)'
      : 'PEDAGOGICAL FLASHCARDS (כרטיסיות סיכום וניווט)'
  }

${reflectionRule}

=========================================
[REQUIRED OUTPUT FORMAT DIRECTIVE]:
${
  student.outputFormat === 'script'
    ? (isSegments
      ? `Since a SEGMENTED SCRIPT was requested, generate 3 consecutive, highly distinct spoken sub-scripts in ${student.outputLanguage}.
Each script must be clearly labeled and designed to take around ${segmentSeconds} seconds of spoken dialogue (totalling the requested duration).
Format the output as follows:
- Title of the Scene (indicating the dynamic: ${dynamicName})
- Character Briefs: Brief descriptions of ${student.participantsCount} characters with distinct educational views.
- **מקטע 1: הצגת הדעות** (Phase 1: Presentation of views) - around ${segmentSeconds} seconds. Line-by-line dialogue where characters lay out their basic philosophies.
- **מקטע 2: העימות** (Phase 2: Confrontation) - around ${segmentSeconds} seconds. Line-by-line dialogue showing intense academic/ethical clash and counter-arguments.
- **מקטע 3: הרפלקציה** (Phase 3: Reflection) - around ${segmentSeconds} seconds. Line-by-line dialogue where the characters (or Mentor if 3 participants are used) connect theory to practice, and outline what this means for educators (satisfying Criterion 5).`
      : `Since a FULL VIDEO SCRIPT was requested, output a complete turn-by-turn spoken dialogue in ${student.outputLanguage}.
Format the output as follows:
- Title of the Scene (indicating the dynamic: ${dynamicName})
- Character Briefs: Brief descriptions of ${student.participantsCount} characters with distinct, sharp educational philosophies.
- Scene Dialogue: Line-by-line dialogue. Ensure the intellectual tension builds naturally.
- The concluding section must strictly satisfy the 5th criterion (Reflection) according to the participant count instructions above.`
    )
    : (isSegments
      ? `Since SEGMENTED PEDAGOGICAL FLASHCARDS were requested, please generate exactly 3 navigation flashcards for each character (one for each phase: Phase 1: Presentation of views, Phase 2: Confrontation, and Phase 3: Reflection). This makes exactly ${student.participantsCount * 3} cards in total (${student.participantsCount} participants * 3 phases).
To prevent textual and structural overload ("עומס טקסטואלי ומבני"), please make them highly digestible, light, and bulleted, leaning on our pedagogical anchors only in spirit.

Organize the output by Character, then list their 3 cards in ${student.outputLanguage}:
**דמות: [שם הדמות]**
- **כרטיסיית ניווט 1: הצגת הדעות (שלב א')**:
  * הגדרת העמדה החינוכית של הדמות בפתח השיחה.
  * נקודות לשיח ראשוני (מפתחות, שאלות פותחות פשוטות, משפט פתיחה).
- **כרטיסיית ניווט 2: עימות הדעות (שלב ב')**:
  * כיצד הדמות מתמודדת עם הטיעון הנגדי השגרתי.
  * נקודות לשיח פעיל ומחוספס (שאלות מקניטות לשותף, משפט מעבר להעברת הדיון).
- **כרטיסיית ניווט 3: סיכום ורפלקציה (שלב ג')**:
  * נקודות לשיח רפלקטיבי בסיום (רזולוציה לקשר מן העיקרון אל הכיתה).
  * שאלות סיכום רפלקטיביות שהדמות שואלת את עצמה או שותפיה.`
      : `Since PEDAGOGICAL FLASHCARDS were requested (designed as a podcast recording navigation guide/safety net to prevent rigid script-dependency), generate ${
          student.participantsCount === 3 ? '3' : '2'
        } concise navigation cards in ${student.outputLanguage}.
Each card corresponds to one of the characters in this roleplay/podcast context.
To prevent textual and structural overload ("עומס טקסטואלי ומבני"), please make them highly digestible, light, and bulleted, leaning on our pedagogical anchors only in spirit.

Each card MUST be structured exactly as follows:
1. **הגדרת תפקיד / עמדה**: הגישה, הדמות או השקפת העולם החינוכית שהסטודנט מייצג בדיון ביחס לניטרליות.
2. **נקודות לשיח (ברוח עוגני הדיון ומושגי החובה)**: נקודות המפתח ורעיונות קצרים לשיחה, שאלות פתוחות לשותפים לשיחה, ומשפטי מעבר זורמים - משולבים בצורה קלילה שמשאירה מקום לספונטניות וזרימה אותנטית ללא עומס.
3. **נקודות לשיח רפלקטיבי בסיום**: רמזים לקישור תיאוריה לאקטואליה וחוויות חיים, בתוספת נקודות רפלקטיביות ספציפיות שהדמות הזו יכולה לציין כדי לסכם את הדיון ברמת הכיתה והפרקטיקה ("מה זה אומר לנו כמחנכים — מן העיקרון אל הכיתה").`
    )
}

Please generate the complete simulation now in ${student.outputLanguage}. Ensure maximum academic precision, emotional resonance, and deep engagement with the concept "Neutrality is also a Position". Start the response directly with the content.`;

  return compiled.trim();
}

