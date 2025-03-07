import { useState } from 'react';

export type SalesAnalysis = {
    situation: string[];
    currentFocus: string[];
    stakeholders: {
      decisionMaker: string;
      otherPlayers: string[];
    };
    criticalAttention: {
      topRisk: string[];
      keyOpportunities: string[];
    };
    objections: Array<{
      concern: string;
      response: string;
    }>;
    immediateActions: {
      questionToAsk: string;
      topicToEmphasize: string;
      suggestedClose: string;
    };
  };

export const useSalesAnalysis = (processText: (text: string) => Promise<string>) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<SalesAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCustomerSpeech = async (text: string) => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
        // Process with AI
        const response = await processText(text);
      try {
        const analysis: SalesAnalysis = JSON.parse(response);
        setCurrentAnalysis(analysis);
      } catch (parseError) {
        console.error('Error parsing analysis response:', parseError);
      }
    } catch (error) {
      console.error('Error analyzing customer speech:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    currentAnalysis,
    isAnalyzing,
    analyzeCustomerSpeech
  };
}; 