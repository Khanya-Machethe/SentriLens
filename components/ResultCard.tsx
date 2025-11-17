
import React from 'react';
import type { AnalysisResult } from '../types';
import { Sentiment } from '../types';
import { PositiveIcon, NegativeIcon, NeutralIcon, KeywordIcon, ExplanationIcon } from './icons';

interface ResultCardProps {
  result: AnalysisResult;
}

const sentimentStyles = {
  [Sentiment.Positive]: {
    bgColor: 'bg-green-100 dark:bg-green-900/40',
    textColor: 'text-green-800 dark:text-green-300',
    borderColor: 'border-green-500',
    icon: <PositiveIcon className="h-6 w-6" />,
  },
  [Sentiment.Negative]: {
    bgColor: 'bg-red-100 dark:bg-red-900/40',
    textColor: 'text-red-800 dark:text-red-300',
    borderColor: 'border-red-500',
    icon: <NegativeIcon className="h-6 w-6" />,
  },
  [Sentiment.Neutral]: {
    bgColor: 'bg-gray-100 dark:bg-gray-700/40',
    textColor: 'text-gray-800 dark:text-gray-300',
    borderColor: 'border-gray-500',
    icon: <NeutralIcon className="h-6 w-6" />,
  },
};

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const styles = sentimentStyles[result.sentiment];

  return (
    <div className={`overflow-hidden rounded-xl border-l-4 ${styles.borderColor} ${styles.bgColor} shadow-md`}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 font-bold ${styles.textColor}`}>
            {styles.icon}
            <span className="text-xl">{result.sentiment}</span>
          </div>
          <div className={`text-sm font-medium ${styles.textColor}`}>
            Confidence: {(result.confidence * 100).toFixed(1)}%
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Original Text: </span>
          {result.originalText}
        </p>
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
          <div className="flex items-start gap-3">
            <KeywordIcon className="mt-1 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Keywords</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {result.keywords.map((kw, i) => (
                  <span key={i} className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3">
            <ExplanationIcon className="mt-1 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Explanation</h4>
              <p className="text-gray-600 dark:text-gray-400">{result.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
