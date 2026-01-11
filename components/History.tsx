
import React from 'react';
import { CalculationHistory, Language } from '../types';
import { translations } from '../translations';

interface HistoryProps {
  history: CalculationHistory[];
  onClear: () => void;
  language: Language;
}

export const History: React.FC<HistoryProps> = ({ history, onClear, language }) => {
  const t = translations[language];
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{t.history}</h2>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-rose-500 hover:text-rose-400 text-xs font-medium"
          >
            {t.historyClear}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {history.length === 0 ? (
          <div className="text-slate-600 text-center mt-10 text-sm italic">
            {t.historyEmpty}
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 group">
              <div className="text-slate-500 text-xs font-mono mb-1 truncate">{item.expression}</div>
              <div className="text-slate-200 font-bold font-mono text-lg text-right group-hover:text-blue-400 transition-colors">
                {item.result}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
