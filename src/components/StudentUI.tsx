import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  Clock,
  Globe,
  FileSpreadsheet,
  Cpu,
  HelpCircle,
  FileCheck,
  Sparkles,
  Settings,
  X,
  Info
} from 'lucide-react';
import { StudentSelection, ConversationTone } from '../types';

interface StudentUIProps {
  selection: StudentSelection;
  dynamicsList: Array<{ name: string; defaultSituation: string }>;
  onChange: (updated: StudentSelection) => void;
  onSubmit: () => void;
}

export default function StudentUI({ selection, dynamicsList, onChange, onSubmit }: StudentUIProps) {
  const [characterCount, setCharacterCount] = useState(0);
  const [isCustomDynamicModalOpen, setIsCustomDynamicModalOpen] = useState(false);

  // States for the custom dynamic modal
  const [tempName, setTempName] = useState('');
  const [tempStructure, setTempStructure] = useState('');

  useEffect(() => {
    setCharacterCount(selection.sourceText.length);
  }, [selection.sourceText]);

  // When selected dynamic changes, update customSituation with defaultSituation if student hasn't heavily customized or if we just changed it
  const handleDynamicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextDynamicId = e.target.value;
    
    if (nextDynamicId === 'אחר') {
      // Prefill modal with a helpful customizable educational template
      const defaultName = selection.customDynamicName || 'דינמיקת ניפוץ אמונות';
      const defaultStructure = selection.customDynamicStructure || 'דילוג פילוסופי מונחה-רפלקציה שבו מנחה קפדן שואל שאלות המאלצות את הדובר לעמוד בפני החלטתו האתית האמיתית ללא פילטרים.';
      const defaultSit = selection.customSituation || 'שיחה קשה במסדרון בית ספר תיכון מול מנהל המוסד שנקשר לסקנדל תדמיתי.';

      setTempName(defaultName);
      setTempStructure(defaultStructure);

      onChange({
        ...selection,
        dynamicId: 'אחר',
        customDynamicName: defaultName,
        customDynamicStructure: defaultStructure,
        customSituation: defaultSit,
      });

      setIsCustomDynamicModalOpen(true);
    } else {
      const found = dynamicsList.find((d) => d.name === nextDynamicId);
      onChange({
        ...selection,
        dynamicId: nextDynamicId,
        customSituation: found ? found.defaultSituation : selection.customSituation,
      });
    }
  };

  const handleSaveCustomDynamic = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({
      ...selection,
      dynamicId: 'אחר',
      customDynamicName: tempName.trim() || 'דינמיקה חופשית',
      customDynamicStructure: tempStructure.trim() || 'דיאלוג סולידי קשה',
    });
    setIsCustomDynamicModalOpen(false);
  };

  // Preset example filler helper to quickly experience the tool
  const loadExampleText = () => {
    const sampleText = `טקסט מתוך מאמר מקצועי בנושא סוגיית הניטרליות בהוראה:
"מורים רבים מביעים חשש כבד מפני דיון פוליטי בכיתותיהם. מחקרים מראים כי 'אפקט הצינון' (The Chilling Effect) מונע ממחנכים להציג דילמות מורכבות מחשש לתלונות מצד הורים או סנקציות מנהליות. מנגד, 'אימוץ ניטרליות מדומה' עלול לצייר מציאות שטוחה שלא מעניקה לתלמיד כלים לביקורתיות. הניטרליות עצמה אינה היסמכות פסיבית על ספרי הלימוד - אלא הכרעה מוסרית מודעת לגבי האופן שבו מציגים את הקול המודר ועמדות הקצה מבלי לכרסם במרחב הבטוח של השיח החינוכי. ענווה פדגוגית מחייבת את המורה להכיר בגבולות ידיעתו ובכך שהצגת חוסר הכרעה היא לפעמים המבצע החינוכי המורכב והעמוק מכולם המכבד את תודעת התלמיד."`;

    onChange({
      ...selection,
      sourceText: sampleText,
    });
  };

  const calculatedWordCount = selection.durationMinutes * 130;

  return (
    <>
      <div id="student-workspace-layout" className="flex flex-col lg:flex-row bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Sidebar Section */}
        <aside 
          id="student-sidebar-panel" 
          className="w-full lg:w-80 bg-slate-50/70 border-b lg:border-b-0 lg:border-l border-slate-200 p-6 flex flex-col gap-6 shrink-0"
        >
          <div>
            <h3 className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">פרמטרים לפעילות</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">הגדר את דינמיקת הלמידה ואת המאפיינים שיורכבו לפרומפט אקדמי</p>
          </div>

          {/* Dynamic Selector */}
          <section className="flex flex-col gap-2">
            <label htmlFor="student-dynamic-selector" className="text-xs font-bold text-slate-600 uppercase tracking-wider block flex items-center justify-between">
              <span>דינמיקה פדגוגית</span>
              {selection.dynamicId === 'אחר' && (
                <button
                  type="button"
                  onClick={() => {
                    setTempName(selection.customDynamicName || '');
                    setTempStructure(selection.customDynamicStructure || '');
                    setIsCustomDynamicModalOpen(true);
                  }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Settings size={11} />
                  ערוך מבנה...
                </button>
              )}
            </label>
            <div className="relative">
              <select
                id="student-dynamic-selector"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs font-medium cursor-pointer transition"
                value={selection.dynamicId}
                onChange={handleDynamicChange}
              >
                {dynamicsList.map((dyn) => (
                  <option key={dyn.name} value={dyn.name}>
                    {dyn.name}
                  </option>
                ))}
                <option value="אחר" className="text-indigo-600 font-semibold bg-indigo-50/40">
                  ✨ אחר / דינמיקה אישית שלי...
                </option>
              </select>
            </div>
            {selection.dynamicId === 'אחר' && (
              <div id="custom-dynamic-badge-info" className="text-[10px] bg-indigo-50 text-indigo-950 px-2.5 py-1.5 rounded-lg border border-indigo-100 mt-1">
                מבנה אישי: <strong className="text-indigo-900">{selection.customDynamicName}</strong>
              </div>
            )}
          </section>

          {/* Participant Selectors */}
          <section className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              משתתפים בסימולציה
            </span>
            <div className="flex flex-col gap-2">
              {/* Option 2 Participants */}
              <label
                id="radio-participants-2-label"
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-xs select-none transition-all ${
                  selection.participantsCount === 2
                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 font-medium'
                    : 'border-slate-200 bg-white hover:bg-slate-100/50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="participantsCount"
                  id="radio-participants-2"
                  className="accent-indigo-600 cursor-pointer w-4 h-4"
                  checked={selection.participantsCount === 2}
                  onChange={() => onChange({ ...selection, participantsCount: 2 })}
                />
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="opacity-70 text-slate-500" />
                  2 משתתפים
                </span>
              </label>

              {/* Option 3 Participants */}
              <label
                id="radio-participants-3-label"
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-xs select-none transition-all ${
                  selection.participantsCount === 3
                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 font-medium'
                    : 'border-slate-200 bg-white hover:bg-slate-100/50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="participantsCount"
                  id="radio-participants-3"
                  className="accent-indigo-600 cursor-pointer w-4 h-4"
                  checked={selection.participantsCount === 3}
                  onChange={() => onChange({ ...selection, participantsCount: 3 })}
                />
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="opacity-70 text-slate-500" />
                  3 משתתפים (כולל מנחה/מנטור)
                </span>
              </label>
            </div>
          </section>

          {/* Duration input */}
          <section className="flex flex-col gap-2">
            <label htmlFor="student-duration" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              משך פעילות (בדקות)
            </label>
            <input
              id="student-duration"
              type="number"
              min="2"
              max="120"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
              value={selection.durationMinutes}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 2;
                onChange({ ...selection, durationMinutes: val < 2 ? 2 : val });
              }}
            />
            <div id="target-word-count-calc" className="text-[9px] bg-indigo-100 text-indigo-700 font-bold uppercase tracking-tight inline-block self-start px-2 py-0.5 rounded mt-1">
              מבוסס: ~{calculatedWordCount.toLocaleString()} מילים
            </div>
          </section>

          {/* Language selector */}
          <section className="flex flex-col gap-2">
            <label htmlFor="student-language" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              שפת פלט מבוקשת
            </label>
            <select
              id="student-language"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium cursor-pointer"
              value={selection.outputLanguage}
              onChange={(e) => onChange({ ...selection, outputLanguage: e.target.value as any })}
            >
              <option value="עברית">עברית</option>
              <option value="אנגלית">English</option>
              <option value="ערבית">العربية</option>
            </select>
          </section>

          {/* Tone selector */}
          <section className="flex flex-col gap-2">
            <label htmlFor="student-tone" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              טון השיחה המבוקש
            </label>
            <select
              id="student-tone"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium cursor-pointer"
              value={selection.tone}
              onChange={(e) => onChange({ ...selection, tone: e.target.value as ConversationTone })}
            >
              <option value="אנליטי">🧠 אנליטי וקר</option>
              <option value="רשמי">👔 רשמי ואקדמי</option>
              <option value="ידידותי">😊 ידידותי ומפרגן</option>
              <option value="עצבני">⚡ עצבני ונוקב</option>
              <option value="גס">💥 דוגרי / ללא מסננים</option>
            </select>
          </section>

          {/* Output format selector */}
          <section className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-200/60">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              סוג הפלט
            </span>
            <div className="space-y-2">
              {/* Format Script */}
              <label
                id="radio-format-script-label"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs select-none transition-all ${
                  selection.outputFormat === 'script'
                    ? 'border-indigo-600 bg-white font-semibold text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-100/50 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="outputFormat"
                  id="radio-format-script"
                  className="accent-indigo-600 cursor-pointer w-3.5 h-3.5"
                  checked={selection.outputFormat === 'script'}
                  onChange={() => onChange({ ...selection, outputFormat: 'script' })}
                />
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet size={13} className="text-indigo-600" />
                  תסריט וידאו מלא
                </span>
              </label>

              {/* Format Flashcards */}
              <label
                id="radio-format-flashcards-label"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs select-none transition-all ${
                  selection.outputFormat === 'flashcards'
                    ? 'border-indigo-600 bg-white font-semibold text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-100/50 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="outputFormat"
                  id="radio-format-flashcards"
                  className="accent-indigo-600 cursor-pointer w-3.5 h-3.5"
                  checked={selection.outputFormat === 'flashcards'}
                  onChange={() => onChange({ ...selection, outputFormat: 'flashcards' })}
                />
                <span className="flex items-center gap-1.5">
                  <FileCheck size={13} className="text-emerald-600" />
                  כרטיסיות סיכום (Flashcards)
                </span>
              </label>
            </div>
          </section>

          {/* Activity Process Structure Selector */}
          <section className="flex flex-col gap-2 pt-4 border-t border-slate-200/60">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              מבנה הפעילות
            </span>
            <div className="space-y-2">
              {/* Full Continuous Choice */}
              <label
                id="radio-structure-full-label"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs select-none transition-all ${
                  (selection.structureType || 'full') === 'full'
                    ? 'border-indigo-600 bg-white font-semibold text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-100/50 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="structureType"
                  id="radio-structure-full"
                  className="accent-indigo-600 cursor-pointer w-3.5 h-3.5"
                  checked={(selection.structureType || 'full') === 'full'}
                  onChange={() => onChange({ ...selection, structureType: 'full' })}
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  שיחה מלאה
                </span>
              </label>

              {/* Segmented Choice */}
              <label
                id="radio-structure-segments-label"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs select-none transition-all ${
                  selection.structureType === 'segments'
                    ? 'border-indigo-600 bg-white font-semibold text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-100/50 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="structureType"
                  id="radio-structure-segments"
                  className="accent-indigo-600 cursor-pointer w-3.5 h-3.5"
                  checked={selection.structureType === 'segments'}
                  onChange={() => onChange({ ...selection, structureType: 'segments' })}
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  מקטעים (שלבי דיון)
                </span>
              </label>
            </div>

            {/* Explanatory badge for segments */}
            <p className="text-[10px] text-slate-500 leading-relaxed mt-1 font-medium bg-slate-100 p-2 rounded-lg">
              {(selection.structureType || 'full') === 'full' ? (
                <span>תסריט רציף אחד המגלם שיח דידקטי מלא מתחילתו ועד סופו.</span>
              ) : (
                <span>
                  חלוקה ל-3 מקטעים בני כ-{Math.round((selection.durationMinutes * 60) / 3)} שניות כל אחד:
                  <strong className="block text-indigo-700 mt-1">1. הצגת הדעות • 2. עימות • 3. רפלקציה</strong>
                  {selection.outputFormat === 'flashcards' ? (
                    <span className="text-emerald-700 block mt-0.5 font-bold">יצר 6 כרטיסיות ניווט ממוקדות (3 לכל דמות).</span>
                  ) : (
                    <span className="text-indigo-700 block mt-0.5 font-bold">יצר 3 סצינות תסריטיות חלוקתיות עוקבות.</span>
                  )}
                </span>
              )}
            </p>
          </section>
        </aside>

        {/* Center Left: Main Workspace Input Areas */}
        <section id="student-main-content" className="flex-1 p-6 sm:p-8 flex flex-col gap-6 justify-between min-w-0">
          {/* Row Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                מרחב עריכה וניתוח טקסטואלי
              </h2>
              <p className="text-xs text-slate-400">הזינו את חומרי הגלם ועצבו את סימולציית המודל בהתאם להנחיות הפדגוגיות</p>
            </div>

            <button
              type="button"
              onClick={loadExampleText}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-1.5 rounded-full transition inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-2xs cursor-pointer"
            >
              <Sparkles size={13} className="text-indigo-600" />
              טען טקסט פדגוגי לדוגמה
            </button>
          </div>

          {/* Text area for Student Source Material */}
          <div className="flex-1 flex flex-col gap-2">
            <label htmlFor="student-source-text" className="text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span>הדביקו כאן את סיכום/ניתוח הטקסט שלכן בסוגיה:</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                {characterCount.toLocaleString()} תווים
              </span>
            </label>
            <textarea
              id="student-source-text"
              className="flex-1 w-full min-h-[190px] bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-4 text-sm leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500/10 outline-none shadow-xs transition placeholder:text-slate-400"
              placeholder="רשמו או הדביקו את הסיכום, תובנות המאמר או הטיעונים המרכזיים של הניטרליות שברצונכן לחקור..."
              value={selection.sourceText}
              onChange={(e) => onChange({ ...selection, sourceText: e.target.value })}
            />
          </div>

          {/* Dynamic Situation Customization */}
          <div className="flex flex-col gap-2">
            <label htmlFor="student-situation-text" className="text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span>תיאור הסיטואציה הספציפית לסימולציה:</span>
              <span className="text-[10px] text-indigo-600 font-semibold px-2 py-0.5 rounded bg-indigo-50">ניתן להתאמה אישית חופשית</span>
            </label>
            <input
              id="student-situation-text"
              type="text"
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-sm outline-none transition font-medium text-slate-800"
              placeholder="הגדירו את זירת ההתרחשות (למשל: חדר מצב PR, דיון ועדת אתיקה וכד׳)..."
              value={selection.customSituation}
              onChange={(e) => onChange({ ...selection, customSituation: e.target.value })}
            />
          </div>

          {/* Action Button Segment */}
          <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 leading-relaxed">
              <HelpCircle size={14} className="text-slate-400 shrink-0 font-light" />
              <span>המערכת תשלב קריטריונים, חישוב מילים, דינמיקה נבחרת, בחירת טון ומשתתפים.</span>
            </div>

            {/* Button for Prompt Gen */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Gemini Main Button */}
              <button
                id="btn-generate-prompt"
                type="button"
                onClick={onSubmit}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Cpu size={14} className="animate-pulse" />
                צור הנחיה (Prompt) ל-Gemini
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Styled Dialog Popup for Custom Dynamic */}
      {isCustomDynamicModalOpen && (
        <div 
          id="custom-dynamic-dialog-backdrop" 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setIsCustomDynamicModalOpen(false)}
        >
          <div 
            id="custom-dynamic-dialog" 
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden text-right animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                <h3 className="font-bold text-sm">הגדירו דינמיקה פדגוגית בהתאמה אישית</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCustomDynamicModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body & Forms */}
            <form onSubmit={handleSaveCustomDynamic} className="p-6 space-y-4">
              {/* Informative Banner */}
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-950 flex gap-2">
                <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">דוגמה והנחיה (איך למלא?)</p>
                  <p className="leading-relaxed opacity-90">
                    רשום כותרת קצרה וממוקדת, ותאר במפורט את כללי הדינמיקה האקדמית (מי מפעיל לחץ, מה היחסים ומה חוקי הוויכוח) כדי שהמודל יבין כיצד לחמם את התסריט.
                  </p>
                </div>
              </div>

              {/* Dynamic Name Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="modal-dynamic-name" className="text-xs font-bold text-slate-700">
                  שם הדינמיקה האישית שלך:
                </label>
                <input
                  id="modal-dynamic-name"
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                  placeholder="למשל: עימות מול דירקטוריון עקשן"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
              </div>

              {/* Dynamic Structure Textarea */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="modal-dynamic-structure" className="text-xs font-bold text-slate-700">
                  תיאור מבנה הדינמיקה וכללי העימות:
                </label>
                <textarea
                  id="modal-dynamic-structure"
                  required
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed font-normal"
                  placeholder="תאר את מנגנון הדיון, הלחץ הפסיכולוגי, מי מייצג את אינטרס המערכת לעומת חופש הביטוי וכד׳..."
                  value={tempStructure}
                  onChange={(e) => setTempStructure(e.target.value)}
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
                  שמור והחל דינמיקה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
