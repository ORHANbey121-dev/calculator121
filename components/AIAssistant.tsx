
import React, { useState } from 'react';
import { getMathExplanation } from '../services/gemini';
import { AIResponse, Language } from '../types';
import { DrawingCanvas } from './DrawingCanvas';
import { translations } from '../translations';

interface AIAssistantProps {
  language: Language;
}

export type DrawingTool = 'pen' | 'eraser';

export const AIAssistant: React.FC<AIAssistantProps> = ({ language }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [canvasData, setCanvasData] = useState<string | null>(null);
  
  // Drawing states
  const [activeTool, setActiveTool] = useState<DrawingTool>('pen');
  const [activeColor, setActiveColor] = useState('#10b981'); // Emerald 500

  const t = translations[language];

  const colors = [
    { name: 'green', value: '#10b981' },
    { name: 'blue', value: '#3b82f6' },
    { name: 'red', value: '#ef4444' },
    { name: 'yellow', value: '#eab308' },
  ];

  const handleSolve = async () => {
    if (!input.trim() && !canvasData) return;
    setLoading(true);
    setError('');
    try {
      const response = await getMathExplanation(input, language, canvasData || undefined);
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    if (!isDrawingMode) {
      setActiveTool('pen'); // Reset to pen when opening
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl w-full h-full min-h-[500px] flex flex-col">
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            {t.aiTitle}
            <button 
              onClick={toggleDrawingMode}
              className={`relative p-2.5 rounded-xl transition-all duration-300 group flex items-center justify-center ${
                isDrawingMode 
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-emerald-400 border border-slate-700'
              }`}
              title={t.aiAssistant}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${isDrawingMode ? 'rotate-12' : 'group-hover:scale-110'}`}
              >
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </h2>

          {isDrawingMode && (
            <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50 animate-in fade-in slide-in-from-left-2 duration-300">
              {/* Tool Toggles */}
              <button
                onClick={() => setActiveTool('eraser')}
                className={`p-1.5 rounded-lg transition-colors ${activeTool === 'eraser' ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                title="Eraser"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.4 4.4c1 1 1 2.5 0 3.4L10.5 21z"/><path d="M18 14H6"/>
                </svg>
              </button>
              
              <div className="w-px h-6 bg-slate-700 mx-1"></div>

              {/* Color Palette */}
              <div className="flex gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setActiveColor(c.value);
                      setActiveTool('pen');
                    }}
                    style={{ backgroundColor: c.value }}
                    className={`w-6 h-6 rounded-full transition-all hover:scale-110 active:scale-95 ${
                      activeColor === c.value && activeTool === 'pen' ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110' : 'opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {isDrawingMode && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <DrawingCanvas 
              onCanvasChange={setCanvasData} 
              language={language} 
              color={activeColor} 
              tool={activeTool} 
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isDrawingMode ? t.aiPlaceholderDrawing : t.aiPlaceholder}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
          />
          <button
            onClick={handleSolve}
            disabled={loading || (!input.trim() && !canvasData)}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 min-w-[100px] justify-center shadow-lg shadow-purple-900/20 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              t.aiSolve
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-900/20 border border-rose-500/30 text-rose-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 text-center py-12">
            <div className="bg-slate-800/30 p-8 rounded-full">
              <svg className="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <p className="max-w-[200px]">{t.aiDrawingHint}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl">
              <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                {t.aiSummary}
              </h3>
              <p className="text-slate-300 leading-relaxed">{result.explanation}</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl">
              <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {t.aiSteps}
              </h3>
              <ul className="space-y-3">
                {result.steps.map((step, i) => (
                  <li key={i} className="flex gap-4 text-slate-300 group">
                    <span className="bg-slate-700 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-600/20 border border-blue-500/30 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="text-blue-400 font-bold mb-1 uppercase text-xs tracking-wider">{t.aiResult}</h3>
              <div className="text-3xl font-mono text-white font-bold">{result.solution}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
