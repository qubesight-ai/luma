import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles, Mic, MicOff, Volume2, Loader2, History, Square, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ChatFeedback, parseFeedback } from "@/components/ChatFeedback";
import { GrammarTips } from "@/components/GrammarTips";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLearningErrors, NewLearningError } from "@/hooks/useLearningErrors";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import { TerminologyBox } from "@/components/conversation/TerminologyBox";
import { useDemoMode } from "@/hooks/useDemoMode";
import { DemoBanner } from "@/components/DemoBanner";

// Helper function to parse error reports from AI response
function parseErrorReports(content: string, conversationId: string | null, userLevel: string): NewLearningError[] {
  const errors: NewLearningError[] = [];
  
  // Match EMAIL_READY blocks
  const emailReadyRegex = /---EMAIL_READY---\s*```json\s*([\s\S]*?)```\s*---END EMAIL_READY---/g;
  let match;
  
  while ((match = emailReadyRegex.exec(content)) !== null) {
    try {
      const jsonStr = match[1].trim();
      const parsed = JSON.parse(jsonStr);
      const body = parsed.body || {};
      
      // Determine phase from parsed data
      let phase: "SPEAK" | "LISTEN" | "PRACTICE" | "CONVERSATION" = "CONVERSATION";
      const faseStr = (body.fase || "").toUpperCase();
      if (faseStr === "SPEAK" || faseStr === "LISTEN" || faseStr === "PRACTICE") {
        phase = faseStr as "SPEAK" | "LISTEN" | "PRACTICE";
      }
      
      const error: NewLearningError = {
        conversation_id: conversationId || undefined,
        level: body.nivel || userLevel,
        phase,
        question_text: body.pregunta || "",
        user_response: body.respuesta_usuario || "",
        correct_response: body.respuesta_correcta || "",
        error_type: body.tipo_error || "general",
        recommendation: body.recomendacion || undefined,
      };
      
      if (error.question_text && error.user_response && error.correct_response) {
        errors.push(error);
      }
    } catch (e) {
      console.error("Error parsing EMAIL_READY block:", e);
    }
  }
  
  // Also match inline feedback errors for non-exam conversations
  const feedbackRegex = /---FEEDBACK---\s*🔴\s*\*\*ERROR:\*\*\s*"([^"]+)"\s*✅\s*\*\*CORRECTION:\*\*\s*"([^"]+)"\s*📖\s*\*\*EXPLANATION:\*\*\s*([^\n]+)/g;
  
  while ((match = feedbackRegex.exec(content)) !== null) {
    const error: NewLearningError = {
      conversation_id: conversationId || undefined,
      level: userLevel,
      phase: "CONVERSATION",
      question_text: "Free conversation",
      user_response: match[1].trim(),
      correct_response: match[2].trim(),
      error_type: "grammar",
      recommendation: match[3].trim(),
    };
    
    errors.push(error);
  }
  
  return errors;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pronunciationScore?: number;
}

const scenarios = [
  { id: "cafe", title: "At the Café", description: "Practice ordering at a coffee shop", icon: "☕", level: "A1" },
  { id: "restaurant", title: "At the Restaurant", description: "Reservations and food orders", icon: "🍽️", level: "A1" },
  { id: "shopping", title: "Shopping", description: "Buying clothes and asking prices", icon: "🛍️", level: "A1" },
  { id: "travel", title: "At the Airport", description: "Travel vocabulary and phrases", icon: "✈️", level: "A2" },
  { id: "hotel", title: "At the Hotel", description: "Check-in and hotel services", icon: "🏨", level: "A2" },
  { id: "doctor", title: "At the Doctor", description: "Describing symptoms and understanding directions", icon: "🏥", level: "B1" },
  { id: "work", title: "Work Meeting", description: "Professional English", icon: "💼", level: "B1" },
  { id: "interview", title: "Job Interview", description: "Answering questions and presenting yourself", icon: "👔", level: "B1" },
  { id: "bank", title: "At the Bank", description: "Opening accounts and transactions", icon: "🏦", level: "B2" },
  { id: "debate", title: "Academic Debate", description: "Advanced argumentation", icon: "🎓", level: "B2" },
  { id: "networking", title: "Networking Event", description: "Informal professional conversation", icon: "🤝", level: "B2" },
  { id: "negotiation", title: "Business Negotiation", description: "Closing deals and negotiating terms", icon: "📊", level: "C1" },
  { id: "health_insurance_sales", title: "KHARPA TRAINING", description: "Practice selling health insurance plans to customers", icon: "🏥💼", level: "B2" },
  { id: "bioscientific", title: "BIOSCIENTIFIC", description: "Practice explaining medical equipment usage and handling", icon: "🔬🏥", level: "B2" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/conversation-chat`;

async function streamChat({
  messages,
  scenario,
  userLevel,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: "user" | "assistant"; content: string }[];
  scenario: string;
  userLevel: string;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, scenario, userLevel }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: "Failed to start stream" }));
      if (resp.status === 429) {
        onError("Rate limit exceeded. Please wait a moment and try again.");
        return;
      }
      if (resp.status === 402) {
        onError("AI credits exhausted. Please try again later.");
        return;
      }
      onError(errorData.error || "Failed to get AI response");
      return;
    }

    if (!resp.body) {
      onError("No response body");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (error) {
    console.error("Stream error:", error);
    onError(error instanceof Error ? error.message : "Connection error");
  }
}

const levels = ["All", "A1", "A2", "B1", "B2", "C1"] as const;
type LevelFilter = typeof levels[number];

export default function Conversation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemoUser } = useDemoMode();
  const { addError } = useLearningErrors();
  const { sendExerciseResultEmail } = useExerciseFeedback();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("All");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPronunciationScore, setLastPronunciationScore] = useState<number | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const confidenceScoresRef = useRef<number[]>([]);
  const processedErrorsRef = useRef<Set<string>>(new Set());
  
  // ElevenLabs TTS
  const { speak, stopAudio, isLoading: isSpeaking, isPlaying } = useElevenLabsTTS();

  const filteredScenarios = selectedLevel === "All" 
    ? scenarios 
    : scenarios.filter(s => s.level === selectedLevel);

  const getPronunciationFeedback = (score: number) => {
    if (score >= 0.9) return { label: "Excellent!", color: "text-green-500", emoji: "🌟" };
    if (score >= 0.75) return { label: "Great!", color: "text-emerald-500", emoji: "👍" };
    if (score >= 0.6) return { label: "Good", color: "text-yellow-500", emoji: "👌" };
    if (score >= 0.4) return { label: "Keep practicing", color: "text-orange-500", emoji: "💪" };
    return { label: "Try again", color: "text-red-500", emoji: "🔄" };
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const results = Array.from(event.results);
        const transcript = results.map(result => result[0].transcript).join('');
        setInput(transcript);
        
        // Collect confidence scores from final results
        const finalResults = results.filter(result => result.isFinal);
        if (finalResults.length > 0) {
          const scores = finalResults.map(result => result[0].confidence);
          confidenceScoresRef.current = scores;
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          setLastPronunciationScore(avgScore);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive",
          });
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserLevel = () => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.level || "A2";
    }
    return "A2";
  };

  const handleStartScenario = async (scenarioId: string) => {
    if (isDemoUser) {
      toast({
        title: "Demo mode",
        description: "Conversations cannot be started in demo mode.",
        variant: "destructive",
      });
      return;
    }
    setSelectedScenario(scenarioId);
    setIsLoading(true);
    setCurrentConversationId(null);
    
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    // Create conversation in database if user is logged in
    if (user && scenario) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            scenario_id: scenarioId,
            scenario_title: scenario.title,
          })
          .select()
          .single();
        
        if (error) throw error;
        setCurrentConversationId(data.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    }
    
    // Get initial greeting from AI
    const initialMessages: Message[] = [];
    setMessages(initialMessages);
    
    let assistantContent = "";
    
    await streamChat({
      messages: [],
      scenario: scenarioId,
      userLevel: getUserLevel(),
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages([{
          id: "greeting",
          role: "assistant",
          content: assistantContent,
        }]);
      },
      onDone: async () => {
        setIsLoading(false);
        // Save assistant greeting to database
        if (currentConversationId || (user && assistantContent)) {
          // Need to get the conversation ID after it's set
          setTimeout(async () => {
            const convId = currentConversationId;
            if (convId) {
              try {
                await supabase
                  .from('conversation_messages')
                  .insert({
                    conversation_id: convId,
                    role: 'assistant',
                    content: assistantContent,
                  });
              } catch (error) {
                console.error('Error saving greeting:', error);
              }
            }
          }, 100);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        // Fallback greeting
        const fallbackGreetings: Record<string, string> = {
          cafe: "Welcome to English Café! ☕ I'll be your waiter today. What can I get for you?",
          travel: "Good morning! Welcome to the check-in desk. May I see your passport and boarding pass, please?",
          work: "Good morning, everyone. Let's begin our weekly meeting. Would you like to start with your project update?",
          debate: "Today's topic is: 'Should social media be regulated by governments?' What's your opening argument?",
        };
        setMessages([{
          id: "greeting",
          role: "assistant",
          content: fallbackGreetings[scenarioId] || "Hello! Let's practice English together.",
        }]);
      },
    });
  };

  const saveMessageToDatabase = async (role: 'user' | 'assistant', content: string, pronunciationScore?: number) => {
    if (!currentConversationId) return;
    
    try {
      await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: currentConversationId,
          role,
          content,
          pronunciation_score: pronunciationScore || null,
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedScenario || isLoading) return;

    // Capture pronunciation score before clearing
    const pronunciationScore = lastPronunciationScore;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      pronunciationScore: pronunciationScore !== null ? pronunciationScore : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const userInput = input;
    setInput("");
    setLastPronunciationScore(null);
    confidenceScoresRef.current = [];
    setIsLoading(true);

    // Save user message to database
    saveMessageToDatabase('user', userInput, pronunciationScore !== null ? pronunciationScore : undefined);

    let assistantContent = "";
    
    await streamChat({
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      scenario: selectedScenario,
      userLevel: getUserLevel(),
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages([
          ...newMessages,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: assistantContent,
          },
        ]);
      },
      onDone: async () => {
        setIsLoading(false);
        // Save assistant response to database
        if (assistantContent) {
          saveMessageToDatabase('assistant', assistantContent);
          
          // Parse and save any errors detected by the AI tutor
          if (user) {
            const userLevel = getUserLevel();
            const detectedErrors = parseErrorReports(assistantContent, currentConversationId, userLevel);
            
            for (const error of detectedErrors) {
              // Create a unique key for this error to avoid duplicates
              const errorKey = `${error.user_response}-${error.correct_response}-${error.phase}`;
              
              if (!processedErrorsRef.current.has(errorKey)) {
                processedErrorsRef.current.add(errorKey);
                try {
                  await addError.mutateAsync(error);
                  console.log("Learning error saved:", error);
                } catch (e) {
                  console.error("Failed to save learning error:", e);
                }
              }
            }
          }
        }
      },
      onError: (error) => {
        setIsLoading(false);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const speakMessage = (text: string) => {
    // Extract only the main content without feedback sections
    const { mainContent } = parseFeedback(text);
    
    // Remove all feedback-related content for clean audio
    let cleanText = mainContent
      .replace(/---EMAIL_READY---[\s\S]*?---END EMAIL_READY---/g, '')
      .replace(/\*\*[^*]+\*\*/g, '')
      .replace(/💡[^\n]*/g, '')
      .replace(/📖[^\n]*/g, '')
      .replace(/[✅❌🔴🌟👍👌💪🔄]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    if (cleanText) {
      if (isPlaying) {
        stopAudio();
      } else {
        speak(cleanText);
      }
    }
  };

  const handleBack = () => {
    if (selectedScenario) {
      // Send email with conversation summary
      const scenario = scenarios.find(s => s.id === selectedScenario);
      const userMessages = messages.filter(m => m.role === "user");
      if (userMessages.length > 0) {
        const avgPronunciation = userMessages
          .filter(m => m.pronunciationScore !== undefined)
          .reduce((sum, m, _, arr) => sum + (m.pronunciationScore || 0) / arr.length, 0);
        const score = avgPronunciation > 0 ? Math.round(avgPronunciation * 100) : 100;
        sendExerciseResultEmail({
          exerciseType: "AI Conversation Practice",
          exerciseTitle: scenario?.title || "Conversation",
          level: getUserLevel(),
          score,
          totalQuestions: userMessages.length,
          correctAnswers: userMessages.length,
          incorrectAnswers: [],
        });
      }
      setSelectedScenario(null);
      setMessages([]);
    } else {
      navigate("/dashboard");
    }
  };

  if (selectedScenario) {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container py-4 flex flex-col max-h-[calc(100vh-4rem)]">
          {/* Chat Header with Frutiger Aero pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full bg-white/70 hover:bg-white border border-white/80 shadow-sm text-[#0b3b4a]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#e1f8fb] border border-white text-[11px] font-display font-extrabold text-[#006874] shadow-sm uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#26c6da] animate-pulse" />
                    Roleplay Scenario
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e8ffee] border border-white text-[11px] font-display font-extrabold text-[#1b5e20] shadow-sm uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#69f0ae] shadow-[0_0_6px_#69f0ae]" />
                    Interactive Live
                  </span>
                </div>
                <h2 className="font-display font-bold text-xl text-[#0b3b4a]">{scenario?.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleStartScenario(selectedScenario)}
                disabled={isLoading}
                className="gap-2 btn-gel-aqua shadow-aqua-sm text-xs font-display font-bold"
                title="Start a new conversation with a different topic"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                New Topic
              </Button>
            </div>
          </div>

          {/* Interactive Visualizer Orb Centerpiece */}
          <div className="py-2 flex flex-col items-center justify-center relative mb-2">
            <div className="relative flex items-center justify-center">
              {/* Pulsating ripple rings */}
              <div className="absolute w-28 h-28 rounded-full border border-primary/30 animate-ripple pointer-events-none" />
              <div className="absolute w-36 h-36 rounded-full border border-primary/20 animate-ripple pointer-events-none" style={{ animationDelay: '0.8s' }} />
              
              {/* 3D Visualizer Orb */}
              <div className="w-24 h-24 rounded-full orb-aqua border-2 border-white/90 flex items-center justify-center shadow-aqua-lg relative z-10 overflow-hidden">
                {/* Floating specular bubbles */}
                <div className="absolute top-2 left-4 w-4 h-2.5 rounded-full bg-white/70 blur-[0.5px]" />
                <div className="absolute bottom-3 right-5 w-2 h-2 rounded-full bg-white/50" />
                
                {/* Audio wave icon / loader */}
                {isLoading || isSpeaking || isPlaying ? (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-9 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="w-1.5 h-8 bg-white rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  </div>
                ) : (
                  <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
                )}
              </div>
            </div>

            {/* Speaking Status Pill */}
            <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_8px_rgba(38,198,218,0.12)] backdrop-blur-md">
              <span className={cn(
                "w-2 h-2 rounded-full",
                (isPlaying || isSpeaking) ? "bg-[#69f0ae] shadow-[0_0_8px_#69f0ae] animate-pulse" : "bg-[#26c6da]"
              )} />
              <span className="text-xs font-display font-semibold text-[#0b3b4a]">
                AI Partner {isSpeaking || isPlaying ? 'Speaking' : 'Ready'}: <span className="text-primary font-bold">Emma (AI Native)</span>
              </span>
              <Volume2 className="w-3.5 h-3.5 text-primary ml-1" />
            </div>
          </div>

          {/* Terminology Box for specialized trainings */}
          <TerminologyBox scenarioId={selectedScenario} />

          {/* Messages Container */}
          <Card className="flex-1 overflow-hidden rounded-3xl aero-glass border-white/90 shadow-card">
            <CardContent className="p-4 md:p-6 h-full overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" && "justify-end"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-9 h-9 rounded-full orb-aqua border border-white/90 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                        <Sparkles className="w-4 h-4 text-white drop-shadow-sm" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[85%] md:max-w-[80%] space-y-2",
                      message.role === "user" && "text-right"
                    )}>
                      {/* Speaker label */}
                      <div className="text-[11px] font-display font-semibold text-[#3c494b]/80 px-2 flex items-center gap-1.5 justify-start">
                        {message.role === "assistant" ? (
                          <span>Emma · AI Tutor</span>
                        ) : (
                          <span className="ml-auto">You · Learner</span>
                        )}
                      </div>

                      <div
                        className={cn(
                          "inline-block p-4.5 rounded-3xl backdrop-blur-xl border transition-all text-sm leading-relaxed",
                          message.role === "assistant"
                            ? "bg-white/85 text-[#0b3b4a] border-white/95 rounded-tl-sm shadow-sm"
                            : "btn-gel-aqua text-white rounded-tr-sm shadow-aqua-sm border-white/60 font-medium"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <ChatFeedback content={message.content} />
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                        {message.role === "assistant" && (
                          <div className="mt-2 pt-2 border-t border-white/60 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-7 px-2.5 rounded-full text-xs font-display font-semibold transition-all",
                                isPlaying ? "btn-gel-aqua text-white shadow-aqua-sm" : "bg-white/70 hover:bg-white text-[#0b3b4a] border border-white"
                              )}
                              onClick={() => speakMessage(message.content)}
                              disabled={isSpeaking}
                            >
                              {isSpeaking ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              ) : isPlaying ? (
                                <Square className="w-3.5 h-3.5 mr-1" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5 mr-1 text-primary" />
                              )}
                              <span>Listen replay</span>
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Pronunciation Score Badge */}
                      {message.role === "user" && message.pronunciationScore !== undefined && (
                        <div className="flex justify-end">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-semibold backdrop-blur-md border shadow-sm",
                            getPronunciationFeedback(message.pronunciationScore).color,
                            "bg-white/85 border-white"
                          )}>
                            <span>{getPronunciationFeedback(message.pronunciationScore).emoji}</span>
                            <span className="text-[#0b3b4a]">Pronunciation: {Math.round(message.pronunciationScore * 100)}%</span>
                            <span className="text-[#3c494b]/70">
                              ({getPronunciationFeedback(message.pronunciationScore).label})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && messages.length === 0 && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full orb-aqua flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div className="bg-white/85 rounded-3xl rounded-tl-sm p-4 border border-white/90 shadow-sm">
                      <p className="text-xs font-semibold text-[#0b3b4a]">Connecting with AI Partner...</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Pronunciation Score Preview */}
          {lastPronunciationScore !== null && input && (
            <div className="mt-3 flex justify-center">
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-display font-bold bg-white/90 border border-white shadow-aqua-sm",
                getPronunciationFeedback(lastPronunciationScore).color
              )}>
                <span className="text-base">{getPronunciationFeedback(lastPronunciationScore).emoji}</span>
                <span>Pronunciation Score: {Math.round(lastPronunciationScore * 100)}%</span>
                <span className="text-[#3c494b]/80">
                  - {getPronunciationFeedback(lastPronunciationScore).label}
                </span>
              </div>
            </div>
          )}

          {/* Floating Control Dock with 3D Mic Orb */}
          <div className="mt-3 p-2 rounded-full aero-glass border-white/90 shadow-card-hover flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "w-11 h-11 rounded-full transition-all flex-shrink-0 shadow-sm",
                isRecording 
                  ? "bg-rose-500 text-white animate-pulse shadow-[0_0_16px_rgba(244,63,94,0.6)] border-white" 
                  : "orb-aqua border border-white/90 text-white hover:scale-105"
              )}
              onClick={toggleRecording}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 drop-shadow-sm" />}
            </Button>
            <Input
              placeholder={isRecording ? "🎤 Listening... speak in English" : "Type your message in English..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-white/70 border-white/90 shadow-none text-sm text-[#091f21] placeholder:text-[#3c494b]/60"
              disabled={isLoading}
            />
            <Button 
              variant="hero" 
              size="icon" 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 rounded-full btn-gel-aqua shadow-aqua-sm flex-shrink-0"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-6xl mx-auto px-4">
        <DemoBanner />
        {/* Back Button & Title */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-foreground hover:bg-white/90 shadow-sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-primary" />
            Volver al Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl orb-aqua flex items-center justify-center shadow-aqua">
                <Sparkles className="w-8 h-8 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl text-foreground text-shadow-sm">
                  AI Conversation
                </h1>
                <p className="text-muted-foreground font-medium">
                  Practice with your virtual tutor 24/7 with AI-powered instant correction
                </p>
              </div>
            </div>
            {user && (
              <Button
                variant="outline"
                onClick={() => navigate('/conversation/history')}
                className="gap-2 btn-gel-white rounded-full self-start sm:self-auto"
              >
                <History className="w-4 h-4 text-primary" />
                History
              </Button>
            )}
          </div>
        </div>

        {/* Grammar Tips based on history */}
        <GrammarTips />

        {/* Level Filter */}
        <div className="mb-6 aero-card rounded-3xl p-5">
          <h2 className="font-display font-semibold text-lg text-foreground mb-3">Filter by Level</h2>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel(level)}
                className={`min-w-[60px] rounded-full transition-all ${
                  selectedLevel === level 
                    ? "btn-gel-aqua font-bold text-white shadow-aqua-sm" 
                    : "btn-gel-white text-foreground hover:border-primary/40"
                }`}
              >
                {level}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-semibold mt-3">
            {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Scenario Selection */}
        <h2 className="font-display font-bold text-xl text-foreground mb-4">Choose a Scenario</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className="group cursor-pointer aero-card rounded-3xl hover:shadow-aqua hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              onClick={() => handleStartScenario(scenario.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-cyan-50 border border-white/80 shadow-aqua-sm flex items-center justify-center text-3xl group-hover:scale-110 group-hover:shadow-aqua transition-all flex-shrink-0">
                    {scenario.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                        {scenario.title}
                      </h3>
                      <span className="pill-bubble-aqua text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0">
                        {scenario.level}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {scenario.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 w-full btn-gel-white group-hover:btn-gel-aqua group-hover:text-white transition-all text-xs font-semibold rounded-full"
                    >
                      Start Conversation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Login prompt for saving history */}
        {!user && (
          <Card className="mt-8 aero-card rounded-3xl border-primary/30 bg-gradient-to-r from-primary/10 via-white/80 to-accent/10 shadow-aqua-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground mb-1">💾 Save Your Progress</h3>
                  <p className="text-xs text-muted-foreground">
                    Sign in to save your conversations and view your practice history
                  </p>
                </div>
                <Button onClick={() => navigate('/auth')} className="btn-gel-aqua rounded-full px-6">
                  Create Free Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="mt-8 aero-card rounded-3xl">
          <CardContent className="p-6">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span> Practice Tips
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Try writing complete sentences, not just single words</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Don't worry about mistakes, the AI tutor will correct you kindly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Use the audio button to hear the correct pronunciation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Practice at least 10 minutes a day to improve your fluency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>The AI adapts to your level configured in Settings</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
