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

interface AIAgentContextType {
  processText: (text: string) => Promise<string>;
  isProcessing: boolean;
  clearConversation: () => void;
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

const getAnthropicKey = async (): Promise<string> => {
  const response = await fetch("/api/anthropic-key", { cache: "no-store" });
  const result = await response.json();
  return result.key;
};

const AIAgentContextProvider: FunctionComponent<AIAgentContextProviderProps> = ({
  children,
}) => {
  const [chain, setChain] = useState<ConversationChain | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    const newChain = new ConversationChain({
    llm: chat,
    memory: memory,
    prompt: new PromptTemplate({
        template: `${AIAgentSystemConfig}

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
      }}
    >
      {children}
    </AIAgentContext.Provider>
  );
};

export default AIAgentContextProvider;