import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, RotateCcw, Sparkles, ChevronRight, Trophy, Target, X } from "lucide-react";
import { shuffleArray } from "@/lib/utils";
import { grammarCategories } from "@/data/grammarData";
import { getGrammarExercisesByCategory, getGrammarExercisesByLevel, GrammarExercise } from "@/data/grammarExercisesExpanded";
import { useAppState } from "@/hooks/useAppState";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1"];

const levelColors: Record<CEFRLevel, string> = {
  "A1": "bg-level-a1 text-white",
  "A2": "bg-level-a2 text-white",
  "B1": "bg-level-b1 text-white",
  "B2": "bg-level-b2 text-white",
  "C1": "bg-level-c1 text-white",
};

const topicCategories = [
  { id: "tenses", name: "Verb Tenses", icon: "⏰", topics: ["Present Simple", "Present Continuous", "Past Simple", "Past Continuous", "Present Perfect", "Past Perfect", "Future Simple", "Future Continuous", "Future Perfect"] },
  { id: "conditionals", name: "Conditionals", icon: "🔀", topics: ["Zero Conditional", "First Conditional", "Second Conditional", "Third Conditional", "Mixed Conditionals"] },
  { id: "passive", name: "Passive Voice", icon: "🔄", topics: ["Passive Voice", "Passive with Modals", "Causative Passive"] },
  { id: "modals", name: "Modal Verbs", icon: "💪", topics: ["Can/Could", "Must/Have to", "Should/Ought to", "May/Might", "Would"] },
  { id: "articles", name: "Articles and Determiners", icon: "📝", topics: ["Articles", "Determiners", "Quantifiers"] },
  { id: "clauses", name: "Sentences and Clauses", icon: "🔗", topics: ["Relative Clauses", "Noun Clauses", "Adverbial Clauses", "Cleft Sentences"] },
  { id: "reported", name: "Reported Speech", icon: "💬", topics: ["Reported Speech", "Reporting Verbs"] },
  { id: "advanced", name: "Advanced Structures", icon: "🎓", topics: ["Inversion", "Subjunctive", "Emphatic Structures", "Ellipsis"] },
];

const CustomExam = () => {
  const navigate = useNavigate();
  const { userProgress } = useAppState();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(userProgress.currentLevel as CEFRLevel || "A1");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [examStarted, setExamStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [examCompleted, setExamCompleted] = useState(false);
  const [exercises, setExercises] = useState<GrammarExercise[]>([]);
  const [answerHistory, setAnswerHistory] = useState<Record<number, string>>({});
  const feedbackSentRef = useRef(false);
  const { sendExerciseResultEmail } = useExerciseFeedback();

  const MAX_TOPICS = 4;

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      }
      if (prev.length >= MAX_TOPICS) {
        return prev; // Don't add more than max
      }
      return [...prev, topic];
    });
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics(prev => prev.filter(t => t !== topic));
  };

  const generateExam = (topics: string[], level: CEFRLevel) => {
    const allExercises: GrammarExercise[] = [];
    
    // Get exercises for each selected topic
    topics.forEach(topic => {
      let topicExercises = getGrammarExercisesByCategory(level, topic);
      
      // If not enough exercises for the specific topic, search by keywords
      if (topicExercises.length < 3) {
        const levelExercises = getGrammarExercisesByLevel(level);
        const topicKeywords = topic.toLowerCase().split(" ");
        topicExercises = levelExercises.filter(ex => 
          topicKeywords.some(keyword => 
            ex.question.toLowerCase().includes(keyword) || 
            ex.category.toLowerCase().includes(keyword)
          )
        );
      }
      
      allExercises.push(...topicExercises);
    });

    // Remove duplicates by id
    const uniqueExercises = allExercises.filter((ex, index, self) => 
      index === self.findIndex(e => e.id === ex.id)
    );

    // If not enough exercises, add more from the level
    let finalExercises = uniqueExercises;
    if (uniqueExercises.length < 10) {
      const levelExercises = getGrammarExercisesByLevel(level);
      const additionalExercises = levelExercises.filter(ex => 
        !uniqueExercises.some(ue => ue.id === ex.id)
      );
      finalExercises = [...uniqueExercises, ...additionalExercises];
    }

    // Shuffle and take 10 exercises
    const shuffled = [...finalExercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  };

  const handleStartExam = () => {
    if (selectedTopics.length === 0) return;
    const examExercises = generateExam(selectedTopics, selectedLevel);
    setExercises(examExercises);
    setExamStarted(true);
    setCurrentIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setExamCompleted(false);
  };

  const handleSelectAnswer = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    setAnswerHistory(prev => ({ ...prev, [currentIndex]: answer }));
    
    const isCorrect = answer === exercises[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setExamCompleted(true);
      if (!feedbackSentRef.current) {
        feedbackSentRef.current = true;
        const finalCorrect = score.correct + (selectedAnswer === exercises[currentIndex]?.correctAnswer ? 1 : 0);
        const percentage = Math.round((finalCorrect / exercises.length) * 100);
        const incorrectAnswers = exercises
          .map((ex, i) => ({ question: ex.question, userAnswer: answerHistory[i] || selectedAnswer || "", correctAnswer: ex.correctAnswer }))
          .filter(item => item.userAnswer !== item.correctAnswer);
        sendExerciseResultEmail({
          exerciseType: "Custom Exam",
          exerciseTitle: `Custom Exam (${selectedLevel}) - ${selectedTopics.join(", ")}`,
          level: selectedLevel,
          score: percentage,
          totalQuestions: exercises.length,
          correctAnswers: finalCorrect,
          incorrectAnswers,
        });
      }
    }
  };

  const handleRestart = () => {
    setExamStarted(false);
    setSelectedTopics([]);
    setCurrentIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setExamCompleted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswerHistory({});
    feedbackSentRef.current = false;
  };

  const currentExercise = exercises[currentIndex];
  const shuffledCustomExamOptions = useMemo(() => {
    if (!currentExercise?.options?.length) return [];
    return shuffleArray([...currentExercise.options]);
  }, [currentIndex, currentExercise?.id]);

  const progressPercent = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;
  const scorePercent = score.correct + score.incorrect > 0 
    ? Math.round((score.correct / (score.correct + score.incorrect)) * 100) 
    : 0;

  // Results screen
  if (examCompleted) {
    return (
      <AppLayout>
        <div className="container py-8 max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Exam Completed!</CardTitle>
              <CardDescription>
                Topics: {selectedTopics.join(", ")} • Level: {selectedLevel}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="text-3xl font-bold text-green-600">{score.correct}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="text-3xl font-bold text-red-600">{score.incorrect}</div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="text-3xl font-bold text-primary">{scorePercent}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                {scorePercent >= 80 ? (
                  <p className="text-green-600 font-medium">🎉 Excellent! You have mastered this topic very well.</p>
                ) : scorePercent >= 60 ? (
                  <p className="text-yellow-600 font-medium">👍 Good job, but there's room for improvement.</p>
                ) : (
                  <p className="text-red-600 font-medium">📚 We recommend reviewing this topic before continuing.</p>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleRestart}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Exam
                </Button>
                <Button onClick={() => navigate("/dashboard")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Active exam screen
  if (examStarted && currentExercise) {
    return (
      <AppLayout>
        <div className="container py-8 max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Badge className={levelColors[selectedLevel]}>{selectedLevel}</Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {exercises.length}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 flex-wrap">
                <Target className="h-4 w-4" />
                {selectedTopics.map((topic, idx) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}{idx < selectedTopics.length - 1 ? "" : ""}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg leading-relaxed">
                {currentExercise.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {shuffledCustomExamOptions.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentExercise.correctAnswer;
                  const showResult = showExplanation;

                  let optionClass = "p-4 rounded-xl border-2 cursor-pointer transition-all ";
                  if (showResult) {
                    if (isCorrect) {
                      optionClass += "border-green-500 bg-green-500/10";
                    } else if (isSelected && !isCorrect) {
                      optionClass += "border-red-500 bg-red-500/10";
                    } else {
                      optionClass += "border-muted opacity-50";
                    }
                  } else {
                    optionClass += isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50 hover:bg-muted/50";
                  }

                  return (
                    <div
                      key={idx}
                      className={optionClass}
                      onClick={() => handleSelectAnswer(option)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="p-4 rounded-xl bg-muted/50 border space-y-2">
                  <p className="font-medium text-sm">📖 Explanation:</p>
                  <p className="text-sm text-muted-foreground">{currentExercise.explanation}</p>
                </div>
              )}

              {showExplanation && (
                <Button className="w-full" onClick={handleNext}>
                  {currentIndex < exercises.length - 1 ? "Next Question" : "View Results"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span className="text-green-600">✓ {score.correct} correct</span>
            <span className="text-red-600">✗ {score.incorrect} incorrect</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Topic selection screen
  return (
    <AppLayout>
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Custom Exams
          </h1>
          <p className="text-muted-foreground text-lg">
            Select a topic and level to generate a specific exam
          </p>
        </div>

        {/* Level Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              1. Select your level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {levels.map(level => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  className={selectedLevel === level ? levelColors[level] : ""}
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              2. Select topics (up to {MAX_TOPICS})
            </CardTitle>
            <CardDescription>
              Choose the grammar topics you want to practice. Questions will be mixed from all selected topics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Selected Topics Display */}
            {selectedTopics.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Selected topics ({selectedTopics.length}/{MAX_TOPICS}):</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTopics([])}
                    className="text-xs h-6"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTopics.map(topic => (
                    <Badge 
                      key={topic} 
                      variant="default" 
                      className="gap-1 pr-1"
                    >
                      {topic}
                      <button 
                        onClick={() => removeTopic(topic)}
                        className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {topicCategories.map(category => (
                  <div key={category.id} className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 pl-6">
                      {category.topics.map(topic => {
                        const isSelected = selectedTopics.includes(topic);
                        const isDisabled = !isSelected && selectedTopics.length >= MAX_TOPICS;
                        
                        return (
                          <div 
                            key={topic}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : isDisabled 
                                  ? "border-muted bg-muted/30 opacity-50 cursor-not-allowed" 
                                  : "border-muted hover:border-primary/50 hover:bg-muted/50"
                            }`}
                            onClick={() => !isDisabled && handleTopicToggle(topic)}
                          >
                            <Checkbox 
                              checked={isSelected}
                              disabled={isDisabled}
                              onCheckedChange={() => !isDisabled && handleTopicToggle(topic)}
                            />
                            <span className="text-xs font-medium">{topic}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {selectedTopics.length > 0 ? (
                  <div className="space-y-1">
                    <p className="font-medium">Selected exam:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={levelColors[selectedLevel]}>{selectedLevel}</Badge>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm">{selectedTopics.length} topic{selectedTopics.length > 1 ? "s" : ""} selected</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select at least one topic to begin</p>
                )}
              </div>
              <Button 
                size="lg" 
                disabled={selectedTopics.length === 0}
                onClick={handleStartExam}
                className="gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Generate Mixed Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CustomExam;
