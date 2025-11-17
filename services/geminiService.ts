import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';
import { Sentiment } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisResultSchema = {
    type: Type.OBJECT,
    properties: {
        originalText: {
            type: Type.STRING,
            description: "The original text that was analyzed.",
        },
        sentiment: {
            type: Type.STRING,
            enum: [Sentiment.Positive, Sentiment.Negative, Sentiment.Neutral],
            description: "The sentiment of the text."
        },
        confidence: {
            type: Type.NUMBER,
            description: "A confidence score from 0.0 to 1.0 for the sentiment classification."
        },
        keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of keywords or phrases that contributed to the sentiment."
        },
        explanation: {
            type: Type.STRING,
            description: "A brief explanation of why the text was assigned its sentiment."
        }
    },
    required: ["originalText", "sentiment", "confidence", "keywords", "explanation"]
};


export const analyzeSentimentBatch = async (texts: string[]): Promise<AnalysisResult[]> => {
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are a highly accurate sentiment analysis expert. For each text provided, you must perform the following tasks and return the result in a structured JSON format:
1.  **Classify Sentiment**: Determine if the sentiment is 'Positive', 'Negative', or 'Neutral'.
2.  **Confidence Score**: Provide a confidence score between 0.0 and 1.0 for your classification.
3.  **Extract Keywords**: Identify and list the key words or phrases that are the primary drivers of the sentiment.
4.  **Provide Explanation**: Write a concise, one-sentence explanation for your sentiment classification.
5.  **Include Original Text**: Return the original text for reference.

Analyze the following texts:
${texts.map((t, i) => `${i + 1}. ${t}`).join('\n')}
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: systemInstruction,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: analysisResultSchema,
                },
            },
        });

        const jsonText = response.text.trim();
        const parsedResults = JSON.parse(jsonText);

        if (!parsedResults || !Array.isArray(parsedResults)) {
            console.error("API returned a non-array response:", parsedResults);
            throw new Error("The API returned an unexpected data format.");
        }

        return texts.map(originalText => {
            const foundResult = parsedResults.find((r: { originalText: string; }) => r.originalText === originalText);
            if (foundResult) {
                return foundResult;
            }
            return {
                originalText,
                sentiment: Sentiment.Neutral,
                confidence: 0.5,
                keywords: ['N/A'],
                explanation: 'Model did not return a result for this specific text.'
            };
        });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to analyze sentiment. The API might be temporarily unavailable.");
    }
};