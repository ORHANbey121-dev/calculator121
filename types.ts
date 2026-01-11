
export interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type CalculatorMode = 'standard' | 'scientific' | 'ai';

export type Language = 'en' | 'tr' | 'de';

export interface AIResponse {
  explanation: string;
  steps: string[];
  solution: string;
}
