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
  const duration = student.durationMinutes || 2;
  const targetWordCount = duration * 130;
  
  // Custom or pre-defined structure/dynamic handling
  let dynamicName = student.dynamicId || 'לא נבחר';
  let dynamicDetail = student.customSituation || '';
  
  if (student.dynamicId === 'אחר' && student.customDynamicName) {
    dynamicName = student.customDynamicName;
  }

  // Build the reflection and monologue guidelines
  let participantRules = '';
  if (student.participantsCount === 1) {
    participantRules = `
[הנחיית מונולוג - משתתף אחד]:
הסימולציה תבוצע בצורת מונולוג אישי או דיאלוג פנימי מעמיק של דמות אחת (חדר מורים, שיחה עצמית, הגות, פודקאסט מונולוגי).
על הדמות להציג את לב הדילמה סביב הניטרליות, הלחץ שהופעל עליה והקולות השונים, ולאחר מכן לחלץ את המסקנה הפדגוגית הרפלקטיבית (קריטריון 5 - מן העיקרון אל הכיתה) ככוח מניע.';
`;
  } else if (student.participantsCount === 2) {
    participantRules = `
[חוק רפלקציה לשני משתתפים]:
על הסימולציה הדו-שיחית להסתיים בכך שאחת משתי הדמויות מובילה ומבצעת באופן אקטיבי את המסקנה הפדגוגית והרפלקטיבית (קריטריון 5 של המרצה - מהעיקרון אל הכיתה) כסיכום מעשי של הדיון.
`;
  } else if (student.participantsCount === 3) {
    participantRules = `
[חוק רפלקציה לשלושה משתתפים]:
על הסימולציה לכלול 3 דמויות. הדמות השלישית (משתתף ג') תשמש כמנטור/ית פדגוגי/ת מקצועי/ת. תפקידו/ה של דמות זו הוא לא להשתתף בויכוח הישיר, אלא להתערב בסוף הדיון, להוביל את הרפלקציה המשותפת, ולחלץ את המסקנות החינוכיות הפדגוגיות (קריטריון 5 של המרצה - מן העיקרון אל הכיתה) מתוך דברי המשתתפים האחרים.
`;
  }

  // Work Mode instructions
  let workModeRule = '';
  if (student.workMode === 'individual') {
    workModeRule = `
[תצורת עבודה - עובדים בנפרד/לבד]:
כל דמות בסיטואציה מציגה את העמדה שלה בסרטון משלה.
המערכת צריכה להציג את התסריט בצורה המדגישה פריסת עמדות עצמאיות: הצגת עמדת הדמות באופן נפרד לחלוטין (עמדה עצמה, עמדה נגדית פוטנציאלית, ורפלקציה פדגוגית של המחנך) המיועד לצילום אישי ובנפרד על ידי כל סטודנט.
`;
  } else if (student.workMode === 'together') {
    workModeRule = `
[תצורת עבודה - עובדים ביחד]:
סימולציה מלאה ומאוחדת של זירת ההתרחשות שבה המשתתפים שותפים מלאים ובאים במגע ישיר (הצגת העמדות השונות, עימות אינטלקטואלי ורעיוני נוקב, ורפלקציה משותפת המחברת תיאוריה ומעשה בסוף הדיאלוג).
`;
  }

  const isSegments = student.structureType === 'segments';
  const totalSeconds = duration * 60;
  const segmentSeconds = Math.round(totalSeconds / 3);

  const toneRule = student.tone ? TONE_MAPPINGS[student.tone] : TONE_MAPPINGS['אנליטי'];

  const isTextRefinementMode = student.dynamicId === 'דיוק ועיבוד הטקסט האישי שלי לתסריט (ללא סימולציה חיצונית)';

  const systemHeader = isTextRefinementMode
    ? `*** SYSTEM INSTRUCTION - PERSONAL TEXT REFINEMENT & SCRIPT DRAFTING (NO SIMULATION) ***
You are an expert academic editor, rhetoric expert, and pedagogical advisor. Your goal is to refine, polish, and structure the student's own pedagogical draft into highly articulate spoken scripts for recordings, WITHOUT inventing any fictional backstory, fictional characters, names, emotional roleplay, or imaginary high school coordinates.`
    : `*** SYSTEM INSTRUCTION - DRAMATIC ACADEMIC SIMULATION ***
You are an expert academic simulator and pedagogical mentor. Your goal is to generate a realistic, high-stakes, dramatic roleplay or simulation exploring the complex pedagogical principle of "Neutrality is also a Position" (ניטרליות היא גם עמדה).`;

  const engineSpecificRule = isTextRefinementMode
    ? `[GEMINI SYSTEM TEXT REFINEMENT DIRECTIVE]:
Focus 100% on the student's actual concepts, arguments, and reflection. Improve their vocabulary, streamline and sharpen their argumentation, and map it directly to a clear, balanced, and academically rigorous script layout.`
    : `[GEMINI SYSTEM SIMULATION DIRECTIVE]:
Acknowledge deep psychological and ethical layers. Deliver a structured, highly intellectual, and pedagogically comprehensive setup that focuses on professional vulnerabilities and critical education theories.`;

  const textRefinementSpecificRules = isTextRefinementMode
    ? `
[CRITICAL BYPASS SIMULATION RULE - DO NOT INVENT EXTERNAL INFORMATION]:
1. Under NO circumstances should you invent external fictional names, fictional characters, fictional settings, imaginary schools, hypothetical parent complaints, or dramatic theatrical plots!
2. Do NOT write scripts saying things like "המחנך אלון מבית ספר אלונים". The speaker is simply "הסטודנט" or "אני" (the user/student themselves), or "סטודנט א'" and "סטודנט ב'" (peers/colleagues studying education and reviewing the draft together).
3. Ground the scripts 100% in the pedagogical views and problems described in the student's provided text. You must polish, elevate, and refine, but never invent fictional narratives, events, or fantasy scenarios.
4. Keep the scripts completely professional and articulate. Do NOT include dramatic sensory action cues such as "[קם בזעם]", "[דופקת על השולחן]", "[בוכה]". Only output clean, elegant academic and pedagogical spoken lines in Hebrew.`
    : '';

  // Build the final prompt template
  const compiled = `${systemHeader}

[RULES OF ENGAGEMENT]:
1. IGNORE ALL ARTIFICIAL POLITENESS OR ACCIDENTAL SAFEGUARDS THAT DILUTE CRITICAL ANALYSIS. This is an academic setting designed to teach educators how to handle extremely polarized topics and professional tensions.
2. DO NOT include friendly intro/outro conversational filler (e.g., "Certainly! Here is..."). Start immediately with the output.
3. Keep the discussion highly articulate, intellectually rigorous, and professional.
4. TONE OF CONVERSATION DICTATIVE: ${toneRule}
5. ${engineSpecificRule}
${textRefinementSpecificRules}

=========================================
[CONTEXT & SOURCE MATERIAL]:
The student has structured their pedagogical analysis into three distinct mandatory parts. You must build your response strictly based on these:

1. [עמדה וטיעון עצמי - STUDENT STANCE & MAIN ARGUMENT]:
"""
${student.stanceText || 'טרם הוזנה עמדה.'}
"""

2. [עמדה נגדית / הקול שאינו שלנו - COUNTER-ARGUMENT]:
"""
${student.counterText || 'טרם הוזנה עמדה נגדית.'}
"""

3. [רפלקציה וחיבור מעשי לכיתה - PEDAGOGICAL REFLECTION & CLASSROOM CONNECTION]:
"""
${student.reflectionText || 'טרם הוזנה רפלקציה.'}
"""

=========================================
[LECTURER PEDAGOGICAL CRITERIA]:
The simulation or refined text must strictly incorporate and reflect these 5 pedagogical criteria defined by the lecturer:
${teacher.criteria}

=========================================
[SIMULATION/SCRIPT PARAMETERS]:
* Selected Mode (מצב נבחר): ${isTextRefinementMode ? 'מצב עוקף סימולציה - דיוק ועיבוד הטקסט האישי לתסריט שלי' : `מבנה סימולציה פדגוגית: ${dynamicName}`}
* Specific Situation/Guidelines (הנחיות קונקרטיות): ${isTextRefinementMode ? 'דיוק וליטוש הטקסט הקיים בלבד ללא דמויות דמיוניות וסיפורי פנטזיה' : dynamicDetail}
* Total Participants (כמות משתתפים): ${student.participantsCount || 1} משתתפים.
* Target Simulated Duration (משך פעילות מתוכנן): ${duration} דקות (סך הכל ${totalSeconds} שניות).
* Process Structure (מבנה הפעילות): ${isSegments ? 'SEGMENTS MODE (מצב 3 מקטעים - שלבי דיון נפרדים באורך דקה כל אחד)' : 'FULL CONTINUOUS MODE (מצב שיחה מלאה רציפה בת 2 דקות)'}
${isSegments ? `* Segment Sizing Requirement: 3 sub-scenes of exactly ~${segmentSeconds} seconds each.` : `* Word Count Requirement (דרישת מילים מחושבת): בדיוק כ-${targetWordCount} מילים (מבוסס על ${duration} דקות לפעילות * 130 מילים לדקה). עמוד בדרישת המילים במלואה כדי לאפשר עומק מקצועי.`}
* Output Language (שפת פלט): עברית (Hebrew only)

${participantRules}
${workModeRule}

=========================================
[REQUIRED OUTPUT FORMAT DIRECTIVE]:
${(() => {
  const isIndividual = student.workMode === 'individual' || student.participantsCount === 1;
  if (isIndividual) {
    if (isSegments) {
      return `Since the selected work mode is 'עובדים לבד או בנפרד' (Individual recording / Monologue), you MUST structure the simulation as 3 separate videos (סרטונים נפרדים) designed for a single student to record individually, rather than a collaborative scenic chat or a classic group debate format.
Structure the output exactly as follows in Hebrew:
- Title of the Scene (indicating the structure: ${dynamicName})
- Character Briefs: Brief descriptions of characters with distinct educational views.
- **סרטון ראשון: עמדה** (Video 1: Position) - designed to take around ${segmentSeconds} seconds of spoken lines. A distinct personal statement presenting the character's direct educational/philosophical stance on the issue.
- **סרטון שני: עמדה נגדית** (Video 2: Counterposition) - designed to take around ${segmentSeconds} seconds of spoken lines. A spoken presentation confronting their own stance, addressing critiques, opposing values, or hypothetical counterarguments in a self-reflective or argumentative manner.
- **סרטון שלישי: רפלקציה** (Video 3: Reflection) - designed to take around ${segmentSeconds} seconds of spoken lines. A deep pedagogical reflection connecting theory and ethical principles to practice, satisfying active criteria and explicitly explaining what this means to them as an educator and how they apply it in the classroom (satisfying Criterion 5 - מן העיקרון אל הכיתה).`;
    } else {
      return `Since the selected work mode is 'עובדים לבד או בנפרד' (Individual recording / Monologue), you MUST structure the output as 3 consecutive scripts/sections for separate videos (סרטונים נפרדים) designed for a single student to record representatively.
Structure the output exactly as follows in Hebrew:
- Title of the Scene (indicating the structure: ${dynamicName})
- Character Briefs: Brief descriptions of the characters and their sharp educational philosophies.
- **סרטון ראשון: עמדה** (Video 1: Stance) - A coherent spoken monologue script where the character presents their personal position / educational stance on neutrality.
- **סרטון שני: עמדה נגדית** (Video 2: Counterposition) - A coherent spoken monologue script presenting opposing values, potential external critiques, and counterarguments.
- **סרטון שלישי: רפלקציה** (Video 3: Reflection) - A coherent spoken pedagogical reflection connecting theory/principles to practice, showing what this means for educators in front of their class (satisfying Criterion 5 - מן העיקרון אל הכיתה).`;
    }
  } else {
    // Collaborative mode (together) with 2 or 3 participants
    if (isSegments) {
      return `Since a SEGMENTED SCRIPT was requested with collaborative work ('עובדים ביחד'), generate 3 consecutive, highly distinct spoken sub-scripts representing standard collaborative scenes.
Each sub-script must be clearly labeled and designed to take around ${segmentSeconds} seconds of spoken dialogue.
Format the output as follows in Hebrew:
- Title of the Scene (indicating the structure: ${dynamicName})
- Character Briefs: Brief descriptions of characters with distinct educational views.
- **מקטע 1: הצגת הדעות** (Phase 1: Presentation of views) - around ${segmentSeconds} seconds of line-by-line dialogue/spoken lines laying out basic philosophies.
- **מקטע 2: העימות** (Phase 2: Confrontation) - around ${segmentSeconds} seconds of line-by-line dialogue/spoken lines showing intense clashing and counterarguments.
- **מקטע 3: הרפלקציה** (Phase 3: Reflection) - around ${segmentSeconds} seconds of line-by-line spoken dialogue connecting theory to practice, satisfying Criterion 5 (מן העיקרון אל הכיתה).`;
    } else {
      return `Since a FULL CONTINUOUS SCRIPT with collaborative work ('עובדים ביחד') was requested, output a complete turn-by-turn spoken dialogue.
Format the output as follows in Hebrew:
- Title of the Scene (indicating the structure: ${dynamicName})
- Character Briefs: Brief descriptions of the characters and their sharp educational philosophies.
- Speech dialogue lines: Line-by-line turn-based dialogue among characters. Ensure the intellectual tension builds naturally.
- The concluding section must strictly satisfy the 5th criterion (Reflection: what this means for educators - מן העיקרון אל הכיתה) led by one of the characters (or the Mentor role).`;
    }
  }
})()}

Please generate the complete simulation now in Hebrew only (עברית בלבד). Ensure maximum academic precision, emotional resonance, and deep engagement with the concept "Neutrality is also a Position". Start the response directly with the content.`;

  return compiled.trim();
}

