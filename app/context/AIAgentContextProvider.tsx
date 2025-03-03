"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FunctionComponent,
  useEffect,
} from "react";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIAgentSystemConfig2 } from "./AIAgentSystemConfig.config";
import { InitialMeetingData } from "../types/forms";
import { getAnthropicKey } from "../util/getAnthropicKey";
import { Runnable } from "@langchain/core/runnables";
import { AIMessageChunk } from "@langchain/core/messages";
import { EXAMPLE_PROMPT, SALES_ANALYSIS_PROMPT } from "../components/SalesAnalysis/SalesAnalysisPrompt.config";

interface AIAgentContextType {
  processText: (text: string) => Promise<string>;
  isProcessing: boolean;
  clearConversation: () => void;
  setInitialMeetingData: (data: InitialMeetingData) => void;
  setLanguage: (language: string) => void;
} 

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export const useAIAgent = () => {
  const context = useContext(AIAgentContext);
  if (!context) {
    throw new Error("useAIAgent must be used within an AIAgentContextProvider");
  }
  return context;
};

interface AIAgentContextProviderProps {
  children: ReactNode;
}

const AIAgentContextProvider: FunctionComponent<AIAgentContextProviderProps> = ({
  children,
}) => {
  const [chain, setChain] = useState<Runnable<{
    input: string;
    lastJsonResponse: string | null;
    example: string;
  }, AIMessageChunk> | null>(null);
  const [lastJsonResponse, setLastJsonResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialMeetingData, setInitialMeetingData] = useState<InitialMeetingData | null>(null);
  const [language, setLanguage] = useState<string>('en');

  const initializeChain = async () => {
    if (chain) return chain;

    const key = await getAnthropicKey();
    const llm = new ChatAnthropic({
      anthropicApiKey: key,
      model: "claude-3-5-haiku-20241022",
      temperature: 0.7,
      maxTokens: 1024,
      maxRetries: 2,
      clientOptions: {
        defaultHeaders: {
          "anthropic-beta": "prompt-caching-2024-07-31",
        },
      },
    });
    // Create initial system message with meeting data and language settings
    let systemPrompt = AIAgentSystemConfig2;
    
    // Add language-specific instructions
    const languageInstructions = {
      en: "Respond in English.",
      et: "Respond in Estonian. Use formal business Estonian.",
      lv: "Respond in Latvian. Use formal business Latvian.",
      lt: "Respond in Lithuanian. Use formal business Lithuanian."
    };

    systemPrompt += `\n\nLanguage Instructions: ${languageInstructions[language as keyof typeof languageInstructions]}`;

    if (initialMeetingData) {
      systemPrompt += `\n\nClient Information:
      Name: ${initialMeetingData.ownerFirstName || 'Not provided'} ${initialMeetingData.ownerLastName || ''}
      Pronouns: ${initialMeetingData.ownerPronouns || 'Not provided'}

      Initial Meeting Information:
      Website Creation/Update: ${initialMeetingData.websiteCreationDate || 'Not provided'}
      Original Website Goal: ${initialMeetingData.websiteGoal || 'Not provided'}
      Industry Situation: ${initialMeetingData.industrySituation || 'Not provided'}
      Monthly Clients: ${initialMeetingData.monthlyClients || 'Not provided'}
      Year-over-Year Comparison: ${initialMeetingData.yearComparison || 'Not provided'}
      Audit Insights: ${initialMeetingData.auditInsights || 'Not provided'}
      Main Website Purpose: ${initialMeetingData.websitePurpose || 'Not provided'}
      Desired Improvements: ${initialMeetingData.improvementWishes || 'Not provided'}
      Target Group: ${initialMeetingData.targetGroup || 'Not provided'}
      Online Target Audience: ${initialMeetingData.onlineTargetAudience || 'Not provided'}
      Missing Features: ${initialMeetingData.missingFeatures || 'Not provided'}
      Planned Updates: ${initialMeetingData.plannedUpdates || 'Not provided'}
      Google Search Interest: ${initialMeetingData.googleSearchInterest || 'Not provided'}
      
      Additional Information about the client:
      ${initialMeetingData.otherInformation || 'Not provided'}`;
    }

    const prompt = ChatPromptTemplate.fromMessages([
      {
        role: "system",
        content: [
          {
            type: "text",
            text: systemPrompt,
            // Tell Anthropic to cache this block
            cache_control: { type: "ephemeral" },
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: '{example}'
          },
          {
            type: "text",
            text: `{lastJsonResponse}. {input}`
          }
        ]
      }
    ]);
    const newChain = prompt.pipe(llm);

    setChain(newChain);
    return newChain;
  };

  const processText = async (text: string): Promise<string> => {
    setIsProcessing(true);
    try {
      const currentChain = await initializeChain();
      const response = await currentChain.invoke({
        example: EXAMPLE_PROMPT,
        input: `${SALES_ANALYSIS_PROMPT}. Customer's speech: ${text}`,
        lastJsonResponse: lastJsonResponse
      });
      // Try to parse the response as JSON and store it if successful
      try {
        console.log("Response:", response.content);
        const jsonResponse = JSON.parse(response.content as string);
        setLastJsonResponse(jsonResponse);
      } catch (e) {
        // If parsing fails, it's not valid JSON, but we can continue
        console.warn("Response was not valid JSON:", e);
      }


      return response.content as string;
    } catch (error) {
      console.error("Error processing text:", error);
      return "Error processing text. Please try again.";
    } finally {
      setIsProcessing(false);
    }
  };

  const clearConversation = () => {
    setChain(null);
  };

  // When language changes, clear the conversation to reinitialize with new language
  useEffect(() => {
    clearConversation();
  }, [language]);

  return (
    <AIAgentContext.Provider
      value={{
        processText,
        isProcessing,
        clearConversation,
        setInitialMeetingData,
        setLanguage,
      }}
    >
      {children}
    </AIAgentContext.Provider>
  );
};

export default AIAgentContextProvider;