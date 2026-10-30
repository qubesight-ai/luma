import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Headphones, Loader2, Play, Square, Sparkles, CheckCircle2, XCircle,
  Trophy, RotateCcw, Home, Lightbulb,
} from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";

type Difficulty = "easy" | "moderate" | "difficult";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Episode {
  title: string;
  topic: string;
  difficulty: Difficulty;
  script: string;
  questions: Question[];
  
}

const difficultyOptions: { value: Difficulty; label: string; hint: string; level: string }[] = [
  { value: "easy", label: "Easy", hint: "Simple words, slow and clear", level: "A2" },
  { value: "moderate", label: "Moderate", hint: "Natural pace, varied tenses", level: "B1-B2" },
  { value: "difficult", label: "Difficult", hint: "Advanced vocabulary and nuance", level: "C1-C2" },
];

const suggestions = ["FIFA World Cup 2026", "Artificial intelligence at work", "Coffee farming in Costa Rica", "Space tourism"];

export default function ListeningLab() {
  const navigate = useNavigate();
  const { speak, stopAudio, isLoading: isAudioLoading, isPlaying } = useElevenLabsTTS();
  const { sendExerciseResultEmail } = useExerciseFeedback();

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("moderate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [phase, setPhase] = useState<"setup" | "listen" | "quiz" | "results">("setup");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Record<number, { answer: string; correct: boolean }>>({});

  const currentQuestion = episode?.questions[currentIndex];
  const displayOptions = useMemo(
    () => (currentQuestion ? shuffleArray([...currentQuestion.options]) : []),
    [currentIndex, currentQuestion?.question],
  );

  const score = Object.values(answers).filter((a) => a.correct).length;
  const total = episode?.questions.length ?? 0;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const generateEpisode = async () => {
    if (topic.trim().length < 2) {
      toast({ title: "Choose a topic", description: "Write a topic you want to practise with.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    stopAudio();
    try {
      const { data, error } = await supabase.functions.invoke("listening-lab", {
        body: { topic: topic.trim(), difficulty },
      });
      if (error) throw error;
      if (!data?.script) throw new Error("Empty episode");

      setEpisode(data as Episode);
      setPhase("listen");
      setCurrentIndex(0);
      setSelected(null);
      setShowExplanation(false);
      setAnswers({});
    } catch (err) {
      console.error("listening-lab failed:", err);
      toast({
        title: "Could not create the listening episode",
        description: "Please try again with a shorter topic.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (showExplanation || !currentQuestion) return;
    const correct = option === currentQuestion.correctAnswer;
    setSelected(option);
    setAnswers((prev) => ({ ...prev, [currentIndex]: { answer: option, correct } }));
    setShowExplanation(true);
  };

  const finishQuiz = (finalAnswers: Record<number, { answer: string; correct: boolean }>) => {
    if (!episode) return;
    const finalScore = Object.values(finalAnswers).filter((a) => a.correct).length;
    const incorrect = episode.questions
      .map((q, i) => ({ q, i }))
      .filter(({ i }) => finalAnswers[i] && !finalAnswers[i].correct)
      .map(({ q, i }) => ({
        question: q.question,
        userAnswer: finalAnswers[i].answer,
        correctAnswer: q.correctAnswer,
      }));

    setPhase("results");
    sendExerciseResultEmail({
      exerciseType: "Listening Lab",
      exerciseTitle: `${episode.title} (${episode.topic})`,
      level: difficultyOptions.find((d) => d.value === episode.difficulty)?.level ?? "B1",
      score: episode.questions.length > 0 ? Math.round((finalScore / episode.questions.length) * 100) : 0,
      totalQuestions: episode.questions.length,
      correctAnswers: finalScore,
      incorrectAnswers: incorrect,
    });
  };

  const nextQuestion = () => {
    if (!episode) return;
    if (currentIndex < episode.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      finishQuiz(answers);
    }
  };

  const reset = () => {
    stopAudio();
    setEpisode(null);
    setPhase("setup");
    setAnswers({});
    setCurrentIndex(0);
    setSelected(null);
    setShowExplanation(false);
  };

  const improvementAreas = useMemo(() => {
    if (!episode) return [];
    const wrong = episode.questions.filter((_, i) => answers[i] && !answers[i].correct);
    const areas: string[] = [];
    if (wrong.length === 0) {
      areas.push("Excellent listening. Try the Difficult level on the same topic to keep growing.");
    } else {
      areas.push(`Detail catching: you missed ${wrong.length} of ${episode.questions.length} details. Listen again and pause after each idea.`);
      if (wrong.length >= 4) areas.push("Try the same topic at an easier level first, then come back.");
      areas.push("Shadow the audio: replay it and repeat aloud to train your ear and pronunciation.");
    }
    return areas;
  }, [episode, answers]);

  return (
    <AppLayout>
      <div className="container max-w-3xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Headphones className="w-7 h-7 text-primary" />
              Listening Lab
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Pick any topic, choose a level, and get a 3-minute audio episode with a 10-question quiz.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        {phase === "setup" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Your topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. FIFA World Cup 2026"
                  maxLength={120}
                  onKeyDown={(e) => e.key === "Enter" && generateEpisode()}
                />
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => setTopic(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-medium">2. Difficulty</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDifficulty(option.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all hover:border-primary",
                        difficulty === option.value ? "border-primary bg-primary/5" : "border-border",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{option.label}</span>
                        <Badge variant="outline" className="text-[10px]">{option.level}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{option.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={generateEpisode} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating your episode...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate listening episode
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === "listen" && episode && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-lg">
                <span>{episode.title}</span>
                <Badge variant="secondary" className="capitalize">{episode.difficulty}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Listen carefully. The transcript stays hidden so you train your ear. You can replay as many times as you need.
              </p>

              <div className="p-6 rounded-xl bg-muted/40 flex items-center gap-4">
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full"
                  variant={isPlaying ? "secondary" : "default"}
                  disabled={isAudioLoading}
                  onClick={() => (isPlaying ? stopAudio() : speak(`${episode.title}. ${episode.script}`))}
                >
                  {isAudioLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isPlaying ? (
                    <Square className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {isAudioLoading ? "Preparing the audio..." : isPlaying ? "Playing the episode..." : "Press play to listen"}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={reset}>
                  Change topic
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    stopAudio();
                    setPhase("quiz");
                  }}
                >
                  Start the 10-question quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === "quiz" && episode && currentQuestion && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Question {currentIndex + 1} of {episode.questions.length}</span>
                <span className="font-medium text-primary">Score: {score}/{Object.keys(answers).length}</span>
              </div>
              <Progress value={((currentIndex + 1) / episode.questions.length) * 100} className="h-2" />

              <div className="p-4 rounded-xl bg-muted/50">
                <p className="font-medium text-lg">{currentQuestion.question}</p>
              </div>

              <div className="space-y-3">
                {displayOptions.map((option, i) => {
                  const isSelected = selected === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showCorrect = showExplanation && isCorrect;
                  const showIncorrect = showExplanation && isSelected && !isCorrect;
                  return (
                    <button
                      key={i}
                      disabled={showExplanation}
                      onClick={() => handleAnswer(option)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        !showExplanation && "hover:border-primary hover:bg-primary/5",
                        showCorrect && "border-success bg-success/10",
                        showIncorrect && "border-destructive bg-destructive/10",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{option}</span>
                        {showCorrect && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                        {showIncorrect && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <>
                  <div className={cn(
                    "p-4 rounded-xl border text-sm",
                    selected === currentQuestion.correctAnswer
                      ? "bg-success/10 border-success/30"
                      : "bg-warning/10 border-warning/30",
                  )}>
                    <span className="font-semibold">
                      {selected === currentQuestion.correctAnswer ? "Correct! " : "Not quite. "}
                    </span>
                    {currentQuestion.explanation}
                  </div>
                  <Button size="lg" className="w-full" onClick={nextQuestion}>
                    {currentIndex < episode.questions.length - 1 ? "Next question" : "See my score"}
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => speak(`${episode.title}. ${episode.script}`)}
                disabled={isAudioLoading || isPlaying}
              >
                <Play className="w-4 h-4 mr-2" /> Replay the audio
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === "results" && episode && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-8 text-center space-y-3">
                <Trophy className={cn(
                  "w-16 h-16 mx-auto",
                  percentage >= 80 ? "text-warning" : percentage >= 60 ? "text-primary" : "text-muted-foreground",
                )} />
                <h2 className="text-2xl font-bold">
                  {percentage >= 80 ? "Excellent listening!" : percentage >= 60 ? "Good job!" : "Keep practising!"}
                </h2>
                <p className="text-5xl font-bold text-primary">{score}/{total}</p>
                <p className="text-muted-foreground">{percentage}% correct</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Answers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {episode.questions.map((q, i) => {
                  const a = answers[i];
                  return (
                    <div key={i} className={cn(
                      "p-4 rounded-xl border",
                      a?.correct ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30",
                    )}>
                      <div className="flex items-start gap-2">
                        {a?.correct
                          ? <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                          : <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{i + 1}. {q.question}</p>
                          {!a?.correct && (
                            <p className="text-muted-foreground">Your answer: {a?.answer ?? "—"}</p>
                          )}
                          <p className="text-success-foreground/80">Correct: <span className="font-medium">{q.correctAnswer}</span></p>
                          <p className="text-muted-foreground">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" /> Areas to improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  {improvementAreas.map((area, i) => <li key={i}>{area}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Transcript</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{episode.script}</p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => {
                setPhase("listen");
                setAnswers({});
                setCurrentIndex(0);
                setSelected(null);
                setShowExplanation(false);
              }}>
                <RotateCcw className="w-4 h-4 mr-2" /> Try again
              </Button>
              <Button size="lg" className="flex-1" onClick={reset}>
                New topic
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
