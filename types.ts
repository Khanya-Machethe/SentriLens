
export enum Sentiment {
  Positive = 'Positive',
  Negative = 'Negative',
  Neutral = 'Neutral',
}

export interface AnalysisResult {
  originalText: string;
  sentiment: Sentiment;
  confidence: number;
  keywords: string[];
  explanation: string;
}

export interface GroundTruthData {
    text: string;
    sentiment: Sentiment;
}
