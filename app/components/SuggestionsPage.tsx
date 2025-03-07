"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";
import { useAIAgent } from "../context/AIAgentContextProvider";
import { TextCorrectionToggle } from "./TextCorrectionToggle";
import { LanguagePicker } from './LanguagePicker';
import { useSalesAnalysis } from './SalesAnalysis/useSalesAnalysis';
import { LeftColumnAnalysis } from './SalesAnalysis/LeftColumnAnalysis';
import { RightColumnAnalysis } from './SalesAnalysis/RightColumnAnalysis';
import { SalesScript } from './SalesScript';

type Message = {
  text: string;
  isAI: boolean;
  timestamp: Date;
  isOriginalStt?: boolean;
  isCorrected?: boolean;
  speaker?: number;
};

const SuggestionsPage: React.FC = () => {
  const [caption, setCaption] = useState<string | undefined>("Powered by Deepgram");
  const [accumulatedText, setAccumulatedText] = useState<string>("");
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { connection, connectToDeepgram, disconnectFromDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } =
    useMicrophone();
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();
  const { processText, isProcessing, clearConversation, setLanguage } = useAIAgent();

  const [currentCustomerText, setCurrentCustomerText] = useState<string>("");
  const [isCustomerDoneSpeaking, setIsCustomerDoneSpeaking] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [useTextCorrection, setUseTextCorrection] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [speakerTexts, setSpeakerTexts] = useState<{ [key: number]: string }>({
    0: "",
    1: ""
  });
  const { currentAnalysis, isAnalyzing, analyzeCustomerSpeech } = useSalesAnalysis(processText);
  
  // Update the state type to handle HTML content
  const [salesScript, setSalesScript] = useState<string>("");

  const startConversation = async () => {
    await setupMicrophone();
    setIsConversationActive(true);
  };

  const stopConversation = () => {
    stopMicrophone();
    disconnectFromDeepgram();
    setIsConversationActive(false);
    setCaption("Conversation ended");
    setAccumulatedText("");
    clearTimeout(captionTimeout.current);
    clearInterval(keepAliveInterval.current);
  };

  const togglePause = () => {
    if (isPaused) {
      if (microphoneState !== MicrophoneState.Open) {
        startMicrophone();
      }
      connection?.keepAlive();
    } else {
      stopMicrophone();
      clearInterval(keepAliveInterval.current);
    }
    setIsPaused(!isPaused);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setLanguage(newLanguage);
  };


  // Analyze customer speech when the customer is done speaking
  useEffect(() => {
    if (currentCustomerText && isCustomerDoneSpeaking) {
        analyzeCustomerSpeech(currentCustomerText);
    }
  }, [currentCustomerText, isCustomerDoneSpeaking]);




  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready && isConversationActive) {
      connectToDeepgram({
        model: "nova-3",
        diarize: true,
        language: selectedLanguage,
        interim_results: false,
        smart_format: true,
        filler_words: true,
        // utterance_end_ms: 3000,
        vad_events: true,
        endpointing: 300,
      });
    }
  }, [microphoneState, isConversationActive, selectedLanguage]);

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;
    if (isPaused) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      const alternatives = data.channel.alternatives[0];
      let thisCaption = alternatives.transcript;
  
      if (thisCaption !== "") {
        setCaption(thisCaption);
        
        if (isFinal) {
          // Process words with speaker information
          const words = alternatives.words || [];
          const speakerSegments: { [key: number]: string[] } = {};
          
          words.forEach((word: { 
            word: string; 
            speaker?: number;
            start: number; 
            end: number; 
            confidence: number; 
            punctuated_word: string; 
          }) => {
            const speaker = word.speaker || 0;
            if (!speakerSegments[speaker]) {
              speakerSegments[speaker] = [];
            }
            speakerSegments[speaker].push(word.punctuated_word || word.word);
          });
  
          // Update accumulated text for each speaker
          Object.entries(speakerSegments).forEach(([speaker, words]) => {
            const speakerNum = parseInt(speaker);
            // If the speaker is the customer, add the words to the current customer text
            if (speakerNum === 1) {
                setCurrentCustomerText(prev => (prev + " " + words.join(" ")))

            // Once speakers switch, we are sure that we recorded whole customer's speech
            } else {
                setIsCustomerDoneSpeaking(true);
                setCurrentCustomerText("");
            }

            setSpeakerTexts(prev => ({
              ...prev,
              [speakerNum]: (prev[speakerNum] ? prev[speakerNum] + " " : "") + words.join(" ")
            }));
          });
        }
      }
  
      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      if (microphoneState !== MicrophoneState.Open) {
        startMicrophone();
      }
    }

    return () => {
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
  }, [connectionState, isPaused]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
  }, [microphoneState, connectionState]);

  return (
    <div className="flex flex-col h-screen antialiased bg-[#f5f5f7]">
      {/* Control buttons */}
      <div className="flex justify-center gap-4 mb-6 pt-8">
        <button
          onClick={isConversationActive ? stopConversation : startConversation}
          className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 shadow-sm ${
            isConversationActive
              ? "bg-[#ff3b30] hover:bg-[#e02e24] text-white"
              : "bg-[#007aff] hover:bg-[#0062cc] text-white"
          }`}
        >
          {isConversationActive ? "End Conversation" : "Start Conversation"}
        </button>
        {isConversationActive && (
          <button
            onClick={togglePause}
            className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 shadow-sm ${
              isPaused
                ? "bg-[#34c759] hover:bg-[#28a745] text-white"
                : "bg-[#ff9500] hover:bg-[#e68600] text-white"
            }`}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}
      </div>
      
      {/* Settings options when conversation is not active */}
      {!isConversationActive && (
        <div className="flex flex-col items-center gap-6 mb-8 w-full max-w-2xl mx-auto px-6 animate-fadeIn">
          <div className="w-full bg-white rounded-2xl shadow-sm p-6">
            <SalesScript 
              initialScript={salesScript} 
              onChange={setSalesScript} 
            />
          </div>
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
              <TextCorrectionToggle
                checked={useTextCorrection}
                onChange={setUseTextCorrection}
              />
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
              <LanguagePicker
                selectedLanguage={selectedLanguage}
                onChange={handleLanguageChange}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Caption display */}
      <div className="relative w-full">
        <div className="absolute bottom-4 inset-x-0 max-w-4xl mx-auto text-center z-10">
          {isConversationActive && caption && (
            <span className="bg-[#1c1c1e]/80 backdrop-blur-md p-4 rounded-xl text-white font-medium transition-opacity duration-300">
              {caption}
            </span>
          )}
        </div>
      </div>
      
      {/* Main content area - 3 column layout */}
      {isConversationActive && (
        <div className="flex flex-1 gap-6 w-full max-w-[1800px] mx-auto px-6 pb-6 overflow-hidden animate-slideUp">
          {/* Left column - Objections, Immediate Actions, Critical Attention */}
          <div className="w-1/4 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 bg-[#f2f2f7] border-b border-[#e5e5ea]">
                <h3 className="text-[#1c1c1e] font-medium">Analysis</h3>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <LeftColumnAnalysis analysis={currentAnalysis || null} />
              </div>
            </div>
            {isAnalyzing && (
              <div className="text-center text-[#8e8e93] mt-4 bg-white p-3 rounded-2xl shadow-sm">
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-[#007aff] border-t-transparent rounded-full mr-2"></div>
                  Analyzing conversation...
                </div>
              </div>
            )}
          </div>
          
          {/* Center column - Speaker 2 (Customer) transcript */}
          <div className="w-2/4 flex flex-col">
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-[#f2f2f7] border-b border-[#e5e5ea]">
                <h3 className="text-[#1c1c1e] font-medium">Conversation</h3>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                {/* Sales Script Component */}
                <SalesScript 
                  initialScript={salesScript} 
                  onChange={setSalesScript} 
                  readOnly={true}
                />
                
                {/* Customer Transcript */}
                <div className="text-[#1c1c1e] text-sm font-medium mb-2 mt-6">Customer Transcript</div>
                <div className="bg-[#f2f2f7] rounded-xl p-4 min-h-[100px]">
                  <p className="text-[#1c1c1e]">
                    {speakerTexts[1] || "Customer transcript will appear here..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Current Focus, Situation, Stakeholders */}
          <div className="w-1/4 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 bg-[#f2f2f7] border-b border-[#e5e5ea]">
                <h3 className="text-[#1c1c1e] font-medium">Insights</h3>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <RightColumnAnalysis analysis={currentAnalysis || null} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Apple-style animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        /* Apple-style scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c4;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a1a1a6;
        }
      `}</style>
    </div>
  );
};

export default SuggestionsPage; 