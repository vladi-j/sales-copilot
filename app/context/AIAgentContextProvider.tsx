"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FunctionComponent,
} from "react";
import { ConversationChain } from "langchain/chains";
import { ChatAnthropic } from "@langchain/anthropic";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { AIAgentSystemConfig } from "./AIAgentSystemConfig.config";
import { InitialMeetingData } from "../types/forms";
import { getAnthropicKey } from "../util/getAnthropicKey";

interface AIAgentContextType {
  processText: (text: string) => Promise<string>;
  isProcessing: boolean;
  clearConversation: () => void;
  setInitialMeetingData: (data: InitialMeetingData) => void;
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
  const [chain, setChain] = useState<ConversationChain | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialMeetingData, setInitialMeetingData] = useState<InitialMeetingData | null>(null);

  const initializeChain = async () => {
    if (chain) return chain;

    const key = await getAnthropicKey();
    const chat = new ChatAnthropic({
      anthropicApiKey: key,
      model: "claude-3-haiku-20240307",
      temperature: 0.7,
      maxTokens: 1024,
    });

    const memory = new BufferMemory({
        returnMessages: true,
        memoryKey: "history",
        inputKey: "input",
        outputKey: "response"
    });

    // Create initial system message with meeting data if available
    let systemPrompt = AIAgentSystemConfig;
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

    const newChain = new ConversationChain({
      llm: chat,
      memory: memory,
      prompt: new PromptTemplate({
        template: `${systemPrompt}

        Previous conversation:
        {history}

        Human: {input}
        Assistant:`,
        inputVariables: ["history", "input"],
      }),
    });

    setChain(newChain);
    return newChain;
  };

  const processText = async (text: string): Promise<string> => {
    setIsProcessing(true);
    try {
      const currentChain = await initializeChain();
      const response = await currentChain.invoke({
        input: text,
      });
      return response.response as string;
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

  return (
    <AIAgentContext.Provider
      value={{
        processText,
        isProcessing,
        clearConversation,
        setInitialMeetingData,
      }}
    >
      {children}
    </AIAgentContext.Provider>
  );
};

export default AIAgentContextProvider;