import React, { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { ResultsDashboard } from './components/ResultsDashboard';
import { analyzeSentimentBatch } from './services/geminiService';
import type { AnalysisResult } from './types';


export default function App() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);

    const texts = text.split('\n').filter(t => t.trim() !== '');

    try {
      const analysisResults = await analyzeSentimentBatch(texts);
      setResults(analysisResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  const handleClear = useCallback(() => {
    setText('');
    setResults([]);
    setError(null);
  }, []);

  const exportTo = (format: 'json' | 'csv' | 'pdf') => {
    if (results.length === 0) {
      alert('No results to export.');
      return;
    }

    if (format === 'json') {
      const dataStr = JSON.stringify(results, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sentiment_analysis.json';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const escapeCsvField = (field: any): string => {
        const str = String(field).replace(/(\r\n|\n|\r)/gm, ' '); // Remove newlines
        if (/[",]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = 'ID,Text,Sentiment,Confidence,Keywords,Explanation';
      const csvRows = results.map((r, index) => 
        [
          index + 1,
          r.originalText,
          r.sentiment,
          r.confidence,
          r.keywords.join('; '),
          r.explanation
        ].map(escapeCsvField).join(',')
      );
      
      const csvContent = [headers, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sentiment_analysis.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
       const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("Sentiment Analysis Report", 15, 20);

      const head = [['Sentiment', 'Confidence', 'Text', 'Keywords']];
      const body = results.map(r => [
        r.sentiment,
        r.confidence.toFixed(2),
        r.originalText,
        r.keywords.join(', '),
      ]);

      autoTable(doc, {
          head: head,
          body: body,
          startY: 30,
          headStyles: { 
              fillColor: [20, 184, 166], // Teal-500
              textColor: [255, 255, 255], // White
          },
          alternateRowStyles: { 
              fillColor: [243, 244, 246] // gray-100
          },
          styles: {
              font: 'helvetica',
              textColor: [17, 24, 39], // gray-900 (blackish)
              cellPadding: 3,
          },
          columnStyles: {
              0: { cellWidth: 30 }, // Sentiment
              1: { cellWidth: 25 }, // Confidence
              // Text and Keywords will auto-size
          },
          theme: 'grid'
      });

      doc.save('sentiment_analysis_report.pdf');
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 transition-colors duration-300 dark:text-gray-200">
      <Header 
        onExport={exportTo} 
        hasResults={results.length > 0}
      />
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
              <InputArea
                text={text}
                onTextChange={setText}
                onAnalyze={handleAnalyze}
                onClear={handleClear}
                isClearable={text.trim() !== '' || results.length > 0}
                isLoading={isLoading}
              />
              {error && <div className="rounded-md bg-red-100 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</div>}
          </div>
          <div className="lg:col-span-3">
              <ResultsDashboard results={results} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}