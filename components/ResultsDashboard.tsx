import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ResultCard } from './ResultCard';
import { ModelPerformance } from './ModelPerformance';
import type { AnalysisResult } from '../types';
import { Sentiment } from '../types';
import { GROUND_TRUTH_DATA } from '../constants';


interface ResultsDashboardProps {
  results: AnalysisResult[];
  isLoading: boolean;
}

const COLORS = {
  [Sentiment.Positive]: '#10B981', // Emerald 500
  [Sentiment.Negative]: '#EF4444', // Red 500
  [Sentiment.Neutral]: '#6B7280',  // Gray 500
};

const KeywordBadge: React.FC<{keyword: string; count: number; sentiment: Sentiment}> = ({ keyword, count, sentiment }) => {
    const sentimentClasses = {
        [Sentiment.Positive]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [Sentiment.Negative]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        [Sentiment.Neutral]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }
    return (
        <div className={`flex items-center justify-between rounded-full px-3 py-1 text-sm ${sentimentClasses[sentiment]}`}>
            <span>{keyword}</span>
            <span className="ml-2 font-bold">{count}</span>
        </div>
    );
};


export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center">
        <p className="text-lg">Generating insights, please wait...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800 h-full flex flex-col justify-center">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Your analysis results will appear here.</h3>
        <p className="text-gray-500 dark:text-gray-400">Enter some text to get started.</p>
      </div>
    );
  }

  const sentimentCounts = results.reduce((acc, result) => {
    acc[result.sentiment] = (acc[result.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<Sentiment, number>);

  const pieData = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));
  const sentimentCountBarData = [{
    name: 'Sentiments',
    Positive: sentimentCounts.Positive || 0,
    Negative: sentimentCounts.Negative || 0,
    Neutral: sentimentCounts.Neutral || 0,
  }];
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (!percent) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't render label if slice is too small

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-sm font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const confidenceDistributionData = useMemo(() => {
    const bins = Array(10).fill(0).map((_, i) => ({
      name: `${i * 10}-${(i + 1) * 10}`,
      count: 0,
    }));

    results.forEach(r => {
      const binIndex = Math.min(Math.floor(r.confidence * 10), 9);
      if (bins[binIndex]) {
        bins[binIndex].count++;
      }
    });
    return bins;
  }, [results]);

  const topKeywords = useMemo(() => {
    const keywordsBySentiment: Record<Sentiment, Map<string, number>> = {
      [Sentiment.Positive]: new Map(),
      [Sentiment.Negative]: new Map(),
      [Sentiment.Neutral]: new Map(),
    };

    results.forEach(result => {
      const sentimentMap = keywordsBySentiment[result.sentiment];
      result.keywords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase().trim();
        if (lowerKeyword && lowerKeyword !== 'n/a') {
          sentimentMap.set(lowerKeyword, (sentimentMap.get(lowerKeyword) || 0) + 1);
        }
      });
    });

    const getTopKeywords = (map: Map<string, number>) => {
      return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    };

    return {
      positive: getTopKeywords(keywordsBySentiment[Sentiment.Positive]),
      negative: getTopKeywords(keywordsBySentiment[Sentiment.Negative]),
      neutral: getTopKeywords(keywordsBySentiment[Sentiment.Neutral]),
    };
  }, [results]);

  const evaluatedResults = useMemo(() => {
    const groundTruthTexts = new Set(GROUND_TRUTH_DATA.map(d => d.text));
    return results.filter(r => groundTruthTexts.has(r.originalText));
  }, [results]);


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" labelLine={false} label={renderCustomizedLabel}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as Sentiment]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} (${((value / results.length) * 100).toFixed(1)}%)`, name]}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold">Sentiment Counts</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sentimentCountBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Positive" fill={COLORS.Positive} />
              <Bar dataKey="Negative" fill={COLORS.Negative} />
              <Bar dataKey="Neutral" fill={COLORS.Neutral} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 md:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Top Keywords by Sentiment</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-3 font-semibold text-green-600 dark:text-green-400">Positive</h4>
              <div className="flex flex-col gap-2">
                {topKeywords.positive.length > 0 ? topKeywords.positive.map(([keyword, count]) => (
                  <KeywordBadge key={keyword} keyword={keyword} count={count} sentiment={Sentiment.Positive} />
                )) : <p className="text-sm text-gray-500">No keywords found.</p>}
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-red-600 dark:text-red-400">Negative</h4>
              <div className="flex flex-col gap-2">
                {topKeywords.negative.length > 0 ? topKeywords.negative.map(([keyword, count]) => (
                  <KeywordBadge key={keyword} keyword={keyword} count={count} sentiment={Sentiment.Negative} />
                )) : <p className="text-sm text-gray-500">No keywords found.</p>}
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-gray-600 dark:text-gray-400">Neutral</h4>
              <div className="flex flex-col gap-2">
                {topKeywords.neutral.length > 0 ? topKeywords.neutral.map(([keyword, count]) => (
                  <KeywordBadge key={keyword} keyword={keyword} count={count} sentiment={Sentiment.Neutral} />
                )) : <p className="text-sm text-gray-500">No keywords found.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      
       <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Confidence Score Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={confidenceDistributionData} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: 'Confidence Score Range (%)', position: 'insideBottom', offset: -10 }} />
            <YAxis allowDecimals={false} label={{ value: 'Number of Texts', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle'} }}/>
            <Tooltip />
            <Bar dataKey="count" fill="#36b1ff" name="Texts" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {evaluatedResults.length > 0 && (
          <ModelPerformance analysisResults={evaluatedResults} />
      )}

      <div>
        <h3 className="mb-4 text-2xl font-bold">Detailed Analysis</h3>
        <div className="space-y-4">
          {results.map((result, index) => (
            <ResultCard key={index} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
};