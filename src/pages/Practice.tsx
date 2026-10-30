import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Shuffle } from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getRandomGrammarExercises, GrammarExercise } from "@/data/grammarExercisesExpanded";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
}

// Convert grammar exercises to questions format
function convertToQuestions(exercises: GrammarExercise[]): Question[] {
  return exercises.map(ex => ({
    id: ex.id,
    question: ex.question,
    options: ex.options || [],
    correctAnswer: ex.correctAnswer,
    explanation: ex.explanation,
    category: ex.category,
  }));
}

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const levelParam = searchParams.get("level") as CEFRLevel | null;
  
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(levelParam || "A1");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<Record<string, string>>({});
  const feedbackSentRef = useRef(false);
  const { sendExerciseResultEmail } = useExerciseFeedback();
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);

  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  // Update level when URL param changes
  useEffect(() => {
    if (levelParam && levels.includes(levelParam)) {
      setSelectedLevel(levelParam);
    }
  }, [levelParam]);

  // Load questions for selected level
  useEffect(() => {
    const exercises = getRandomGrammarExercises(selectedLevel, 50);
    setPracticeQuestions(convertToQuestions(exercises));
    // Reset state when level changes
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, incorrect: 0 });
    setIsComplete(false);
  }, [selectedLevel]);

  const currentQuestion = practiceQuestions[currentQuestionIndex];

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion?.options?.length) return [];
    return shuffleArray(currentQuestion.options);
  }, [currentQuestionIndex, currentQuestion?.id]);

  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const progress = practiceQuestions.length > 0 
    ? ((currentQuestionIndex + 1) / practiceQuestions.length) * 100 
    : 0;

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      A1: "bg-level-a1",
      A2: "bg-level-a2",
      B1: "bg-level-b1",
      B2: "bg-level-b2",
      C1: "bg-level-c1",
      C2: "bg-level-c2",
    };
    return colors[level] || "bg-primary";
  };

  const handleSelectAnswer = (answer: string) => {
    if (showExplanation) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    setAnswerHistory(prev => ({ ...prev, [currentQuestion.id]: answer }));

    if (answer === currentQuestion.correctAnswer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      toast({
        title: "Correct! 🎉",
        description: "Excellent work",
      });
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    const exercises = getRandomGrammarExercises(selectedLevel, 50);
    setPracticeQuestions(convertToQuestions(exercises));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, incorrect: 0 });
    setIsComplete(false);
    setAnswerHistory({});
    feedbackSentRef.current = false;
  };

  const handleLevelChange = (level: CEFRLevel) => {
    setSelectedLevel(level);
    navigate(`/practice?level=${level}`, { replace: true });
    feedbackSentRef.current = false;
  };

  useEffect(() => {
    if (!isComplete || feedbackSentRef.current || practiceQuestions.length === 0) return;

    feedbackSentRef.current = true;
    const percentage = Math.round((score.correct / practiceQuestions.length) * 100);
    const incorrectAnswers = practiceQuestions
      .filter((q) => answerHistory[q.id] && answerHistory[q.id] !== q.correctAnswer)
      .map((q) => ({
        question: q.question,
        userAnswer: answerHistory[q.id],
        correctAnswer: q.correctAnswer,
      }));

    sendExerciseResultEmail({
      exerciseType: "Practice",
      exerciseTitle: `Practice Session (${selectedLevel})`,
      level: selectedLevel,
      score: percentage,
      totalQuestions: practiceQuestions.length,
      correctAnswers: score.correct,
      incorrectAnswers,
    });
  }, [isComplete, practiceQuestions, score.correct, answerHistory, selectedLevel, sendExerciseResultEmail]);

  if (practiceQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Loading exercises...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score.correct / practiceQuestions.length) * 100);
    
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-10">
          <Card className="max-w-2xl mx-auto rounded-3xl aero-glass border-white/90 shadow-card-hover p-4">
            <CardContent className="text-center py-10">
              <div className="w-20 h-20 rounded-full orb-aqua border-2 border-white/90 flex items-center justify-center mx-auto mb-5 shadow-aqua-lg animate-float">
                <Trophy className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <h2 className="text-3xl font-display font-extrabold text-[#0b3b4a] mb-2">Session Complete!</h2>
              <p className="text-[#3c494b] font-medium mb-8">
                Level {selectedLevel} Practice
              </p>
              
              <div className="flex justify-center gap-4 sm:gap-6 mb-8">
                <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-sm min-w-[90px]">
                  <p className="text-3xl font-display font-bold text-success">{score.correct}</p>
                  <p className="text-xs font-semibold text-[#3c494b]/80 mt-1">Correct</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-sm min-w-[90px]">
                  <p className="text-3xl font-display font-bold text-rose-500">{score.incorrect}</p>
                  <p className="text-xs font-semibold text-[#3c494b]/80 mt-1">Incorrect</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-sm min-w-[90px]">
                  <p className="text-3xl font-display font-bold text-primary">{percentage}%</p>
                  <p className="text-xs font-semibold text-[#3c494b]/80 mt-1">Score</p>
                </div>
              </div>

              <div className="flex gap-3.5 justify-center">
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="btn-gel-white border-[#c7dee1]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button onClick={handleRestart} className="btn-gel-aqua shadow-aqua-sm">
                  <Shuffle className="w-4 h-4 mr-2" />
                  New Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="rounded-full bg-white/60 hover:bg-white/90 border border-white/80 shadow-sm text-[#0b3b4a]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-white/90 shadow-sm">
              <span className="text-xs font-semibold text-[#3c494b]">Score:</span>
              <span className="text-emerald-600 font-display font-bold text-sm">{score.correct}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-rose-500 font-display font-bold text-sm">{score.incorrect}</span>
            </div>
          </div>

          {/* Level Selector */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {levels.map(level => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => handleLevelChange(level)}
                className={cn(
                  "gap-1 rounded-full font-display font-bold",
                  selectedLevel === level 
                    ? "btn-gel-aqua text-white shadow-aqua-sm"
                    : "bg-white/70 border-white/90 hover:bg-white text-[#0b3b4a]"
                )}
              >
                {level}
              </Button>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-6 p-4 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-md shadow-sm">
            <div className="flex justify-between text-xs font-semibold text-[#0b3b4a] mb-2">
              <span>Question {currentQuestionIndex + 1} of {practiceQuestions.length}</span>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-white text-xs font-extrabold shadow-sm",
                getLevelColor(selectedLevel)
              )}>
                {selectedLevel}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Question Card */}
          <Card className="mb-6 rounded-3xl aero-glass border-white/90 shadow-card">
            <CardContent className="pt-7 pb-7 px-6 md:px-8">
              <p className="text-xs font-display font-bold text-primary mb-2 uppercase tracking-wider">
                {currentQuestion.category}
              </p>
              <h3 className="text-xl md:text-2xl font-display font-bold text-[#0b3b4a] mb-6 leading-snug">{currentQuestion.question}</h3>

              <div className="space-y-3">
                {shuffledOptions.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={showExplanation}
                      className={cn(
                        "w-full p-4 rounded-2xl border text-left transition-all duration-200 font-medium text-sm",
                        !showExplanation && "bg-white/70 border-white/90 hover:border-primary/50 hover:bg-white/95 text-[#0b3b4a] shadow-sm hover:shadow-aqua-sm",
                        showExplanation && isCorrectOption && "border-emerald-500 bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-950 shadow-sm",
                        showExplanation && isSelected && !isCorrectOption && "border-rose-400 bg-rose-500/10 text-rose-950",
                        !showExplanation && isSelected && "border-primary bg-primary/10 text-primary shadow-aqua-sm"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showExplanation && isCorrectOption && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        {showExplanation && isSelected && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className={cn(
                  "mt-6 p-4 rounded-2xl border backdrop-blur-md",
                  isCorrect 
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-950" 
                    : "bg-rose-500/10 border-rose-500/25 text-rose-950"
                )}>
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-display font-bold mb-1">
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </p>
                      <p className="text-sm opacity-90 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleRestart} className="btn-gel-white border-[#c7dee1]">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
            {showExplanation && (
              <Button onClick={handleNextQuestion} className="btn-gel-aqua shadow-aqua-sm">
                {currentQuestionIndex < practiceQuestions.length - 1 ? (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
