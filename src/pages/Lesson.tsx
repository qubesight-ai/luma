import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExerciseQuestion } from "@/components/ExerciseQuestion";
import { grammarCategories } from "@/data/grammarData";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Volume2, BookOpen, Dumbbell, Trophy, Home, Loader2, Square } from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { cleanQuestionForTTS } from "@/lib/questionFormatter";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";

type LessonStep = "explanation" | "exercises" | "complete";

export default function Lesson() {
  const navigate = useNavigate();
  const { type, categoryId, topicId } = useParams();
  const [currentStep, setCurrentStep] = useState<LessonStep>("explanation");
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [answerHistory, setAnswerHistory] = useState<Record<number, string>>({});
  const feedbackSentRef = useRef(false);
  const { sendExerciseResultEmail } = useExerciseFeedback();

  // Find the topic
  const category = grammarCategories.find(c => c.id === categoryId);
  const topic = category?.topics.find(t => t.id === topicId);

  useEffect(() => {
    if (!topic) {
      navigate("/grammar");
    }
  }, [topic, navigate]);

  if (!topic || !category) {
    return null;
  }

  const exercises = topic.exercises;
  const currentExerciseData = exercises[currentExercise];

  const displayOptions = useMemo(() => {
    if (!currentExerciseData?.options?.length) return [];
    return shuffleArray(currentExerciseData.options);
  }, [currentExercise, currentExerciseData?.question]);

  const isCorrect = selectedAnswer === currentExerciseData?.correctAnswer;

  const handleSelectAnswer = (answer: string) => {
    if (showExplanation) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    setAnswerHistory(prev => ({ ...prev, [currentExercise]: answer }));
    
    if (answer === currentExerciseData.correctAnswer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      toast({
        title: "Correct! 🎉",
        description: "Excellent work",
      });
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const handleNextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCurrentStep("complete");
      // Send email feedback
      if (!feedbackSentRef.current) {
        feedbackSentRef.current = true;
        const finalCorrect = score.correct + (selectedAnswer === currentExerciseData?.correctAnswer ? 1 : 0);
        const percentage = Math.round((finalCorrect / exercises.length) * 100);
        const incorrectAnswers = exercises
          .map((ex, i) => ({ question: ex.question, userAnswer: answerHistory[i] || selectedAnswer || "", correctAnswer: ex.correctAnswer }))
          .filter(item => item.userAnswer !== item.correctAnswer);
        sendExerciseResultEmail({
          exerciseType: "Grammar Lesson",
          exerciseTitle: `${topic.title} (${topic.level})`,
          level: topic.level,
          score: percentage,
          totalQuestions: exercises.length,
          correctAnswers: finalCorrect,
          incorrectAnswers,
        });
      }
    }
  };

  // ElevenLabs TTS
  const { speak, stopAudio, isLoading: isSpeaking, isPlaying } = useElevenLabsTTS();

  const speakText = (text: string) => {
    const cleanedText = cleanQuestionForTTS(text);
    if (isPlaying) {
      stopAudio();
    } else {
      speak(cleanedText);
    }
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      A1: "bg-level-a1",
      A2: "bg-level-a2",
      B1: "bg-level-b1",
      B2: "bg-level-b2",
      C1: "bg-level-c1",
    };
    return colors[level] || "bg-primary";
  };

  if (currentStep === "complete") {
    const percentage = Math.round((score.correct / exercises.length) * 100);
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-success" />
                </div>
                
                <h2 className="font-display font-bold text-2xl mb-2">
                  Lesson Completed!
                </h2>
                <p className="text-muted-foreground mb-6">
                  You finished: {topic.title}
                </p>
                
                <div className="flex items-center justify-center gap-8 mb-8">
                  <div className="text-center">
                    <p className="text-4xl font-display font-bold text-success">{score.correct}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-4xl font-display font-bold text-destructive">{score.incorrect}</p>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-4xl font-display font-bold text-primary">{percentage}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium">+50 XP earned</p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => navigate("/grammar")}>
                    Back to Grammar
                  </Button>
                  <Button variant="hero" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header with navigation */}
          <div className="mb-6 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <span className="text-muted-foreground">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/grammar")}
            >
              Grammar
            </Button>
          </div>

          {/* Topic Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-white",
              getLevelColor(topic.level)
            )}>
              {topic.level}
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">{topic.title}</h1>
              <p className="text-sm text-muted-foreground">{category.title}</p>
            </div>
          </div>

          {/* Step Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentStep === "explanation" 
                  ? "bg-primary text-white" 
                  : "bg-secondary text-muted-foreground"
              )}
              onClick={() => setCurrentStep("explanation")}
            >
              <BookOpen className="w-4 h-4" />
              Explanation
            </button>
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentStep === "exercises" 
                  ? "bg-primary text-white" 
                  : "bg-secondary text-muted-foreground"
              )}
              onClick={() => setCurrentStep("exercises")}
            >
              <Dumbbell className="w-4 h-4" />
              Exercises
            </button>
          </div>

          {/* Content */}
          {currentStep === "explanation" && (
            <Card>
              <CardContent className="p-8">
                {/* Explanation */}
                <div className="prose prose-sm max-w-none mb-8">
                  <h3 className="font-display font-semibold text-lg mb-4">What is {topic.title}?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {topic.explanation}
                  </p>
                </div>

                {/* Examples */}
                <div className="mb-8">
                  <h3 className="font-display font-semibold text-lg mb-4">Examples</h3>
                  <div className="space-y-3">
                    {topic.examples.map((example, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-secondary/50 border"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{example.english}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-8 w-8", isPlaying && "text-primary")}
                          onClick={() => speakText(example.english)}
                          disabled={isSpeaking}
                        >
                          {isSpeaking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isPlaying ? (
                            <Square className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{example.context}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Exercises Button */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setCurrentStep("exercises");
                    setCurrentExercise(0);
                    setScore({ correct: 0, incorrect: 0 });
                  }}
                >
                  <Dumbbell className="w-5 h-5 mr-2" />
                  Start Exercises
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "exercises" && currentExerciseData && (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Exercise {currentExercise + 1} of {exercises.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {score.correct} correct
                  </span>
                </div>
                <Progress 
                  value={((currentExercise + 1) / exercises.length) * 100} 
                  className="h-2"
                />
              </div>

              <Card>
                <CardContent className="p-8">
                  {/* Question */}
                  <ExerciseQuestion 
                    question={currentExerciseData.question} 
                    className="mb-6"
                  />

                  {/* Options */}
                  <div className="space-y-3">
                    {displayOptions.map((option) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrectOption = option === currentExerciseData.correctAnswer;
                      
                      return (
                        <button
                          key={option}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 text-left font-medium transition-all",
                            !showExplanation && "hover:border-primary hover:bg-primary/5",
                            !showExplanation && isSelected && "border-primary bg-primary/10",
                            showExplanation && isCorrectOption && "border-success bg-success/10 text-success",
                            showExplanation && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive"
                          )}
                          onClick={() => handleSelectAnswer(option)}
                          disabled={showExplanation}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {showExplanation && isCorrectOption && (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            )}
                            {showExplanation && isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {showExplanation && (
                    <div className={cn(
                      "mt-6 p-4 rounded-xl",
                      isCorrect ? "bg-success/10 border border-success/20" : "bg-warning/10 border border-warning/20"
                    )}>
                      <p className="font-medium mb-1">
                        {isCorrect ? "Correct!" : `Correct answer: ${currentExerciseData.correctAnswer}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentExerciseData.explanation}
                      </p>
                    </div>
                  )}

                  {/* Next Button */}
                  {showExplanation && (
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full mt-6"
                      onClick={handleNextExercise}
                    >
                      {currentExercise < exercises.length - 1 ? (
                        <>
                          Next Exercise
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        "View Results"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}