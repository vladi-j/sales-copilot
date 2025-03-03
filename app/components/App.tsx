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
import { InitialMeetingForm } from './InitialMeetingForm';
import { InitialMeetingData } from '../types/forms';
import { correctText } from '../services/textCorrection';
import { TextCorrectionToggle } from "./TextCorrectionToggle";
import { LanguagePicker } from './LanguagePicker';
import Navigation from './Navigation';

// Add this type definition near the top of the file
type Message = {
  text: string;
  isAI: boolean;
  timestamp: Date;
  isOriginalStt?: boolean;
  isCorrected?: boolean;
};

const App: () => JSX.Element = () => {
  const [caption, setCaption] = useState<string | undefined>("Powered by Deepgram");
  const [accumulatedText, setAccumulatedText] = useState<string>("");
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { connection, connectToDeepgram, disconnectFromDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } =
    useMicrophone();
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();
  const { processText, isProcessing, clearConversation, setInitialMeetingData, setLanguage } = useAIAgent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [useTextCorrection, setUseTextCorrection] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

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
      // Resuming
      if (microphoneState !== MicrophoneState.Open) {  // Only start if not already recording
        startMicrophone();
      }
      connection?.keepAlive();
    } else {
      // Pausing
      stopMicrophone();
      clearInterval(keepAliveInterval.current);
    }
    setIsPaused(!isPaused);
  };

  const handleSendText = async () => {
    if (!accumulatedText.trim()) return;
    
    // Pause the transcription
    if (!isPaused) {
      togglePause();
    }
    
    // Store the current text
    let textToSend = accumulatedText.trim();
    setAccumulatedText("");
    
    // Add original STT message
    const userMessage: Message = {
      text: textToSend,
      isAI: false,
      timestamp: new Date(),
      isOriginalStt: true // Add this flag to style original STT differently
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // If text correction is enabled, process the text first
      if (useTextCorrection) {
        const correctedText = await correctText(textToSend, selectedLanguage);
        textToSend = correctedText;
        
        // Add corrected message
        const correctedMessage: Message = {
          text: correctedText,
          isAI: false,
          timestamp: new Date(),
          isCorrected: true
        };
        setMessages(prev => [...prev, correctedMessage]);
      }
      
      const response = await processText(textToSend);
      // Add AI response
      const aiMessage: Message = {
        text: response,
        isAI: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing text:", error);
    }
  };

  const handleFormSubmit = (data: InitialMeetingData) => {
    setInitialMeetingData(data);
    setShowForm(false);
    startConversation();
  };

  const handleFormSkip = () => {
    setShowForm(false);
    startConversation();
  };

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setLanguage(newLanguage);  // This will trigger a conversation reset
  };

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready && isConversationActive) {
      connectToDeepgram({
        model: "nova-3",
        language: selectedLanguage,
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
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
      let thisCaption = data.channel.alternatives[0].transcript;

      if (thisCaption !== "") {
        setCaption(thisCaption);
        
        if (isFinal) {
          setAccumulatedText(prev => {
            const newText = prev + (prev ? ' ' : '') + thisCaption;
            return newText;
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
      if (microphoneState !== MicrophoneState.Open) {  // Only start if not already recording
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
    <>
      <Navigation />
      <div className="flex h-full antialiased">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <div className="flex flex-col flex-auto h-full">
            <div className="flex justify-center gap-4 mb-4 pt-4">
              <button
                onClick={isConversationActive ? stopConversation : startConversation}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  isConversationActive
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isConversationActive ? "Stop Conversation" : "Start Conversation"}
              </button>
              {isConversationActive && (
                <button
                  onClick={togglePause}
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    isPaused
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-yellow-600 hover:bg-yellow-700 text-white"
                  }`}
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
              )}
            </div>
            {!isConversationActive && (
              <>
                <TextCorrectionToggle
                  checked={useTextCorrection}
                  onChange={setUseTextCorrection}
                />
                <LanguagePicker
                  selectedLanguage={selectedLanguage}
                  onChange={handleLanguageChange}
                />
              </>
            )}
            <div className="relative w-full h-full">
              <div className="absolute bottom-[8rem] inset-x-0 max-w-4xl mx-auto text-center">
                {isConversationActive && caption && <span className="bg-black/70 p-8">{caption}</span>}
              </div>
            </div>
            {isConversationActive && (
              <div className="flex flex-col h-[600px] w-full max-w-6xl mx-auto mt-4 bg-gray-900 rounded-lg">
                {/* Messages container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.isAI
                            ? 'bg-gray-700 text-white'
                            : message.isOriginalStt && useTextCorrection
                              ? 'bg-orange-700 text-white'
                              : message.isCorrected
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white'
                        }`}
                      >
                        <pre className="whitespace-pre-wrap font-sans">{message.text}</pre>
                        <div className={`text-xs mt-1 ${
                          message.isAI 
                            ? 'text-gray-400' 
                            : message.isOriginalStt && useTextCorrection
                              ? 'text-orange-200'
                              : message.isCorrected
                                ? 'text-green-200'
                                : 'text-blue-200'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-4">
                    <textarea
                      value={accumulatedText}
                      onChange={(e) => setAccumulatedText(e.target.value)}
                      className="flex-1 p-4 bg-gray-800 text-white rounded-lg min-h-[100px] resize-none"
                      placeholder="Accumulated transcript will appear here..."
                    />
                    <button
                      onClick={accumulatedText.trim() ? handleSendText : togglePause}
                      disabled={isProcessing || (!accumulatedText.trim() && !isPaused)}
                      className={`px-6 py-2 h-fit rounded-lg font-semibold ${
                        isProcessing 
                          ? 'bg-gray-500 cursor-not-allowed'
                          : accumulatedText.trim()
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : isPaused
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing 
                        ? 'Processing...' 
                        : accumulatedText.trim()
                          ? 'Send'
                          : 'Resume'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isConversationActive && showForm ? (
              <InitialMeetingForm
                onSubmit={handleFormSubmit}
                onSkip={handleFormSkip}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
