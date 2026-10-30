import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Brain, Zap } from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getAdaptiveQuestions, QuizQuestion } from "@/data/quizData";
import { useGamification } from "@/hooks/useGamification";
import { useAdaptiveLearning } from "@/hooks/useAdaptiveLearning";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";

export default function AdaptiveQuiz() {
  const navigate = useNavigate();
  const { addXP, completedQuiz } = useGamification();
  const { profile, recordPerformance } = useAdaptiveLearning();
  
  const [selectedLevel, setSelectedLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1" | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [sessionPerformance, setSessionPerformance] = useState(75);
  const [answerHistory, setAnswerHistory] = useState<Record<string, string>>({});
  const feedbackSentRef = useRef(false);
  const { sendExerciseResultEmail } = useExerciseFeedback();

  const startQuiz = (level: "A1" | "A2" | "B1" | "B2" | "C1") => {
    setSelectedLevel(level);
    const adaptiveQuestions = getAdaptiveQuestions(level, sessionPerformance, 10);
    setQuestions(adaptiveQuestions);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion?.options?.length) return [];
    return shuffleArray([...currentQuestion.options]);
  }, [currentQuestionIndex, currentQuestion?.id]);

  const handleSelectAnswer = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    setAnswerHistory(prev => ({ ...prev, [currentQuestion.id]: answer }));

    if (answer === currentQuestion.correctAnswer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setSessionPerformance(prev => Math.min(100, prev + 5));
      addXP(10, 'quiz');
      toast({ title: "Correct! 🎉", description: "+10 XP" });
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setSessionPerformance(prev => Math.max(0, prev - 10));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const accuracy = Math.round((score.correct / questions.length) * 100);
      completedQuiz(accuracy);
      recordPerformance(currentQuestion.category, accuracy, 5, questions.length);
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, incorrect: 0 });
    setIsComplete(false);
    setSelectedLevel(null);
    setAnswerHistory({});
    feedbackSentRef.current = false;
  };

  useEffect(() => {
    if (!isComplete || feedbackSentRef.current || !selectedLevel || questions.length === 0) return;

    feedbackSentRef.current = true;
    const percentage = Math.round((score.correct / questions.length) * 100);
    const incorrectAnswers = questions
      .filter((q) => answerHistory[q.id] && answerHistory[q.id] !== q.correctAnswer)
      .map((q) => ({
        question: q.question,
        userAnswer: answerHistory[q.id],
        correctAnswer: q.correctAnswer,
      }));

    sendExerciseResultEmail({
      exerciseType: "Adaptive Quiz",
      exerciseTitle: `Adaptive Quiz ${selectedLevel}`,
      level: selectedLevel,
      score: percentage,
      totalQuestions: questions.length,
      correctAnswers: score.correct,
      incorrectAnswers,
    });
  }, [isComplete, selectedLevel, questions, score.correct, answerHistory, sendExerciseResultEmail]);

  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl">Adaptive Quizzes</h1>
              <p className="text-muted-foreground">+2000 exercises with difficulty that adapts to you</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Adaptive AI</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Difficulty automatically adjusts based on your performance. If you answer correctly, questions will be harder. If you make mistakes, we'll help you reinforce.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">Current difficulty level: <span className="font-bold text-primary">{profile.adaptiveDifficulty}/5</span></p>
              </div>
            </CardContent>
          </Card>

          <h2 className="font-display font-semibold text-lg mb-4">Select your level</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
              <Card key={level} className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startQuiz(level)}>
                <CardContent className="p-6 text-center">
                  <div className={cn("w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl", `bg-level-${level.toLowerCase()}`)}>
                    {level}
                  </div>
                  <h3 className="font-semibold mb-2">{level === "A1" ? "Beginner" : level === "A2" ? "Elementary" : level === "B1" ? "Intermediate" : level === "B2" ? "Upper Intermediate" : "Advanced"}</h3>
                  <Button variant="outline" size="sm" className="w-full">Start Quiz</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score.correct / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl mb-2">Quiz Completed!</h2>
                <div className="flex items-center justify-center gap-8 my-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-success">{score.correct}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-destructive">{score.incorrect}</p>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{percentage}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Home</Button>
                  <Button variant="hero" onClick={handleRestart}><RotateCcw className="w-4 h-4 mr-2" />Another Quiz</Button>
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={handleRestart}><ArrowLeft className="w-4 h-4 mr-2" />Exit</Button>
          </div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="text-sm text-muted-foreground">{score.correct} correct</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <Card>
            <CardContent className="p-8">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">{currentQuestion?.category}</span>
              <h2 className="font-display font-bold text-2xl mb-8">{currentQuestion?.question}</h2>
              <div className="space-y-3">
                {shuffledOptions.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  return (
                    <button key={option} className={cn("w-full p-4 rounded-xl border-2 text-left font-medium transition-all", !showExplanation && "hover:border-primary hover:bg-primary/5", showExplanation && isCorrectOption && "border-success bg-success/10 text-success", showExplanation && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive")} onClick={() => handleSelectAnswer(option)} disabled={showExplanation}>
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showExplanation && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-success" />}
                        {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {showExplanation && (
                <>
                  <div className={cn("mt-6 p-4 rounded-xl", isCorrect ? "bg-success/10 border border-success/20" : "bg-warning/10 border border-warning/20")}>
                    <p className="font-medium mb-1">{isCorrect ? "Correct!" : "Correct answer: " + currentQuestion.correctAnswer}</p>
                    <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>
                  <Button variant="hero" size="lg" className="w-full mt-6" onClick={handleNextQuestion}>
                    {currentQuestionIndex < questions.length - 1 ? <>Next<ArrowRight className="w-4 h-4 ml-2" /></> : "View Results"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}