import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { expandedVocabularyCategories, VocabularyCategory, getTotalWordCount, getCategoryCount } from "@/data/vocabularyDataExpanded";
import { ArrowLeft, Play, RotateCcw, Volume2, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export default function Vocabulary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const levelParam = searchParams.get("level") as CEFRLevel | null;
  
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(levelParam || "A1");
  const [selectedCategory, setSelectedCategory] = useState<VocabularyCategory | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showingFlashcard, setShowingFlashcard] = useState(false);
  const { sendExerciseResultEmail } = useExerciseFeedback();

  // Update level when URL param changes
  useEffect(() => {
    if (levelParam && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(levelParam)) {
      setSelectedLevel(levelParam);
    }
  }, [levelParam]);

  const filteredCategories = expandedVocabularyCategories.filter(cat => cat.level === selectedLevel);
  const levelWordCount = filteredCategories.reduce((sum, cat) => sum + cat.words.length, 0);

  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

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

  const handleStartCategory = (category: VocabularyCategory) => {
    setSelectedCategory(category);
    setCurrentWordIndex(0);
    setIsFlipped(false);
    setShowingFlashcard(true);
  };

  const handleNextWord = () => {
    if (selectedCategory && currentWordIndex < selectedCategory.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleBack = () => {
    if (showingFlashcard) {
      setShowingFlashcard(false);
      setSelectedCategory(null);
    } else {
      navigate("/dashboard");
    }
  };

  // ElevenLabs TTS
  const { speak, stopAudio, isLoading: isSpeaking, isPlaying } = useElevenLabsTTS();

  const speakWord = (text: string) => {
    if (isPlaying) {
      stopAudio();
    } else {
      speak(text);
    }
  };

  if (showingFlashcard && selectedCategory) {
    const currentWord = selectedCategory.words[currentWordIndex];
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-8 max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-foreground hover:bg-white/95 shadow-sm"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-primary" />
            Back to categories
          </Button>

          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-6 aero-card rounded-3xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-display font-bold text-foreground">{selectedCategory.title}</span>
                <span className="pill-bubble-aqua text-xs font-bold px-2.5 py-0.5">
                  {currentWordIndex + 1} / {selectedCategory.words.length}
                </span>
              </div>
              <div className="h-3 rounded-full liquid-tube p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300"
                  style={{ width: `${((currentWordIndex + 1) / selectedCategory.words.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Flashcard */}
            <div
              className="relative h-80 cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <Card 
                className={cn(
                  "absolute inset-0 transition-all duration-500 backface-hidden aero-card rounded-3xl shadow-aqua border border-white/90 overflow-hidden",
                  isFlipped ? "rotate-y-180 opacity-0 pointer-events-none" : ""
                )}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <span className="text-xl font-display font-bold text-primary mb-4 text-shadow-sm">
                    {currentWord.definition}
                  </span>
                  <div className="text-center space-y-2 mt-4 max-w-md">
                    <p className="text-sm italic text-foreground font-medium">
                      "{currentWord.example}"
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {currentWord.context}
                    </p>
                  </div>
                  <div className="mt-8 pill-bubble-aqua text-xs font-semibold px-4 py-1.5 shadow-sm">
                    Tap to see the word
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={cn(
                  "absolute inset-0 transition-all duration-500 backface-hidden aero-card rounded-3xl shadow-aqua border border-white/90 overflow-hidden",
                  isFlipped ? "" : "-rotate-y-180 opacity-0 pointer-events-none"
                )}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 relative text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("absolute top-5 right-5 w-11 h-11 rounded-full btn-gel-white", isPlaying && "text-primary border-primary")}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentWord.english);
                    }}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : isPlaying ? (
                      <Square className="w-5 h-5 text-primary" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-primary" />
                    )}
                  </Button>
                  
                  <span className="text-4xl sm:text-5xl font-display font-black text-foreground mb-3 tracking-tight text-shadow-sm">
                    {currentWord.english}
                  </span>
                  <span className="pill-bubble text-sm font-semibold text-muted-foreground px-3 py-1 bg-white/70">
                    {currentWord.pronunciation}
                  </span>
                  <p className="text-xs text-muted-foreground mt-8">
                    Tap to flip back
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevWord}
                disabled={currentWordIndex === 0}
                className="btn-gel-white rounded-full px-6"
              >
                Previous
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full btn-gel-white"
                onClick={() => {
                  setCurrentWordIndex(0);
                  setIsFlipped(false);
                }}
              >
                <RotateCcw className="w-5 h-5 text-primary" />
              </Button>
              
              <Button
                variant="default"
                onClick={handleNextWord}
                disabled={currentWordIndex === selectedCategory.words.length - 1}
                className="btn-gel-aqua rounded-full px-6 text-white"
              >
                Next
              </Button>
            </div>

            {/* Finish Button */}
            {currentWordIndex === selectedCategory.words.length - 1 && (
              <Button
                variant="hero"
                size="lg"
                className="w-full mt-6 btn-gel-green rounded-full py-6 font-display font-bold text-base text-white shadow-lg"
                onClick={() => {
                  sendExerciseResultEmail({
                    exerciseType: "Vocabulary Flashcards",
                    exerciseTitle: `${selectedCategory.title} (${selectedLevel})`,
                    level: selectedLevel,
                    score: 100,
                    totalQuestions: selectedCategory.words.length,
                    correctAnswers: selectedCategory.words.length,
                    incorrectAnswers: [],
                  });
                  handleBack();
                }}
              >
                Complete session!
              </Button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-6xl mx-auto px-4">
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
              <span className="text-3xl drop-shadow-sm">💡</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl text-foreground text-shadow-sm">
                Vocabulary
              </h1>
              <p className="text-muted-foreground font-medium">
                Expand your lexicon with flashcards and contextual exercises
              </p>
            </div>
          </div>
        </div>

        {/* Level Selector */}
        <div className="mb-6 aero-card rounded-3xl p-5">
          <h2 className="text-base font-display font-bold text-foreground mb-3">Select Level</h2>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => {
              const levelCategories = expandedVocabularyCategories.filter(c => c.level === level);
              const count = levelCategories.reduce((sum, c) => sum + c.words.length, 0);
              return (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    "min-w-[80px] rounded-full transition-all font-semibold",
                    selectedLevel === level 
                      ? "btn-gel-aqua text-white shadow-aqua-sm" 
                      : "btn-gel-white text-foreground hover:border-primary/40"
                  )}
                >
                  {level}
                  <span className="ml-2 text-xs opacity-80">({count})</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <Card className="mb-8 aero-card rounded-3xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-3 bg-white/60 rounded-2xl border border-white/80 shadow-sm">
                <p className="text-3xl font-display font-black text-foreground">0</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Words learned</p>
              </div>
              <div className="p-3 bg-white/60 rounded-2xl border border-white/80 shadow-sm">
                <p className="text-3xl font-display font-black text-primary">{filteredCategories.length}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Categories</p>
              </div>
              <div className="p-3 bg-white/60 rounded-2xl border border-white/80 shadow-sm">
                <p className="text-3xl font-display font-black text-foreground">{levelWordCount}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Words in {selectedLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => {
            const progress = Math.round((category.learned / category.wordCount) * 100);
            
            return (
              <Card
                key={category.id}
                className="group hover:shadow-aqua hover:-translate-y-1 transition-all duration-300 cursor-pointer aero-card rounded-3xl overflow-hidden"
                onClick={() => handleStartCategory(category)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-cyan-50 border border-white/80 shadow-aqua-sm flex items-center justify-center text-3xl group-hover:scale-110 group-hover:shadow-aqua transition-all">
                      {category.icon}
                    </div>
                    <span className="pill-bubble-aqua text-xs font-bold px-3 py-1">
                      {category.level}
                    </span>
                  </div>
                  
                  <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-3">
                    <span>{category.learned} / {category.wordCount} words</span>
                    <span className="font-extrabold text-primary">{progress}%</span>
                  </div>
                  
                  <div className="h-2 rounded-full liquid-tube p-0.5 mb-4">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full btn-gel-white group-hover:btn-gel-aqua group-hover:text-white transition-all rounded-full font-bold text-xs">
                    <Play className="w-3.5 h-3.5 mr-2" />
                    Practice
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
