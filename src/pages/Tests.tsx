import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Trophy, Target, ChevronRight, CheckCircle2, XCircle, ArrowRight, BookOpen, Languages } from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import { testDefinitions, TestDefinition, TestQuestion } from "@/data/testsData";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";

export default function Tests() {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState<TestDefinition | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [completedTests, setCompletedTests] = useState<Record<string, number>>({});
  const { sendExerciseResultEmail } = useExerciseFeedback();

  // Get shuffled questions for current test
  const currentQuestions = useMemo(() => {
    if (!selectedTest) return [];
    // Shuffle and take the number of questions specified
    const shuffled = [...selectedTest.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, selectedTest.questionsCount);
  }, [selectedTest]);

  const activeTestQuestion =
    selectedTest && currentQuestions.length > 0 ? currentQuestions[currentQuestion] : null;

  const shuffledTestOptions = useMemo(() => {
    if (!activeTestQuestion?.options?.length) return [];
    return shuffleArray([...activeTestQuestion.options]);
  }, [activeTestQuestion?.id, currentQuestion, selectedTest?.id]);

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

  const getTypeIcon = (type: string) => {
    if (type === "grammar") return <BookOpen className="w-5 h-5" />;
    if (type === "vocabulary") return <Languages className="w-5 h-5" />;
    return <Target className="w-5 h-5" />;
  };

  const handleStartTest = (test: TestDefinition) => {
    setSelectedTest(test);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleSelectAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestions[currentQuestion].id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const score = calculateScore();
      if (selectedTest) {
        setCompletedTests(prev => ({
          ...prev,
          [selectedTest.id]: score
        }));

        const incorrectAnswers = currentQuestions
          .filter((q) => answers[q.id] !== q.correctAnswer)
          .map((q) => ({
            question: q.question,
            userAnswer: answers[q.id] || "(no answer)",
            correctAnswer: q.correctAnswer,
          }));

        sendExerciseResultEmail({
          exerciseType: selectedTest.type === "grammar" ? "Grammar Test" : "Vocabulary Test",
          exerciseTitle: selectedTest.title,
          level: selectedTest.level,
          score,
          totalQuestions: currentQuestions.length,
          correctAnswers: currentQuestions.length - incorrectAnswers.length,
          incorrectAnswers,
        });
      }
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    currentQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / currentQuestions.length) * 100);
  };

  const getCorrectCount = () => {
    return currentQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
  };

  const handleBack = () => {
    if (selectedTest) {
      setSelectedTest(null);
      setShowResults(false);
    } else {
      navigate("/dashboard");
    }
  };

  // Results view
  if (selectedTest && showResults) {
    const score = calculateScore();
    const correctCount = getCorrectCount();
    const incorrectCount = currentQuestions.length - correctCount;
    
    return (
      <AppLayout>
        <div className="container py-8 max-w-4xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="aero-card rounded-3xl overflow-hidden shadow-aqua">
              <CardContent className="p-8 text-center">
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md",
                  score >= 70 ? "orb-green" : "orb-aqua"
                )}>
                  <Trophy className="w-12 h-12 text-white drop-shadow" />
                </div>
                
                <h2 className="font-display font-bold text-2xl text-foreground mb-2 text-shadow-sm">
                  {score >= 70 ? "Excellent work!" : "Keep practicing"}
                </h2>
                <p className="text-muted-foreground font-medium mb-6">
                  You completed the {selectedTest.title}
                </p>
                
                <div className="text-6xl font-display font-black text-primary mb-4 drop-shadow-sm">
                  {score}%
                </div>
                
                <div className="flex items-center justify-center gap-8 mb-8 p-4 bg-white/60 rounded-2xl border border-white/80 max-w-md mx-auto shadow-sm">
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-600">{correctCount}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Correct</p>
                  </div>
                  <div className="w-px h-10 bg-black/10" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-rose-500">{incorrectCount}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Incorrect</p>
                  </div>
                </div>

                {/* Review answers */}
                <div className="text-left mb-8 space-y-3 max-h-80 overflow-y-auto pr-1">
                  <h3 className="font-display font-bold text-foreground sticky top-0 bg-white/90 backdrop-blur-md py-2 z-10">Answer Review:</h3>
                  {currentQuestions.map((q) => {
                    const isCorrect = answers[q.id] === q.correctAnswer;
                    return (
                      <div key={q.id} className={cn(
                        "p-4 rounded-2xl border transition-all",
                        isCorrect ? "bg-emerald-50/80 border-emerald-200/80" : "bg-rose-50/80 border-rose-200/80"
                      )}>
                        <p className="text-sm font-bold text-foreground">{q.question}</p>
                        <div className="flex items-start gap-2 mt-2">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <div className="text-xs">
                            <span className="text-foreground">Your answer: <span className={isCorrect ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>{answers[q.id] || "(no answer)"}</span></span>
                            {!isCorrect && (
                              <>
                                <span className="text-muted-foreground"> · Correct: <span className="text-emerald-700 font-bold">{q.correctAnswer}</span></span>
                                {q.explanation && (
                                  <p className="text-muted-foreground mt-1 italic">{q.explanation}</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={handleBack} className="btn-gel-white rounded-full px-6">
                    Back to Tests
                  </Button>
                  <Button variant="hero" onClick={() => handleStartTest(selectedTest)} className="btn-gel-aqua rounded-full px-6 text-white">
                    Retry Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Active test view
  if (selectedTest && currentQuestions.length > 0 && activeTestQuestion) {
    const question = activeTestQuestion;
    const progress = ((currentQuestion + 1) / currentQuestions.length) * 100;
    
    return (
      <AppLayout>
        <div className="container py-8 max-w-4xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-foreground hover:bg-white/95 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2 text-primary" />
                Exit Test
              </Button>
              <div className="pill-bubble-aqua text-xs font-bold px-3 py-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{selectedTest.duration} min</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6 aero-card rounded-3xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-display font-bold text-foreground">{selectedTest.title}</span>
                <span className="pill-bubble-aqua text-xs font-bold px-2.5 py-0.5">
                  Question {currentQuestion + 1} of {currentQuestions.length}
                </span>
              </div>
              <div className="h-3 rounded-full liquid-tube p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <Card className="aero-card rounded-3xl overflow-hidden shadow-aqua">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="pill-bubble-aqua text-xs font-bold px-3 py-1">
                    {selectedTest.level}
                  </span>
                  <span className="pill-bubble text-xs font-semibold px-3 py-1 bg-white/70 capitalize text-muted-foreground">
                    {selectedTest.type === "grammar" ? "Grammar" : "Vocabulary"}
                  </span>
                </div>
                
                <h2 className="font-display font-bold text-xl text-foreground mb-6">
                  {question.question}
                </h2>
                
                <div className="space-y-3">
                  {shuffledTestOptions.map((option) => (
                    <button
                      key={option}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 text-left font-medium transition-all",
                        answers[question.id] === option 
                          ? "border-primary bg-cyan-50/90 text-primary font-bold shadow-aqua-sm" 
                          : "border-white/80 bg-white/70 hover:border-primary/50 hover:bg-white text-foreground"
                      )}
                      onClick={() => handleSelectAnswer(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full mt-6 btn-gel-aqua rounded-full font-display font-bold text-white shadow-aqua-sm"
                  onClick={handleNext}
                  disabled={!answers[question.id]}
                >
                  {currentQuestion < currentQuestions.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    "Finish Test"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Test list view
  const completedCount = Object.keys(completedTests).length;
  const averageScore = completedCount > 0 
    ? Math.round(Object.values(completedTests).reduce((a, b) => a + b, 0) / completedCount)
    : 0;

  return (
    <AppLayout>
      <div className="container py-8 max-w-6xl mx-auto px-4">
        {/* Back Button & Title */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-foreground hover:bg-white/95 shadow-sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-primary" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl orb-aqua flex items-center justify-center shadow-aqua">
              <Target className="w-8 h-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl text-foreground text-shadow-sm">
                Tests & Assessments
              </h1>
              <p className="text-muted-foreground font-medium">
                Evaluate your progress with grammar and vocabulary exams
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <Card className="mb-8 aero-card rounded-3xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-3 bg-white/60 rounded-2xl border border-white/80 shadow-sm">
                <p className="text-3xl font-display font-black text-foreground">{completedCount}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Tests Completed</p>
              </div>
              <div className="p-3 bg-white/60 rounded-2xl border border-white/80 shadow-sm">
                <p className="text-3xl font-display font-black text-emerald-600">{averageScore}%</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Average</p>
              </div>
              <div className="p-3 bg-white/60 rounded-2xl border border-white/80 shadow-sm">
                <p className="text-3xl font-display font-black text-primary">{testDefinitions.length - completedCount}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Tests Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tests List */}
        <div className="space-y-4">
          {testDefinitions.map((test) => {
            const isCompleted = completedTests[test.id] !== undefined;
            const score = completedTests[test.id];
            
            return (
              <Card 
                key={test.id} 
                className={cn(
                  "aero-card rounded-3xl overflow-hidden hover:shadow-aqua hover:-translate-y-0.5 transition-all duration-300",
                  isCompleted && "opacity-95"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm border border-white/80",
                        isCompleted 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-cyan-100 text-primary"
                      )}>
                        {isCompleted ? (
                          <Trophy className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <span>{test.level}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-base text-foreground">
                            {test.title}
                          </h3>
                          {isCompleted && (
                            <span className={cn(
                              "pill-bubble text-xs font-bold px-2 py-0.5",
                              score >= 70 ? "pill-bubble-green" : "pill-bubble-warning"
                            )}>
                              {score}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{test.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-semibold">
                          <span className="flex items-center gap-1 text-primary">
                            {getTypeIcon(test.type)}
                            {test.type === "grammar" ? "Grammar" : "Vocabulary"}
                          </span>
                          <span>·</span>
                          <span>{test.questionsCount} questions</span>
                          <span>·</span>
                          <span>{test.duration} min</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      onClick={() => handleStartTest(test)}
                      className={isCompleted 
                        ? "btn-gel-white rounded-full font-bold text-xs px-5 self-end sm:self-auto" 
                        : "btn-gel-aqua text-white rounded-full font-bold text-xs px-5 self-end sm:self-auto shadow-aqua-sm"
                      }
                    >
                      {isCompleted ? "Retry" : "Start"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}