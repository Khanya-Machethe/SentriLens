import React from 'react';
import { AnalyzeIcon, UploadIcon, LoadingIcon, ClearIcon } from './icons';

interface InputAreaProps {
  text: string;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isClearable: boolean;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ text, onTextChange, onAnalyze, onClear, isClearable, isLoading }) => {

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        onTextChange(fileContent);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };
  
  const lineCount = text.trim() ? text.split('\n').filter(t => t.trim() !== '').length : 0;
  const analyzeButtonText = lineCount > 0 ? `Analyze ${lineCount} Text(s)` : 'Analyze Sentiment';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter text here for sentiment analysis, or upload a file. Each new line will be processed as a separate entry."
          className="w-full rounded-md border-gray-300 bg-gray-50 p-4 text-base shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
          rows={8}
          disabled={isLoading}
        />
        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label htmlFor="file-upload" className="flex flex-grow cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 sm:flex-grow-0">
              <UploadIcon className="h-5 w-5" />
              <span>Upload .txt</span>
            </label>
            <input id="file-upload" type="file" accept=".txt" className="hidden" onChange={handleFileChange} disabled={isLoading}/>
             <button
                type="button"
                onClick={onClear}
                disabled={!isClearable || isLoading}
                className="flex flex-grow cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 sm:flex-grow-0"
                aria-label="Clear input and results"
            >
                <ClearIcon className="h-5 w-5" />
                <span>Clear</span>
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary-300 dark:focus:ring-offset-gray-800 sm:w-auto"
          >
            {isLoading ? (
              <>
                <LoadingIcon className="h-5 w-5 animate-spin"/>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <AnalyzeIcon className="h-5 w-5" />
                <span>{analyzeButtonText}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};