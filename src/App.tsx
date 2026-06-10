import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, GraduationCap, Info, HelpCircle, Heart, FileCode, Check, Copy } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import StudentUI from './components/StudentUI';
import PromptViewer from './components/PromptViewer';
import { compilePrompt, parseDynamics } from './utils/promptBuilder';
import { TeacherConfig, StudentSelection } from './types';

import { DEFAULT_TEACHER_CONFIG, DEFAULT_STUDENT_SELECTION } from './utils/defaultPedagogicalConfig';


export default function App() {
  // Persistence via localStorage initializer
  const [teacherConfig, setTeacherConfig] = useState<TeacherConfig>(() => {
    const saved = localStorage.getItem('neutrality_teacher_config_v2');
    return saved ? JSON.parse(saved) : DEFAULT_TEACHER_CONFIG;
  });

  const [studentSelection, setStudentSelection] = useState<StudentSelection>(() => {
    const saved = localStorage.getItem('neutrality_student_selection_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map old string format tone if found
        if (parsed.tone === 'דוגרי / ללא מסננים') {
          parsed.tone = 'גס';
        }
        return {
          ...DEFAULT_STUDENT_SELECTION,
          ...parsed,
        };
      } catch (err) {
        return DEFAULT_STUDENT_SELECTION;
      }
    }
    return DEFAULT_STUDENT_SELECTION;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');
  const promptOutputRef = useRef<HTMLDivElement>(null);

  // Write changes to localStorage on any state mutation
  useEffect(() => {
    localStorage.setItem('neutrality_teacher_config_v2', JSON.stringify(teacherConfig));
  }, [teacherConfig]);

  useEffect(() => {
    localStorage.setItem('neutrality_student_selection_v2', JSON.stringify(studentSelection));
  }, [studentSelection]);

  // Parse dynamics whenever teacher configuration texts change
  const dynamicsList = parseDynamics(teacherConfig.dynamicsText);

  // Sync default dynamic situation if the current dynamic choice is removed in teacher config and it's not "other/custom" (אחר)
  useEffect(() => {
    if (studentSelection.dynamicId !== 'אחר' && dynamicsList.length > 0) {
      const exists = dynamicsList.some((d) => d.name === studentSelection.dynamicId);
      if (!exists) {
        setStudentSelection((prev) => ({
          ...prev,
          dynamicId: dynamicsList[0].name,
          customSituation: dynamicsList[0].defaultSituation,
        }));
      }
    }
  }, [teacherConfig.dynamicsText]);

  const handleResetAdmin = () => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את ההגדרות לברירת המחדל של הקורס?')) {
      setTeacherConfig(DEFAULT_TEACHER_CONFIG);
      // Reset student dynamic selection to align with default dynamics
      const defaults = parseDynamics(DEFAULT_TEACHER_CONFIG.dynamicsText);
      setStudentSelection((prev) => ({
        ...prev,
        ...DEFAULT_STUDENT_SELECTION,
        dynamicId: defaults[0].name,
        customSituation: defaults[0].defaultSituation,
      }));
      setCompiledPrompt('');
    }
  };

  const handleGenerate = () => {
    const prompt = compilePrompt(studentSelection, teacherConfig);
    setCompiledPrompt(prompt);

    // Scroll to prompt output smoothly after generation
    setTimeout(() => {
      promptOutputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Extract brief list of criteria for the bottom status bar
  const getCriteriaPreview = () => {
    return teacherConfig.criteria
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 pb-16 antialiased selection:bg-indigo-500/10 selection:text-indigo-900">
      {/* Header Navigation in Clean Minimalism Style */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0 shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs select-none">
            N
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 flex items-center gap-1">
            <span>מחולל שיחות:</span>
            <span className="text-indigo-600 italic font-semibold">ניטרליות היא גם עמדה</span>
          </h1>
        </div>

        <button
          onClick={() => setIsAdminOpen(!isAdminOpen)}
          type="button"
          id="btn-toggle-admin-panel"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm font-medium transition border border-slate-200 cursor-pointer"
        >
          <span>אזור מרצה / הגדרות מתקדמות</span>
          <svg className={`w-4 h-4 text-slate-500 transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Main content body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Admin Section */}
        <AnimatePresence mode="wait">
          {isAdminOpen && (
            <motion.div
              key="admin-wrapper"
              initial={{ height: 0, opacity: 0, y: -15 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {!isAdminAuthorized ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6 shadow-xs max-w-md mx-auto relative overflow-hidden my-2">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-indigo-600" />
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-1.5">
                    <span>🔒 אזור מרצה מוגן</span>
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    מדור זה מוגן בסיסמה ומיועד לסגל האקדמי לצורך עדכון קריטריונים ודינמיקות. אנא הזן את סיסמת הגישה.
                  </p>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (passwordInput.trim() === 'smkb') {
                      setIsAdminAuthorized(true);
                      setPasswordError(false);
                      setPasswordInput('');
                    } else {
                      setPasswordError(true);
                      setPasswordInput('');
                    }
                  }} className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="password"
                        autoFocus
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          if (passwordError) setPasswordError(false);
                        }}
                        placeholder="הזן סיסמה..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-center font-mono placeholder:font-sans"
                      />
                      {passwordError && (
                        <span className="text-[11px] text-rose-600 font-bold block text-center animate-pulse">
                          ⚠️ סיסמת הגישה שגויה. נסו שנית.
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-xs"
                      >
                        אישור כניסה
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdminOpen(false);
                          setPasswordError(false);
                          setPasswordInput('');
                        }}
                        className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-xs transition border border-slate-200 cursor-pointer"
                      >
                        ביטול
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="relative">
                  {/* Lock action inside Admin Open State for UX */}
                  <div className="absolute top-3 left-4 z-30">
                    <button
                      onClick={() => setIsAdminAuthorized(false)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                      title="נעילה מחדש"
                    >
                      <span>🔒 לנעילת האזור</span>
                    </button>
                  </div>
                  <AdminPanel
                    config={teacherConfig}
                    onChange={setTeacherConfig}
                    onReset={handleResetAdmin}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>


        {/* Student panel Workspace */}
        <section id="student-workspace-container" className="mb-6">
          <StudentUI
            selection={studentSelection}
            dynamicsList={dynamicsList}
            onChange={setStudentSelection}
            onSubmit={handleGenerate}
          />
        </section>

        {/* Compiled Prompt Output results */}
        <AnimatePresence>
          {compiledPrompt && (
            <motion.div
              ref={promptOutputRef}
              key="prompt-viewer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PromptViewer
                compiledPrompt={compiledPrompt}
                onRegenerate={handleGenerate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dynamic Status / Sub-Panel Footer Bar */}
      <div className="h-auto py-3 bg-slate-800 text-slate-400 flex flex-col md:flex-row items-start md:items-center px-6 sm:px-8 text-[11px] gap-3 md:gap-8 shrink-0 mt-12 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>סיטואציה פעילה ברקע:</span>
          <span className="text-slate-200 font-semibold">
            {studentSelection.dynamicId === 'אחר' ? studentSelection.customDynamicName : studentSelection.dynamicId}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 border-r border-slate-700 pr-8 overflow-hidden max-w-xl">
          <span className="font-semibold text-slate-300 shrink-0">קריטריונים פעילים:</span>
          <span className="italic opacity-85 truncate" title={getCriteriaPreview()}>
            {getCriteriaPreview()}
          </span>
        </div>
        <div className="md:mr-auto text-slate-500 font-mono tracking-wider text-[10px] uppercase">
          v1.5 MODULAR PERSISTENT SYSTEM
        </div>
      </div>

      {/* Clean Minimalist Page Footer */}
      <footer className="text-center mt-12 text-xs text-slate-400 max-w-lg mx-auto px-6 space-y-1">
        <p>מיועד לסטודנטים ולסגל פדגוגי העוסקים בדילמת הניטרליות בהוראה.</p>
        <p className="font-medium">החוג לחינוך אקדמי • פלטפורמת סימולציה מורכבת</p>
      </footer>
    </div>
  );
}
