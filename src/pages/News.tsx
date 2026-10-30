import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, BookOpen, Volume2, CheckCircle2, MessageSquare, Headphones, Loader2, Square } from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import { newsArticles, NewsArticle } from "@/data/newsData";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "@/hooks/use-toast";
import { NewsExercises } from "@/components/news/NewsExercises";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";

export default function News() {
  const navigate = useNavigate();
  const { addXP } = useGamification();
  const [selectedLevel, setSelectedLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1" | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [activeSection, setActiveSection] = useState<"read" | "comprehension" | "exercises">("read");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { sendExerciseResultEmail } = useExerciseFeedback();
  
  // ElevenLabs TTS
  const { speak, stopAudio, isLoading: isSpeaking, isPlaying } = useElevenLabsTTS();

  const filteredArticles = selectedLevel ? newsArticles.filter(a => a.level === selectedLevel) : newsArticles;

  const shuffledComprehensionOptions = useMemo(() => {
    if (!selectedArticle) return [];
    return selectedArticle.questions.map((q) => shuffleArray([...q.options]));
  }, [selectedArticle?.id]);

  const speakText = (text: string) => {
    if (isPlaying) {
      stopAudio();
    } else {
      speak(text);
    }
  };

  const handleCheckAnswers = () => {
    if (!selectedArticle) return;
    const correct = selectedArticle.questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const incorrectAnswers = selectedArticle.questions
      .filter((q, i) => answers[i] !== q.correctAnswer)
      .map((q, i) => ({
        question: q.question,
        userAnswer: answers[i] || "(no answer)",
        correctAnswer: q.correctAnswer,
      }));
    const score = Math.round((correct / selectedArticle.questions.length) * 100);
    const xp = correct * 15;
    addXP(xp, 'news');
    setShowResults(true);
    sendExerciseResultEmail({
      exerciseType: "Reading Comprehension",
      exerciseTitle: selectedArticle.title,
      level: selectedArticle.level,
      score,
      totalQuestions: selectedArticle.questions.length,
      correctAnswers: correct,
      incorrectAnswers,
    });
    toast({ title: `${correct}/${selectedArticle.questions.length} correct`, description: `+${xp} XP earned` });
  };

  const resetArticle = () => {
    setSelectedArticle(null);
    setActiveSection("read");
    setAnswers({});
    setShowResults(false);
  };

  if (selectedArticle) {
    const hasExercises = (selectedArticle.grammarExercises?.length || 0) > 0 || 
                          (selectedArticle.vocabularyExercises?.length || 0) > 0;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 max-w-4xl">
          <Button variant="ghost" size="sm" className="mb-6" onClick={resetArticle}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back to News
          </Button>

          {/* Article Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium text-white", `bg-level-${selectedArticle.level.toLowerCase()}`)}>{selectedArticle.level}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" />{selectedArticle.readTime} min</span>
                <span className="text-xs text-muted-foreground">{selectedArticle.category}</span>
              </div>
              <h1 className="font-display font-bold text-2xl mb-2">{selectedArticle.title}</h1>
              <p className="text-muted-foreground mb-4">{selectedArticle.titleEs}</p>
            </CardContent>
          </Card>

          {/* Navigation Tabs */}
          <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as any)} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="read" className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                Read & Listen
              </TabsTrigger>
              <TabsTrigger value="comprehension" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Comprehension
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center gap-2" disabled={!hasExercises}>
                <MessageSquare className="w-4 h-4" />
                Grammar & Vocab
                {hasExercises && (
                  <span className="text-xs bg-accent/20 px-1.5 py-0.5 rounded-full">
                    {(selectedArticle.grammarExercises?.length || 0) + (selectedArticle.vocabularyExercises?.length || 0)}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Read & Listen Tab */}
            <TabsContent value="read">
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-2 mb-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => speakText(selectedArticle.content)}
                      disabled={isSpeaking}
                      className={cn(isPlaying && "text-primary")}
                    >
                      {isSpeaking ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : isPlaying ? (
                        <Square className="w-4 h-4 mr-2" />
                      ) : (
                        <Volume2 className="w-4 h-4 mr-2" />
                      )}
                      {isPlaying ? "Stop" : "Listen to Article"}
                    </Button>
                    {isPlaying && (
                      <Button variant="ghost" size="sm" onClick={stopAudio}>
                        Stop
                      </Button>
                    )}
                  </div>

                  <div className="prose prose-sm max-w-none mb-6">
                    {selectedArticle.content.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="mb-4 leading-relaxed text-foreground">{paragraph}</p>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/50">
                    <h3 className="font-semibold mb-3">📚 Key Vocabulary</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedArticle.vocabulary.map((item, i) => (
                        <div key={i} className="p-3 rounded-lg bg-background border">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{item.word}</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn("h-6 w-6 p-0", isPlaying && "text-primary")}
                              onClick={() => speakText(item.word)}
                              disabled={isSpeaking}
                            >
                              {isSpeaking ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : isPlaying ? (
                                <Square className="w-3 h-3" />
                              ) : (
                                <Volume2 className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.definition}</p>
                          <p className="text-xs text-primary/70 mt-1 italic">"{item.example}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comprehension Tab */}
            <TabsContent value="comprehension">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-lg mb-4">Comprehension Questions</h3>
                  <div className="space-y-6">
                    {selectedArticle.questions.map((q, i) => (
                      <div key={i}>
                        <p className="font-medium mb-3">{i + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {(shuffledComprehensionOptions[i] ?? q.options).map((opt) => (
                            <button 
                              key={opt} 
                              className={cn(
                                "w-full p-3 rounded-lg border text-left transition-all", 
                                answers[i] === opt && "border-primary bg-primary/10", 
                                showResults && opt === q.correctAnswer && "border-success bg-success/10", 
                                showResults && answers[i] === opt && opt !== q.correctAnswer && "border-destructive bg-destructive/10"
                              )} 
                              onClick={() => !showResults && setAnswers(prev => ({ ...prev, [i]: opt }))} 
                              disabled={showResults}
                            >
                              <div className="flex items-center justify-between">
                                <span>{opt}</span>
                                {showResults && opt === q.correctAnswer && <CheckCircle2 className="w-4 h-4 text-success" />}
                              </div>
                            </button>
                          ))}
                        </div>
                        {showResults && answers[i] !== q.correctAnswer && (
                          <p className="text-sm text-muted-foreground mt-2">{q.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {!showResults && (
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="w-full mt-6" 
                      onClick={handleCheckAnswers} 
                      disabled={Object.keys(answers).length < selectedArticle.questions.length}
                    >
                      Check Answers
                    </Button>
                  )}
                  {showResults && hasExercises && (
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="w-full mt-6" 
                      onClick={() => setActiveSection("exercises")}
                    >
                      Practice Grammar & Vocabulary
                      <MessageSquare className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exercises Tab */}
            <TabsContent value="exercises">
              {hasExercises ? (
                <NewsExercises 
                  grammarExercises={selectedArticle.grammarExercises}
                  vocabularyExercises={selectedArticle.vocabularyExercises}
                  articleTitle={selectedArticle.title}
                />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No grammar or vocabulary exercises available for this article yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-info to-primary flex items-center justify-center text-3xl">📰</div>
          <div>
            <h1 className="font-display font-bold text-3xl">Global News</h1>
            <p className="text-muted-foreground">News adapted to your level for reading practice</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button variant={selectedLevel === null ? "default" : "outline"} size="sm" onClick={() => setSelectedLevel(null)}>All</Button>
          {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
            <Button key={level} variant={selectedLevel === level ? "default" : "outline"} size="sm" onClick={() => setSelectedLevel(level)}>{level}</Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-all overflow-hidden" onClick={() => setSelectedArticle(article)}>
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">📰</div>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium text-white", `bg-level-${article.level.toLowerCase()}`)}>{article.level}</span>
                  <span className="text-xs text-muted-foreground">{article.category}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime} min</span>
                </div>
                <h3 className="font-display font-semibold mb-1 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}