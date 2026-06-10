import React from 'react';
import { Sliders, HelpCircle, RotateCcw, ShieldCheck, ListPlus } from 'lucide-react';
import { TeacherConfig } from '../types';

interface AdminPanelProps {
  config: TeacherConfig;
  onChange: (updated: TeacherConfig) => void;
  onReset: () => void;
}

export default function AdminPanel({ config, onChange, onReset }: AdminPanelProps) {
  const handleCriteriaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...config, criteria: e.target.value });
  };

  const handleDynamicsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...config, dynamicsText: e.target.value });
  };

  return (
    <div id="admin-panel-card" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
      {/* Header Banner */}
      <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">אזור ניהול פדגוגי למרצה (Admin Panel)</h3>
            <p className="text-xs text-slate-400 mt-0.5">כאן מעדכנים את דרישות הליבה, קריטריוני הרפלקציה ודינמיקת הסימולציות לחוג</p>
          </div>
        </div>
        <button
          onClick={onReset}
          type="button"
          id="btn-reset-admin-config"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-950 rounded-lg border border-slate-700 transition"
          title="שחזר הגדרות ברירת מחדל של המרצה"
        >
          <RotateCcw size={14} />
          איפוס הגדרות יסוד
        </button>
      </div>

      {/* Inputs Body */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50">
        {/* Criteria A */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between font-medium text-slate-700 text-sm">
            <span className="flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={16} />
              תיבה א׳: קריטריוני ההערכה והמבנה (Criteria)
            </span>
            <span className="text-xs text-slate-400 font-normal">יוזרק לפרק הרפלקציה בפרומפט</span>
          </label>
          <textarea
            id="admin-criteria-textarea"
            className="w-full h-80 px-4 py-3 text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm leading-relaxed resize-none shadow-sm"
            placeholder="הזן את חמשת הקריטריונים המבוקשים..."
            value={config.criteria}
            onChange={handleCriteriaChange}
          />
          <div className="flex gap-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl mt-1">
            <HelpCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p id="helper-criteria" className="text-xs text-indigo-950 leading-relaxed">
              קריטריונים אלו מחנכים את ה-AI לדרוש רפלקציה מעמיקה על מורכבות הניטרליות. קריטריון מספר 5 מנוהל באופן אוטומטי על ידי מנוע המשתתפים של הסטודנט לטובת חילוץ תובנות פדגוגיות איכותיות.
            </p>
          </div>
        </div>

        {/* Dynamics B */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between font-medium text-slate-700 text-sm">
            <span className="flex items-center gap-2">
              <ListPlus className="text-indigo-600" size={16} />
              תיבה ב׳: פורמטים ורשימת דינמיקות (שם הדינמיקה | תיאור סיטואציה)
            </span>
            <span className="text-xs text-slate-400 font-normal">השתמש בתו | להפרדה בין השם לסיטואציה</span>
          </label>
          <textarea
            id="admin-dynamics-textarea"
            className="w-full h-80 px-4 py-3 text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono leading-relaxed resize-none shadow-sm"
            placeholder="דינמיקה א | תיאור הדינמיקה..."
            value={config.dynamicsText}
            onChange={handleDynamicsChange}
          />
          <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl mt-1">
            <HelpCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div id="helper-dynamics" className="text-xs text-amber-950 leading-relaxed">
              <p className="font-medium mb-0.5">כיצד לערוך את הדינמיקות?</p>
              רשום כל דינמיקה בשורה נפרדת. הוסף קו אנכי <code className="font-bold bg-amber-100 px-1 py-0.2 rounded text-amber-900">|</code> הבדל בין שם הדינמיקה שתוצג בבקבוקון הבחירה לבין סיטואציית ברירת המחדל שתעודכן לסטודנט.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
