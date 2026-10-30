import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Languages, Loader2, BookOpen, Sparkles, Mic, MicOff, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface GrammarPoint {
  label: string;
  value: string;
  explanation: string;
}

interface GrammarResponse {
  spanish: string;
  english: string;
  pronunciation: string;
  grammarSummary: string;
  grammarPoints?: GrammarPoint[];
  notes?: string;
}

export default function SpanishCoach() {
  const navigate = useNavigate();
  const [spanishText, setSpanishText] = useState("");
  const [level, setLevel] = useState<CEFRLevel>("A2");
  const [result, setResult] = useState<GrammarResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const tts = useElevenLabsTTS();

  const toggleMicrophone = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setSpanishText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error("Permiso de micrófono denegado. Habilítalo en la configuración del navegador.");
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spanishText.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spanish-grammar-coach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: spanishText.trim(),
            level,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Spanish grammar coach error:", response.status, data);
        if (response.status === 429) {
          setError("Too many requests. Please wait a moment and try again.");
        } else if (response.status === 402) {
          setError("AI service quota exceeded. Please try again later.");
        } else {
          setError(data?.error || "There was a problem analyzing the sentence. Please try again.");
        }
        return;
      }

      if (!data || !data.english) {
        setError("Invalid response from grammar coach. Please try again.");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Spanish grammar coach exception:", err);
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-3xl">
        {/* Back Button & Title */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Languages className="w-7 h-7 text-primary" />
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
              Spanish → English Grammar Coach
            </h1>
          </div>
          <p className="text-muted-foreground">
            Write a sentence in Spanish and get a natural English translation,
            pronunciation guide, and a clear explanation of the grammar behind it.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Input form */}
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Spanish sentence
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="Escribe aquí tu frase en español o usa el micrófono..."
                    value={spanishText}
                    onChange={(e) => setSpanishText(e.target.value)}
                    rows={3}
                    className="pr-14"
                  />
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={toggleMicrophone}
                    title={isListening ? "Detener micrófono" : "Hablar en español"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                {isListening && (
                  <p className="mt-1 text-xs text-primary animate-pulse">
                    🎙️ Escuchando... habla en español
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 justify-between">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your current level
                  </label>
                  <Select value={level} onValueChange={(v) => setLevel(v as CEFRLevel)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1 - Beginner</SelectItem>
                      <SelectItem value="A2">A2 - Elementary</SelectItem>
                      <SelectItem value="B1">B1 - Intermediate</SelectItem>
                      <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                      <SelectItem value="C1">C1 - Advanced</SelectItem>
                      <SelectItem value="C2">C2 - Proficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !spanishText.trim()}
                  className="inline-flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Translate & explain
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/40 p-4">
                  <h2 className="font-display font-semibold text-lg mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-primary" />
                    Translation
                  </h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    Spanish:
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm font-medium">{result.spanish}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => tts.speak(result.spanish)}
                      disabled={tts.isLoading}
                      title="Escuchar en español"
                    >
                      {tts.isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    English:
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-foreground">{result.english}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => tts.speak(result.english)}
                      disabled={tts.isLoading}
                      title="Listen in English"
                    >
                      {tts.isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/40 p-4">
                  <h2 className="font-display font-semibold text-lg mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Pronunciation
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {result.pronunciation}
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                  <h2 className="font-display font-semibold text-lg mb-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Grammar explanation
                  </h2>
                  <p className="text-sm font-medium text-foreground">
                    {result.grammarSummary}
                  </p>

                  {result.grammarPoints && result.grammarPoints.length > 0 && (
                    <ul className="mt-2 space-y-2 text-sm">
                      {result.grammarPoints.map((point, idx) => (
                        <li key={idx} className="rounded-lg bg-background border px-3 py-2">
                          <div className="font-semibold">
                            {point.label}:{" "}
                            <span className="font-normal text-primary">
                              {point.value}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {point.explanation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {result.notes && (
                    <div className="mt-3 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm text-primary">
                      {result.notes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

