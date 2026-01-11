
import React, { useState } from 'react';
import { Calculator } from './components/Calculator';
import { History } from './components/History';
import { AIAssistant } from './components/AIAssistant';
import { CalculationHistory, CalculatorMode, Language } from './types';
import { translations } from './translations';

const App: React.FC = () => {
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [language, setLanguage] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const t = translations[language];

  const addToHistory = (expression: string, result: string) => {
    const newItem: CalculationHistory = {
      id: Math.random().toString(36).substr(2, 9),
      expression,
      result,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const clearHistory = () => setHistory([]);

  const toggleLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 md:p-8">
      {/* Language Switcher */}
      <div className="w-full max-w-5xl flex justify-end mb-4 relative">
        <button 
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="p-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors text-slate-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span className="text-xs font-bold uppercase">{language}</span>
        </button>

        {showLangMenu && (
          <div className="absolute top-12 right-0 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 min-w-[120px]">
            <button onClick={() => toggleLanguage('en')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> English
            </button>
            <button onClick={() => toggleLanguage('tr')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Türkçe
            </button>
            <button onClick={() => toggleLanguage('de')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Deutsch
            </button>
          </div>
        )}
      </div>

      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          {t.appTitle}
        </h1>
        <p className="text-slate-400">{t.appSubtitle}</p>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider">{t.modeSelection}</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setMode('standard')}
                className={`p-3 rounded-xl transition-all text-left flex items-center gap-3 ${
                  mode === 'standard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current"></div>
                {t.standard}
              </button>
              <button
                onClick={() => setMode('scientific')}
                className={`p-3 rounded-xl transition-all text-left flex items-center gap-3 ${
                  mode === 'scientific' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current"></div>
                {t.scientific}
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`p-3 rounded-xl transition-all text-left flex items-center gap-3 ${
                  mode === 'ai' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current"></div>
                {t.aiAssistant}
              </button>
            </div>
          </div>

          <History history={history} onClear={clearHistory} language={language} />
        </div>

        <div className="lg:col-span-9">
          {mode !== 'ai' ? (
            <Calculator mode={mode} onCalculate={addToHistory} language={language} />
          ) : (
            <AIAssistant language={language} />
          )}
        </div>
      </div>

      <footer className="mt-auto pt-12 pb-4 text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} {t.appTitle}. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
