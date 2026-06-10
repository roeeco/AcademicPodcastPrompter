import { useState, useRef } from 'react';
import { Copy, Check, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface PromptViewerProps {
  compiledPrompt: string;
  onRegenerate: () => void;
}

export default function PromptViewer({ compiledPrompt, onRegenerate }: PromptViewerProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  const calculatePromptMetrics = () => {
    const chars = compiledPrompt.length;
    const words = compiledPrompt.trim().split(/\s+/).filter(Boolean).length;
    return { chars, words };
  };

  const { chars, words } = calculatePromptMetrics();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compiledPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (codeRef.current) {
        codeRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleCopyAndOpenEngine = async () => {
    await handleCopy();
    const destination = 'https://gemini.google.com';
    window.open(destination, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="prompt-output-section" className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl overflow-hidden mt-8 border border-slate-800">
      {/* Viewer Header */}
      <div className="bg-slate-950 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-indigo-500" />
          <div>
            <span className="text-[10px] font-bold tracking-wider block uppercase text-indigo-400">
              OUTPUT FOR GEMINI PRO
            </span>
            <h3 className="font-semibold text-white text-base leading-tight">
              הנחיית הליבה מוכנה (מותאם ל-Gemini)
            </h3>
          </div>
        </div>

        {/* Counters & Visual Stats */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-500">מילים:</span> <span className="text-indigo-400 font-semibold">{words}</span>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div>
            <span className="text-slate-500 font-sans">תווים:</span> <span className="text-indigo-400 font-semibold">{chars}</span>
          </div>
        </div>
      </div>

      {/* Code Text Panel */}
      <div className="relative">
        <textarea
          ref={codeRef}
          readOnly
          id="prompt-output-textarea"
          className="w-full h-96 p-6 font-mono text-xs text-slate-300 bg-slate-950/40 border-0 focus:ring-0 leading-relaxed resize-y focus:outline-none select-all"
          value={compiledPrompt}
        />

        {/* Copy Floating Button */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <button
            id="btn-copy-prompt-floating"
            onClick={handleCopy}
            className={`p-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              copied
                ? 'bg-emerald-600/90 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="העתק טקסט"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'הועתק!' : 'העתק'}</span>
          </button>
        </div>
      </div>

      {/* Main Actions Panel */}
      <div className="bg-slate-950 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
        <div className="flex items-center gap-2.5 text-slate-400 text-xs text-center sm:text-right">
          <AlertCircle size={15} className="shrink-0 text-indigo-400" />
          <span>עצבו, העתיקו והדביקו ישירות בצ׳אט של Gemini לקבלת הסימולציה.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-refresh-prompt"
            onClick={onRegenerate}
            className="flex items-center justify-center gap-2 px-4 py-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            title="עדכן את הפרומפט לפי שינויים בשדות"
          >
            <RefreshCw size={14} />
            רענן נוסח
          </button>

          <button
            id="btn-copy-open-gemini"
            onClick={handleCopyAndOpenEngine}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>העתק ופתח את Gemini</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
