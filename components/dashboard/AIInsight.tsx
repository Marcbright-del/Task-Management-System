import React, { useState } from 'react';
import { generateProjectInsight } from '../../services/geminiService';
import type { Board } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';

interface AIInsightProps {
  board: Board;
}

export const AIInsight: React.FC<AIInsightProps> = ({ board }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetInsight = async () => {
    setIsLoading(true);
    setError(null);
    setInsight(null);
    try {
      const result = await generateProjectInsight(board);
      setInsight(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <h3 className="text-sm font-bold uppercase text-base-content-secondary mb-2">AI Insight</h3>
        <div className="bg-base-100 p-3 rounded-lg">
            <button
                onClick={handleGetInsight}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 p-2 bg-brand-secondary text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
            >
                <SparklesIcon />
                {isLoading ? 'Generating...' : 'Get Productivity Insight'}
            </button>
            {insight && (
                <p className="text-sm mt-3 p-2 bg-base-200 rounded-md">{insight}</p>
            )}
            {error && (
                <p className="text-sm mt-3 p-2 bg-error/10 text-error rounded-md">{error}</p>
            )}
        </div>
    </div>
  );
};
