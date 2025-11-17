import React, { useMemo } from 'react';
import { GROUND_TRUTH_DATA } from '../constants';
import type { AnalysisResult } from '../types';
import { Sentiment } from '../types';

interface ConfusionMatrix {
  [key: string]: { [key: string]: number };
}

interface ModelPerformanceProps {
    analysisResults: AnalysisResult[];
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({ analysisResults }) => {
  
  const { matrix, metrics } = useMemo(() => {
    if (analysisResults.length === 0) return { matrix: null, metrics: null };

    const matrix: ConfusionMatrix = {
      [Sentiment.Positive]: { [Sentiment.Positive]: 0, [Sentiment.Negative]: 0, [Sentiment.Neutral]: 0 },
      [Sentiment.Negative]: { [Sentiment.Positive]: 0, [Sentiment.Negative]: 0, [Sentiment.Neutral]: 0 },
      [Sentiment.Neutral]: { [Sentiment.Positive]: 0, [Sentiment.Negative]: 0, [Sentiment.Neutral]: 0 },
    };

    analysisResults.forEach(pred => {
      const groundTruth = GROUND_TRUTH_DATA.find(d => d.text === pred.originalText);
      if (groundTruth) {
        matrix[groundTruth.sentiment][pred.sentiment]++;
      }
    });

    let totalCorrect = 0;
    const labels = [Sentiment.Positive, Sentiment.Negative, Sentiment.Neutral];
    const metrics: any = {};

    labels.forEach(label => {
      const TP = matrix[label][label];
      const FP = labels.reduce((sum, l) => sum + (l !== label ? matrix[l][label] : 0), 0);
      const FN = labels.reduce((sum, l) => sum + (l !== label ? matrix[label][l] : 0), 0);
      
      totalCorrect += TP;

      const precision = TP + FP > 0 ? TP / (TP + FP) : 0;
      const recall = TP + FN > 0 ? TP / (TP + FN) : 0;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
      
      metrics[label] = { precision, recall, f1 };
    });
    
    metrics.accuracy = analysisResults.length > 0 ? totalCorrect / analysisResults.length : 0;

    return { matrix, metrics };
  }, [analysisResults]);

  if (!matrix || !metrics) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Model Performance on Analyzed Samples</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        This section dynamically evaluates the model's performance against the {analysisResults.length} analyzed text(s) that are part of the pre-labeled evaluation dataset.
      </p>      
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">Confusion Matrix</h3>
          <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-center dark:border-gray-600">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                          <th className="p-3 border border-gray-300 dark:border-gray-600">Actual \ Predicted</th>
                          <th className="p-3 border border-gray-300 dark:border-gray-600">Positive</th>
                          <th className="p-3 border border-gray-300 dark:border-gray-600">Negative</th>
                          <th className="p-3 border border-gray-300 dark:border-gray-600">Neutral</th>
                      </tr>
                  </thead>
                  <tbody>
                      {Object.keys(matrix).map(actual => (
                          <tr key={actual} className="dark:bg-gray-800">
                              <td className="p-3 border font-semibold border-gray-300 dark:border-gray-600">{actual}</td>
                              {Object.keys(matrix[actual]).map(predicted => (
                                  <td key={predicted} className={`p-3 border border-gray-300 dark:border-gray-600 ${actual === predicted ? 'bg-green-100 dark:bg-green-900/50' : ''}`}>{matrix[actual][predicted]}</td>
                              ))}
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Performance Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Overall Accuracy</div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{(metrics.accuracy * 100).toFixed(2)}%</div>
            </div>
            {Object.keys(metrics).filter(k => k !== 'accuracy').map(label => (
              <div key={label} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">{label}</h4>
                <p><strong>Precision:</strong> {metrics[label].precision.toFixed(3)}</p>
                <p><strong>Recall:</strong> {metrics[label].recall.toFixed(3)}</p>
                <p><strong>F1-Score:</strong> {metrics[label].f1.toFixed(3)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};