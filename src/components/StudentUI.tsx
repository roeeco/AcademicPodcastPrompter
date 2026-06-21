import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  Clock,
  Cpu,
  HelpCircle,
  FileCheck,
  Sparkles,
  Settings,
  X,
  Info,
  Lightbulb,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { StudentSelection, ConversationTone } from '../types';
import mammoth from 'mammoth';

interface StudentUIProps {
  selection: StudentSelection;
  dynamicsList: Array<{ name: string; defaultSituation: string }>;
  onChange: (updated: StudentSelection) => void;
  onSubmit: () => void;
  enableTextAnalyzer?: boolean;
}

const MONOLOGUE_STRUCTURES = [
  { 
    name: 'עדות אישית', 
    defaultSituation: 'עדות אישית מרגשת ונוקבת של מורה במסדרון בית הספר התיכון לאחר דיון סוער בכיתה בו ניסה להישאר ניטרלי, ומסביר מדוע בחר בהוראה זו ואיזו ביקורת ספג מעמיתים.' 
  },
  { 
    name: 'הקראת טיעון המשתקף באירוע ויצירת טיעון נגד', 
    defaultSituation: 'הקראה רצופה של טיעון שנוי במחלוקת מתוך אירוע אקטואלי קולני בקמפוס, ומיד לאחר מכן ניתוח ופריסת טיעון נגד מאוזן ופילוסופי הדוגל בחילוקי דעות פדגוגיים מפרקי קיטוב.' 
  }
];

export const TEXT_REFINEMENT_OPTION = {
  name: 'דיוק ועיבוד הטקסט האישי שלי לתסריט (ללא סימולציה חיצונית)',
  defaultSituation: 'מצב דיוק פעיל: המערכת תבצע ליטוש, שכתוב ועיבוד של הטקסט הפדגוגי שלכם לכדי תסריט אקדמי ורפלקטיבי מלא ומאוזן בהתאם לזמן ולטון שהוגדרו, ללא יצירת סימולציה או סיפור פנטסטי מהעולם.'
};

export default function StudentUI({ selection, dynamicsList, onChange, onSubmit, enableTextAnalyzer = true }: StudentUIProps) {
  const [isCustomDynamicModalOpen, setIsCustomDynamicModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  const setParsedStudentTexts = (text: string) => {
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length >= 3) {
      onChange({
        ...selection,
        stanceText: paragraphs[0],
        counterText: paragraphs[1],
        reflectionText: paragraphs.slice(2).join('\n\n')
      });
    } else if (paragraphs.length === 2) {
      onChange({
        ...selection,
        stanceText: paragraphs[0],
        counterText: paragraphs[1],
        reflectionText: ''
      });
    } else {
      onChange({
        ...selection,
        stanceText: text,
        counterText: '',
        reflectionText: ''
      });
    }
  };

  // Read upload files and process using mammoth for docx or FileReader for txt
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setFileLoading(true);

    try {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setParsedStudentTexts(text);
          setFileLoading(false);
        };
        reader.onerror = () => {
          setFileError('שגיאה בקריאת קובץ הטקסט');
          setFileLoading(false);
        };
        reader.readAsText(file);
      } else if (fileName.endsWith('.docx')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (arrayBuffer) {
            try {
              const result = await mammoth.extractRawText({ arrayBuffer });
              if (result.value && result.value.trim() !== '') {
                setParsedStudentTexts(result.value);
              } else {
                setFileError('קובץ ה-docx ריק או בלתי קריא.');
              }
            } catch (err) {
              setFileError('שגיאה בפענוח קובץ ה-docx');
            }
          }
          setFileLoading(false);
        };
        reader.onerror = () => {
          setFileError('שגיאה בטעינת קובץ docx');
          setFileLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        setFileError('סוג קובץ לא נתמך. תומך ב-docx או txt בלבד.');
        setFileLoading(false);
      }
    } catch (err) {
      setFileError('שגיאה בלתי צפויה');
      setFileLoading(false);
    }
  };

  const activeStructures = [
    TEXT_REFINEMENT_OPTION,
    ...(selection.participantsCount === 1 ? MONOLOGUE_STRUCTURES : dynamicsList)
  ];

  const handleDynamicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextDynamicId = e.target.value;
    
    if (nextDynamicId === 'אחר') {
      const defaultName = selection.customDynamicName || 'מבנה מיוחד בהתאמה אישית';
      setTempName(defaultName);
      onChange({
        ...selection,
        dynamicId: 'אחר',
        customDynamicName: defaultName,
        customSituation: '',
      });
      setIsCustomDynamicModalOpen(true);
    } else {
      onChange({
        ...selection,
        dynamicId: nextDynamicId,
        customSituation: '',
      });
    }
  };

  const handleSaveCustomDynamic = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({
      ...selection,
      dynamicId: 'אחר',
      customDynamicName: tempName.trim() || 'מבנה אישי חופשי',
    });
    setIsCustomDynamicModalOpen(false);
  };

  const loadExampleText = () => {
    onChange({
      ...selection,
      stanceText: 'לדעתי ככל שמדובר בדיון פוליטי מורכב בכיתה, על המחנך לנקוט עמדה ברורה אך הוגנת. ניטרליות מוחלטת מעקרת את היכולת של התלמיד לפתח חשיבה מוסרית וביקורתית מול סוגיות בוערות, ולכן עלינו להציג את עמדתנו בצורה שקופה תוך הבטחת מרחב בטוח לביטוי.',
      counterText: 'מנגד, מורים רבים טוענים כי "אפקט הצינון" והצורך בממלכתיות מחייבים הימנעות מהצהרת דעה כדי למנוע הטיה או כפייה מחשבתית על תלמידים צעירים. עמדה זו גורסת כי המחנך צריך לשמש כמתווך ניטרלי ואובייקטיבי בלבד.',
      reflectionText: 'המשמעות המעשית בכיתה היא שלא נשתוק, אך נעודד באופן יזום שיח רפלקטיבי שבו הילדים חוקרים את שתי הגישות. אקפיד להזמין תלמידים להפריך את עמדתי שלי כדי לבסס שיח דמוקרטי שוויוני ומכבד.',
    });
  };

  // Determine current structured preview suggestion
  const matchedStructure = activeStructures.find((d) => d.name === selection.dynamicId);
  const originalExampleText = matchedStructure 
    ? matchedStructure.defaultSituation 
    : (selection.participantsCount === 1 
        ? 'בחרו מבנה מונולוג מתוך התיבה שלמעלה כדי לטעון הצעה לסיטואציה מתאימה.' 
        : 'בחרו מבנה שיחה מתוך התיבה שלמעלה כדי לטעון הצעה לסיטואציה שתסייע לכם.');

  // Form Validation & Checklist Requirements
  const isTextRefinementMode = selection.dynamicId === TEXT_REFINEMENT_OPTION.name;
  const isAbsolute = selection.simulationType === 'absolute';

  const missingFields: string[] = [];
  if (!selection.stanceText?.trim()) missingFields.push('עמדה וטיעון עצמי');
  if (!selection.counterText?.trim()) missingFields.push('עמדה נגדית / הקול שאינו שלנו');
  if (!selection.reflectionText?.trim()) {
    missingFields.push(isAbsolute ? 'רפלקציה וחיבור מעשי לחיים / לעולם' : 'רפלקציה וחיבור מעשי לכיתה');
  }
  
  if (selection.simulationType === undefined) missingFields.push('סוג הסימולציה');
  if (selection.participantsCount === undefined) {
    missingFields.push('כמות משתתפים');
  } else if (!selection.genderSelected) {
    missingFields.push('הרכב מגדר הדמויות / משתתפים');
  }
  if (selection.workMode === undefined) missingFields.push('דרכי עבודה (עובדים לבד / יחד)');
  if (selection.structureType === undefined) missingFields.push('משך ומבנה הפעילות');
  if (selection.tone === undefined) missingFields.push('טון השיחה המבוקש');
  if (!selection.dynamicId) {
    missingFields.push('מבנה שיחה');
  } else if (selection.dynamicId === 'אחר' && !selection.customDynamicName?.trim()) {
    missingFields.push('שם מבנה השיחה האישי');
  }
  
  if (!isTextRefinementMode) {
    if (!selection.customSituation?.trim()) {
      missingFields.push(isAbsolute ? 'תיאור סיטואציה כללית' : 'תיאור סיטואציה פדגוגית');
    }
  }

  const isFormValid = missingFields.length === 0;
  const calculatedWordCount = (selection.durationMinutes || 0) * 130;

  return (
    <>
      <div id="student-workspace-layout" className="flex flex-col lg:flex-row bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Sidebar Panel with activity configurations */}
        <aside 
          id="student-sidebar-panel" 
          className="w-full lg:w-80 bg-slate-50/70 border-b lg:border-b-0 lg:border-l border-slate-200 p-6 flex flex-col gap-6 shrink-0"
        >
          <div>
            <h3 className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">הגדרות הסימולציה</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">הגדירו את כמות המשתתפים, דרכי עבודה ומשך הפעילות לשאלון</p>
          </div>

          {/* 0. סוג הסימולציה */}
          <section className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              סוג הסימולציה (טווח הקשר)
            </span>
            <div className="flex flex-col gap-2">
              {[
                { type: 'pedagogical', title: 'סימולציה', desc: 'התאמה מלאה לעולם החינוך, מורים וכיתות לימוד' },
                { type: 'absolute', title: 'סימולציה מוחלטת', desc: 'דימוי עקרונות הסטודנט בעולם הכללי (ללא הקשרי בית ספר והוראה)' }
              ].map((item) => (
                <label
                  key={item.type}
                  className={`flex flex-col gap-1 p-3 border rounded-xl cursor-pointer select-none transition-all ${
                    selection.simulationType === item.type
                      ? 'border-indigo-600 bg-indigo-50/35 ring-1 ring-indigo-500/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    onChange({
                      ...selection,
                      simulationType: item.type as any,
                    });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="simulationType"
                      className="accent-indigo-600 cursor-pointer w-4 h-4"
                      checked={selection.simulationType === item.type}
                      onChange={() => {}} // handled by parent click
                    />
                    <span className="text-xs font-bold text-slate-800">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 pr-6 leading-normal">{item.desc}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 1. Participant Count Block */}
          <section className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              משתתפים בסימולציה
            </span>
            <div className="flex flex-col gap-2">
              {[
                { count: 1, label: 'מונולוג (משתתף 1)', desc: 'משתתף יחיד המציג את תמונת דילמת הניטרליות לבדו' },
                { count: 2, label: '2 משתתפים', desc: 'דו-שיח נוקב ואינדיבידואלי בין שני קולות מעורבים' },
                { count: 3, label: '3 משתתפים', desc: 'רב-שיח עם 2 קולות מעורבים ודמות מנטור/ית פדגוגי/ת' }
              ].map((item) => (
                <label
                  key={item.count}
                  className={`flex flex-col gap-1 p-3 border rounded-xl cursor-pointer select-none transition-all ${
                    selection.participantsCount === item.count
                      ? 'border-indigo-600 bg-indigo-50/35 ring-1 ring-indigo-500/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    onChange({
                      ...selection,
                      participantsCount: item.count as 1 | 2 | 3,
                      dynamicId: undefined, // empty structure to choose explicitly
                      customSituation: '', // reset situation description for student to match
                      genderSelected: undefined, // reset gender combination choice on count change
                    });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="participantsCount"
                      className="accent-indigo-600 cursor-pointer w-4 h-4"
                      checked={selection.participantsCount === item.count}
                      onChange={() => {}} // handled by parent click
                    />
                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 pr-6 leading-normal">{item.desc}</span>
                </label>
              ))}
            </div>

            {selection.participantsCount !== undefined && (
              <div className="mt-2 bg-slate-50 border border-slate-200/85 rounded-xl p-3 flex flex-col gap-1.5 animate-fadeIn">
                <label htmlFor="gender-combination-select" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>הרכב מגדר הדמויות (בשביל פנייה נכונה בעברית):</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">חובה</span>
                </label>
                <select
                  id="gender-combination-select"
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg p-2 text-xs text-slate-800 outline-none transition cursor-pointer"
                  value={selection.genderSelected || ''}
                  onChange={(e) => {
                    onChange({
                      ...selection,
                      genderSelected: e.target.value,
                    });
                  }}
                >
                  <option value="">-- בחרו הרכב מגדרים מבוקש --</option>
                  {selection.participantsCount === 1 && (
                    <>
                      <option value="הוא (זכר)">הוא (זכר)</option>
                      <option value="היא (נקבה)">היא (נקבה)</option>
                      <option value="הם (אחר/מגוון)">הם (אחר/מגוון)</option>
                    </>
                  )}
                  {selection.participantsCount === 2 && (
                    <>
                      <option value="זכר + זכר">זכר + זכר (שתי דמויות במין זכר)</option>
                      <option value="זכר + נקבה">זכר + נקבה (דמות אחת זכר ודמות אחת נקבה)</option>
                      <option value="נקבה + נקבה">נקבה + נקבה (שתי דמויות במין נקבה)</option>
                    </>
                  )}
                  {selection.participantsCount === 3 && (
                    <>
                      <option value="זכר + זכר + זכר">זכר + זכר + זכר (שלוש דמויות במין זכר)</option>
                      <option value="זכר + זכר + נקבה">זכר + זכר + נקבה (שתי דמויות זכר, ודמות אחת נקבה)</option>
                      <option value="זכר + נקבה + נקבה">זכר + נקבה + נקבה (דמות אחת זכר, ושתי דמויות נקבה)</option>
                      <option value="נקבה + נקבה + נקבה">נקבה + נקבה + נקבה (שלוש דמויות במין נקבה)</option>
                      <option value="מעורב (שילוב חופשי)">מעורב (שילוב חופשי)</option>
                    </>
                  )}
                </select>
                <p className="text-[9px] text-slate-500 leading-normal">
                  המחולל יתאים את הפועל, התארים, והפנייה בדיאלוג בסימולציה למגדרים שבחרתם כאן.
                </p>
              </div>
            )}
          </section>

          {/* 2. Work Method (עובדים בנפרד / ביחד) */}
          <section className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              דרכי עבודה בסימולציה
            </span>
            <div className="flex flex-col gap-2">
              {[
                { mode: 'individual', title: 'עובדים לבד או בנפרד', desc: 'כל דמות בסיטואציה מציגה את העמדה שלה בסרטון משלה – עמדה, עמדה נגדית ורפלקציה פדגוגית' },
                { mode: 'together', title: 'עובדים ביחד', desc: 'סימולציה מלאה של זירת ההתרחשות – הצגת עמדות, עימות ורפלקציה בהשתתפות כל הדמויות' }
              ].map((item) => (
                <label
                  key={item.mode}
                  className={`flex flex-col gap-1 p-3 border rounded-xl cursor-pointer select-none transition-all ${
                    selection.workMode === item.mode
                      ? 'border-indigo-600 bg-indigo-50/35 ring-1 ring-indigo-500/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => onChange({ ...selection, workMode: item.mode as any })}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="workMode"
                      className="accent-indigo-600 cursor-pointer w-4 h-4"
                      checked={selection.workMode === item.mode}
                      onChange={() => {}}
                    />
                    <span className="text-xs font-bold text-slate-800">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 pr-6 leading-relaxed">{item.desc}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 3. Duration & Structure (משך ומבנה הפעילות) */}
          <section className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              משך ומבנה הפעילות
            </span>
            <div className="flex flex-col gap-2">
              {[
                { type: 'full', minutes: 2, text: 'תסריט באורך מלא (2 דקות)', desc: 'תסריט רציף אחד המגלם שיח דידקטי מלא מתחילתו ועד סופו' },
                { type: 'segments', minutes: 3, text: '3 מקטעים של דקה (3 דקות)', desc: 'חלוקה ל-3 חלקים בני דקה: 1. הבעת דעות • 2. עימות • 3. רפלקציה' }
              ].map((item) => (
                <label
                  key={item.type}
                  className={`flex flex-col gap-1 p-3 border rounded-xl cursor-pointer select-none transition-all ${
                    selection.structureType === item.type
                      ? 'border-indigo-600 bg-indigo-50/35 ring-1 ring-indigo-500/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => onChange({ ...selection, structureType: item.type as any, durationMinutes: item.minutes })}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="structureType"
                      className="accent-indigo-600 cursor-pointer w-3.5 h-3.5"
                      checked={selection.structureType === item.type}
                      onChange={() => {}}
                    />
                    <span className="text-xs font-bold text-slate-800">{item.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 pr-5 leading-normal">{item.desc}</span>
                </label>
              ))}
            </div>
            {selection.durationMinutes && (
              <div id="target-word-count-calc" className="text-[9px] bg-indigo-100 text-indigo-700 font-bold uppercase tracking-tight inline-block self-start px-2.5 py-1 rounded-md mt-1">
                מבוסס מילים: ~{calculatedWordCount.toLocaleString()} מילים
              </div>
            )}
          </section>

          {/* 4. Tone selector */}
          <section className="flex flex-col gap-2">
            <label htmlFor="student-tone" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              טון השיחה המבוקש
            </label>
            <select
              id="student-tone"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium cursor-pointer"
              value={selection.tone || ''}
              onChange={(e) => onChange({ ...selection, tone: e.target.value as ConversationTone })}
            >
              <option value="" disabled>-- בחר טון שיחה --</option>
              <option value="אנליטי">🧠 אנליטי וקר</option>
              <option value="רשמי">👔 רשמי ואקדמי</option>
              <option value="ידידותי">😊 ידידותי ומפרגן</option>
              <option value="עצבני">⚡ עצבני ונוקב</option>
              <option value="גס">💥 דוגרי / ללא מסננים</option>
            </select>
          </section>
        </aside>

        {/* Center Main Workspace Block */}
        <section id="student-main-content" className="flex-1 p-6 sm:p-8 flex flex-col gap-6 justify-between min-w-0">
          
          {/* Row Header with Action & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                מרחב עריכה וניתוח טקסטואלי
              </h2>
              <p className="text-xs text-slate-400 mt-1">הדביקו או טענו סיכום סוגיה פדגוגית לסימולציה</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {/* File Upload Trigger */}
              <label htmlFor="file-upload-input" className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200 px-3.5 py-1.5 rounded-full transition inline-flex items-center gap-1.5 cursor-pointer shadow-3xs">
                <Upload size={13} className={fileLoading ? "animate-spin text-indigo-700" : "text-indigo-600"} />
                <span>{fileLoading ? 'סורק מסמך...' : 'טען קובץ (docx, txt)'}</span>
                <input 
                  id="file-upload-input"
                  type="file" 
                  accept=".docx,.txt" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={fileLoading}
                />
              </label>

              {/* Course Template Preset */}
              <button
                type="button"
                onClick={loadExampleText}
                className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-1.5 rounded-full transition inline-flex items-center gap-1.5 shadow-3xs cursor-pointer"
              >
                <Sparkles size={13} className="text-indigo-600 animate-pulse" />
                טען טקסט פדגוגי לדוגמה
              </button>
            </div>
          </div>

          {/* Feedback message for upload status */}
          {fileError && (
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-medium flex items-center gap-1.5 animate-fade-in text-right">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
          {(selection.stanceText || selection.counterText || selection.reflectionText) && !fileError && !fileLoading && (
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-fade-in self-start text-right">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <span>הטקסט הפדגוגי נטען בהצלחה!</span>
            </div>
          )}

          {/* Three Mandatory Pedagogical Text Fields */}
          <div className="flex flex-col gap-5">
            
            {/* Field 1: Stance */}
            <div className="flex flex-col gap-2 text-right">
              <label htmlFor="student-stance-text" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-700">
                  <span>עמדה וטיעון עצמי</span>
                  <span className="text-rose-500 font-bold">*</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                  {(selection.stanceText || '').length.toLocaleString()} תווים
                </span>
              </label>
              <textarea
                id="student-stance-text"
                className="w-full min-h-[85px] max-h-[140px] bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-sm leading-relaxed resize-y focus:ring-2 focus:ring-indigo-500/10 outline-none shadow-xs transition placeholder:text-slate-400"
                placeholder="עמדה עצמית: הציגו את עמדתכן הפדגוגית העצמית, הטיעון הראשי והלבטים הערכיים המרכזיים שלכן בנושא..."
                value={selection.stanceText || ''}
                onChange={(e) => onChange({ ...selection, stanceText: e.target.value })}
                required
              />
            </div>

            {/* Field 2: Counter-argument */}
            <div className="flex flex-col gap-2 text-right">
              <label htmlFor="student-counter-text" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-700">
                  <span>עמדה נגדית / הקול שאינו שלנו</span>
                  <span className="text-rose-500 font-bold">*</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                  {(selection.counterText || '').length.toLocaleString()} תווים
                </span>
              </label>
              <textarea
                id="student-counter-text"
                className="w-full min-h-[85px] max-h-[140px] bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-sm leading-relaxed resize-y focus:ring-2 focus:ring-indigo-500/10 outline-none shadow-xs transition placeholder:text-slate-400"
                placeholder="עמדה נגדית: הציגו את הקול שכנגד, הערכים המנוגדים או את הביקורת הפוטנציאלית המאתגרת את דעתכן..."
                value={selection.counterText || ''}
                onChange={(e) => onChange({ ...selection, counterText: e.target.value })}
                required
              />
            </div>

            {/* Field 3: Reflection */}
            <div className="flex flex-col gap-2 text-right">
              <label htmlFor="student-reflection-text" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-700">
                  <span>{selection.simulationType === 'absolute' ? 'רפלקציה וחיבור מעשי לחיים / לעולם (מן העיקרון אל המעשה)' : 'רפלקציה וחיבור מעשי לכיתה (מן העיקרון אל המעשה)'}</span>
                  <span className="text-rose-500 font-bold">*</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                  {(selection.reflectionText || '').length.toLocaleString()} תווים
                </span>
              </label>
              <textarea
                id="student-reflection-text"
                className="w-full min-h-[85px] max-h-[140px] bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-sm leading-relaxed resize-y focus:ring-2 focus:ring-indigo-500/10 outline-none shadow-xs transition placeholder:text-slate-400"
                placeholder={selection.simulationType === 'absolute' ? "רפלקציה ומעשה: סכמו בקצרה כיצד ייושמו עקרונות אלו בחיי היומיום, בחברה, או מול המעורבים בסיטואציה הכללית..." : "רפלקציה ומעשה: סכמו מהי המשמעות המעשית בפועל במפגש עם התלמידים וכיצד תתמודדו או תפעלו..."}
                value={selection.reflectionText || ''}
                onChange={(e) => onChange({ ...selection, reflectionText: e.target.value })}
                required
              />
            </div>

          </div>

          {/* Dynamic Selector Dropdown relocated prominently inside the main workspace above the situation container */}
          <div className="flex flex-col gap-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-right">
            <label htmlFor="student-dynamic-selector" className="text-sm font-bold text-slate-700 flex items-center justify-between">
              <span>בחירת מבנה השיחה / תצורת הדיון:</span>
              
              {selection.dynamicId === 'אחר' && (
                <button
                  type="button"
                  onClick={() => {
                    setTempName(selection.customDynamicName || '');
                    setIsCustomDynamicModalOpen(true);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Settings size={12} />
                  שנו שם מבנה מותאם...
                </button>
              )}
            </label>
            <select
              id="student-dynamic-selector"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none shadow-3xs font-semibold cursor-pointer transition text-slate-700 font-bold"
              value={selection.dynamicId || ''}
              onChange={handleDynamicChange}
              disabled={selection.participantsCount === undefined}
            >
              <option value="" disabled>
                {selection.participantsCount === undefined 
                  ? '-- בחרו תחילה כמות משתתפים בסרגל הצד --' 
                  : '-- בחרו מבנה שיחה מתוך הרשימה --'}
              </option>
              {activeStructures.map((dyn) => (
                <option key={dyn.name} value={dyn.name}>
                  {dyn.name}
                </option>
              ))}
              {selection.participantsCount !== undefined && (
                <option value="אחר" className="text-indigo-600 font-bold bg-indigo-50/40">
                  ✨ אחר / פורמט אישי שלי...
                </option>
              )}
            </select>
            {selection.dynamicId === 'אחר' && selection.customDynamicName && (
              <p className="text-[10px] text-indigo-700 mt-1 font-bold">
                בחירה נוכחית: פורמט מותאם בשם <strong className="underline text-indigo-900">{selection.customDynamicName}</strong>.
              </p>
            )}
          </div>

          {/* Dynamic Situation Customization */}
          {isTextRefinementMode ? (
            <div className="bg-indigo-50/60 border border-indigo-100 p-5 rounded-2xl flex flex-col gap-2.5 animate-fade-in text-right">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Sparkles size={16} className="text-indigo-600 animate-pulse bg-indigo-100 rounded p-0.5 shrink-0" />
                <span>פעיל: דיוק ועיבוד הטקסט האישי ללא סימולציית רקע</span>
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed font-semibold">
                בחרתם במסלול עבודה המתמקד ישירות בליטוש, עריכה ודיוק אקדמי של הטקסט שהזנתם למעלה. 
                המחולל לא ייצור סימולציה דמיונית מהעולם (כמו סיפור רקע או ויכוח מומצא), אלא יתרכז בהרחבה, גיבוש ושכלול הניסוח שלכם לתסריט אקדמי, רפלקטיבי ומאוזן (המכיל עמדה, עמדה נגדית ורפלקציה פדגוגית) לפי פרמטרי המילים וטון השיחה שהגדרתם.
              </p>
              <div className="text-[10px] text-indigo-500 font-bold mt-1">אין צורך להזין סיטואציה או אירוע רקע במוד זה.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-right">
              <label htmlFor="student-situation-text" className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-row-reverse justify-end w-full">
                  <div className="relative group inline-block">
                    <Lightbulb 
                      size={16} 
                      className="text-amber-500 cursor-pointer hover:text-amber-600 transition-colors shrink-0 animate-pulse"
                    />
                    <div className="absolute z-10 bottom-full right-0 mb-2 w-85 p-3.5 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl text-xs leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-right">
                      <div className="font-bold text-amber-400 mb-1 flex items-center gap-1 justify-end">
                        <span>הצעה לסיטואציה (דוגמא מקורית שהייתה כאן):</span>
                        <Lightbulb size={12} />
                      </div>
                      <p className="text-slate-200 font-normal mt-1">{originalExampleText}</p>
                    </div>
                  </div>
                  <span>{selection.simulationType === 'absolute' ? 'תיאור הסיטואציה הכללית לסימולציה:' : 'תיאור הסיטואציה הספציפית לסימולציה:'}</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">שדה חובה</span>
              </label>

              {/* Expanded legible situation instructions */}
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-indigo-100/80 leading-relaxed mb-1 font-medium">
                <span className="font-bold text-indigo-700 text-sm block mb-1.5">
                  {selection.simulationType === 'absolute' ? 'כיצד לכתוב תיאור סיטואציה כללית לסימולציה מוחלטת?' : 'כיצד לכתוב תיאור סיטואציה פדגוגית לסימולציה?'}
                </span>
                הקפידו לכלול את ארבעת רכיבי המפתח הבאים: 
                <br />
                <strong className="text-indigo-900 font-bold"> מקום והקשר</strong> (איפה מתרחש הדיאלוג - למשל זירת עיתונות, ארוחת שישי, ישיבת עירייה) • 
                <strong className="text-indigo-900 font-bold">  תיאור האירוע</strong> (מה קרה שחולל את הדיון) • 
                <strong className="text-indigo-900 font-bold">  דמויות משתתפות</strong> (מי בשיחה ומה הזיקה שלהם) • 
                <strong className="text-indigo-950 font-bold">  קונפליקט וניטרליות</strong> (איזו דילמה דוחפת את הצדדים להפעיל לחץ ומי שואף להישאר ניטרלי).
              </p>

              <input
                id="student-situation-text"
                type="text"
                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm outline-none transition font-medium focus:ring-2 focus:ring-indigo-500/10 ${
                  !selection.customSituation?.trim()
                    ? 'border-amber-300 focus:border-amber-500 bg-amber-50/5 text-amber-900'
                    : 'border-slate-200 focus:border-indigo-500 text-slate-800'
                }`}
                placeholder={selection.simulationType === 'absolute' ? "רשמו כאן את מקום האירוע הכללי והבלתי תלוי בהוראה, המשתתפים, הקונפליקט המקצועי/משפחתי ודילמת הניטרליות..." : "רשמו כאן את מקום האירוע, המשתתפים, הקונפליקט, והדילמה של הניטרליות..."}
                value={selection.customSituation || ''}
                onChange={(e) => onChange({ ...selection, customSituation: e.target.value })}
              />
            </div>
          )}

          {/* Validation missing list notice & Prompt maker trigger */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
            
            {/* If Form is invalid, print what's missing so they learn they must answer everything */}
            {!isFormValid && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs">
                <div className="font-bold flex items-center gap-1 mb-1 text-amber-800">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>על הסטודנטים לענות על כל סעיפי השאלון לפני ההתקדמות ליצירת ההנחיה:</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1 text-amber-900 font-semibold list-disc list-inside">
                  {missingFields.map((field, idx) => (
                    <span key={idx} className="bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200/50">
                      • {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 leading-relaxed">
                <HelpCircle size={14} className="text-slate-400 shrink-0 font-light" />
                <span>המערכת תמזג באופן הדוק את הרפלקציות, טון הדיון ופרמטרי הסימולציה במחולל ההוראה.</span>
              </div>

              {/* Action trigger button */}
              <button
                id="btn-generate-prompt"
                type="button"
                onClick={onSubmit}
                disabled={!isFormValid}
                className={`px-6 py-3 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 ${
                  !isFormValid
                    ? 'bg-slate-300 border border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 hover:scale-[1.01] active:scale-98 cursor-pointer'
                }`}
              >
                <Cpu size={14} className={!isFormValid ? "" : "animate-pulse"} />
                צור הנחיה (Prompt) ל-Gemini
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Styled Dialog Popup for Custom Dynamic Name */}
      {isCustomDynamicModalOpen && (
        <div 
          id="custom-dynamic-dialog-backdrop" 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setIsCustomDynamicModalOpen(false)}
        >
          <div 
            id="custom-dynamic-dialog" 
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden text-right animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                <h3 className="font-bold text-sm">פורמט שיחה בהתאמה אישית</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCustomDynamicModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveCustomDynamic} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="modal-dynamic-name" className="text-xs font-bold text-slate-700">
                  שם הדינמיקה / המבנה האישי שלכם:
                </label>
                <input
                  id="modal-dynamic-name"
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                  placeholder="למשל: שיחה מעוררת השראה"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCustomDynamicModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-850 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                >
                  אישור והחלה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
