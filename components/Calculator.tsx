
import React, { useState, useEffect, useCallback } from 'react';
import { CalculatorMode, Language } from '../types';
import { translations } from '../translations';

interface CalculatorProps {
  mode: CalculatorMode;
  language: Language;
  onCalculate: (expr: string, result: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ mode, language, onCalculate }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [shouldReset, setShouldReset] = useState(false);
  const t = translations[language];

  const handleInput = (val: string) => {
    if (shouldReset) {
      setDisplay(val);
      setShouldReset(false);
    } else {
      setDisplay(prev => (prev === '0' ? val : prev + val));
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const backspace = () => {
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const calculate = useCallback(() => {
    try {
      let sanitized = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString())
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(');

      sanitized = sanitized.replace(/(\d+)!/g, (_, n) => {
        let res = 1;
        for (let i = 2; i <= parseInt(n); i++) res *= i;
        return res.toString();
      });

      const result = eval(sanitized);
      const resultStr = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString();
      
      onCalculate(display, resultStr);
      setExpression(display + ' =');
      setDisplay(resultStr);
      setShouldReset(true);
    } catch (e) {
      setDisplay(t.errorMath);
      setShouldReset(true);
    }
  }, [display, onCalculate, t.errorMath]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') handleInput(e.key);
    if (e.key === '.') handleInput('.');
    if (e.key === '+') handleInput('+');
    if (e.key === '-') handleInput('-');
    if (e.key === '*') handleInput('×');
    if (e.key === '/') handleInput('÷');
    if (e.key === 'Enter') calculate();
    if (e.key === 'Backspace') backspace();
    if (e.key === 'Escape') clear();
  }, [calculate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const Button = ({ label, onClick, className = '', color = 'slate' }: any) => {
    const colorClasses: Record<string, string> = {
      slate: 'bg-slate-800 hover:bg-slate-700 text-slate-200',
      blue: 'bg-blue-600 hover:bg-blue-500 text-white',
      emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      rose: 'bg-rose-600 hover:bg-rose-500 text-white',
      amber: 'bg-amber-600 hover:bg-amber-500 text-white',
      indigo: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    };

    return (
      <button
        onClick={onClick}
        className={`h-14 md:h-16 rounded-2xl font-semibold text-lg transition-all active:scale-95 flex items-center justify-center ${colorClasses[color]} ${className}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md mx-auto">
      <div className="mb-6 p-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-end justify-center overflow-hidden min-h-[120px]">
        <div className="text-slate-500 text-sm font-mono h-6 mb-1">{expression}</div>
        <div className="text-slate-100 text-4xl font-bold font-mono truncate w-full text-right">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {mode === 'scientific' && (
          <>
            <Button label="sin" onClick={() => handleInput('sin(')} color="indigo" className="text-sm" />
            <Button label="cos" onClick={() => handleInput('cos(')} color="indigo" className="text-sm" />
            <Button label="tan" onClick={() => handleInput('tan(')} color="indigo" className="text-sm" />
            <Button label="√" onClick={() => handleInput('√(')} color="indigo" className="text-sm" />
            <Button label="log" onClick={() => handleInput('log(')} color="indigo" className="text-sm" />
            <Button label="ln" onClick={() => handleInput('ln(')} color="indigo" className="text-sm" />
            <Button label="π" onClick={() => handleInput('π')} color="indigo" className="text-sm" />
            <Button label="e" onClick={() => handleInput('e')} color="indigo" className="text-sm" />
            <Button label="^" onClick={() => handleInput('**')} color="indigo" className="text-sm" />
            <Button label="!" onClick={() => handleInput('!')} color="indigo" className="text-sm" />
            <Button label="(" onClick={() => handleInput('(')} color="indigo" className="text-sm" />
            <Button label=")" onClick={() => handleInput(')')} color="indigo" className="text-sm" />
          </>
        )}

        <Button label="AC" onClick={clear} color="rose" />
        <Button label="C" onClick={backspace} color="amber" />
        <Button label="%" onClick={() => handleInput('/100')} color="slate" />
        <Button label="÷" onClick={() => handleInput('÷')} color="blue" />
        <Button label="7" onClick={() => handleInput('7')} />
        <Button label="8" onClick={() => handleInput('8')} />
        <Button label="9" onClick={() => handleInput('9')} />
        <Button label="×" onClick={() => handleInput('×')} color="blue" />
        <Button label="4" onClick={() => handleInput('4')} />
        <Button label="5" onClick={() => handleInput('5')} />
        <Button label="6" onClick={() => handleInput('6')} />
        <Button label="-" onClick={() => handleInput('-')} color="blue" />
        <Button label="1" onClick={() => handleInput('1')} />
        <Button label="2" onClick={() => handleInput('2')} />
        <Button label="3" onClick={() => handleInput('3')} />
        <Button label="+" onClick={() => handleInput('+')} color="blue" />
        <Button label="0" onClick={() => handleInput('0')} className="col-span-2" />
        <Button label="." onClick={() => handleInput('.')} />
        <Button label="=" onClick={calculate} color="emerald" />
      </div>
    </div>
  );
};
