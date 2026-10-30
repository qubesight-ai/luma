import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { grammarCategories, GrammarCategory } from "@/data/grammarData";
import { grammarExerciseStats } from "@/data/grammarExercisesExpanded";
import { grammarCurriculumStats } from "@/data/grammarCurriculumComplete";
import { ChevronDown, ChevronRight, ArrowLeft, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopicRowWithLevels } from "@/components/grammar/TopicRowWithLevels";
import { GrammarPracticeModal } from "@/components/grammar/GrammarPracticeModal";
import { useAppState } from "@/hooks/useAppState";

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export default function Grammar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const levelParam = searchParams.get("level") as CEFRLevel | null;
  
  const { userProgress } = useAppState();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(levelParam || "A1");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [filterLevel, setFilterLevel] = useState<CEFRLevel | "all">(levelParam || "all");

  // Update filter when URL param changes
  useEffect(() => {
    if (levelParam && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(levelParam)) {
      setFilterLevel(levelParam);
      setSelectedLevel(levelParam);
    }
  }, [levelParam]);

  const currentLevel = (userProgress?.currentLevel as CEFRLevel) || "A1";

  // Filter categories based on selected level - show only categories that have topics at that level
  const filteredCategories = filterLevel === "all" 
    ? grammarCategories 
    : grammarCategories.map(category => ({
        ...category,
        topics: category.topics.filter(topic => topic.level === filterLevel)
      })).filter(category => category.topics.length > 0);

  // Get counts per level
  const getTopicCountForLevel = (level: CEFRLevel) => {
    return grammarCategories.reduce((count, cat) => 
      count + cat.topics.filter(t => t.level === level).length, 0
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryProgress = (category: GrammarCategory) => {
    const completed = category.topics.filter(t => t.completed).length;
    return Math.round((completed / category.topics.length) * 100);
  };

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

  // Start quick practice by level (random exercises)
  const handleStartQuickPractice = (level: CEFRLevel) => {
    setSelectedLevel(level);
    setSelectedCategory(undefined);
    setPracticeModalOpen(true);
  };

  // Start topic-specific practice with category and level
  const handleStartTopicPractice = (category: string, level: CEFRLevel) => {
    setSelectedCategory(category);
    setSelectedLevel(level);
    setPracticeModalOpen(true);
  };

  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

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
              <span className="text-3xl drop-shadow-sm">📚</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl text-foreground text-shadow-sm">
                Grammar
              </h1>
              <p className="text-muted-foreground font-medium">
                {grammarExerciseStats.total}+ complete exercises from verb tenses to complex structures
              </p>
            </div>
          </div>
        </div>

        {/* Level Filter */}
        <div className="mb-6 aero-card rounded-3xl p-5">
          <h2 className="text-base font-display font-bold text-foreground mb-3">Filter by Level</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterLevel === "all" ? "default" : "outline"}
              onClick={() => setFilterLevel("all")}
              className={cn(
                "min-w-[80px] rounded-full transition-all font-semibold",
                filterLevel === "all" 
                  ? "btn-gel-aqua text-white shadow-aqua-sm" 
                  : "btn-gel-white text-foreground"
              )}
            >
              All
              <span className="ml-2 text-xs opacity-80">
                ({grammarExerciseStats.total})
              </span>
            </Button>
            {levels.map((level) => (
              <Button
                key={level}
                variant={filterLevel === level ? "default" : "outline"}
                onClick={() => setFilterLevel(level)}
                className={cn(
                  "min-w-[80px] rounded-full transition-all font-semibold",
                  filterLevel === level 
                    ? "btn-gel-aqua text-white shadow-aqua-sm" 
                    : "btn-gel-white text-foreground hover:border-primary/40"
                )}
              >
                {level}
                <span className="ml-2 text-xs opacity-80">({grammarExerciseStats[level]})</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Practice by Level */}
        <Card className="mb-8 aero-card rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-primary shadow-sm">
                <Dumbbell className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">Quick Practice by Level</h3>
              <Badge variant="secondary" className="ml-auto pill-bubble-aqua text-xs font-bold px-3 py-1">
                {grammarExerciseStats.total} exercises
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-4">
              Select a level to practice 10 random grammar exercises
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {levels.map((level) => (
                <Button
                  key={level}
                  variant="outline"
                  className="flex flex-col gap-1 h-auto py-3 rounded-2xl border border-white/80 bg-white/70 backdrop-blur-md shadow-sm hover:btn-gel-aqua hover:text-white transition-all group"
                  onClick={() => handleStartQuickPractice(level)}
                >
                  <span className="font-display font-black text-xl group-hover:scale-105 transition-transform">{level}</span>
                  <span className="text-[11px] opacity-80 font-semibold">
                    {grammarExerciseStats[level]} ex.
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card className="mb-8 aero-card rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground">Overall Progress</h3>
              <span className="text-xs font-bold text-primary">0% completed</span>
            </div>
            <div className="h-2.5 rounded-full liquid-tube p-0.5">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: '0%' }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Grammar Categories */}
        <div className="space-y-4">
          {filteredCategories.length === 0 ? (
            <Card className="aero-card rounded-3xl">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground font-medium">No grammar topics found for level {filterLevel}.</p>
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              const progress = getCategoryProgress(category);
              
              return (
                <Card key={category.id} className="aero-card rounded-3xl overflow-hidden hover:shadow-aqua transition-all duration-300">
                  {/* Category Header */}
                  <button
                    className="w-full p-6 flex items-center justify-between hover:bg-white/50 transition-colors text-left"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/80 border border-white flex items-center justify-center text-2xl shadow-sm">
                        {category.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-display font-bold text-base text-foreground">{category.title}</h3>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-extrabold text-primary">{progress}%</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">{category.topics.length} topics</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/60 border border-white/80 flex items-center justify-center shadow-xs">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Topics List with Level Toggle */}
                  {isExpanded && (
                    <div className="border-t border-white/60 bg-white/20 p-4 space-y-2">
                      {category.topics.map((topic, index) => (
                        <TopicRowWithLevels
                          key={topic.id}
                          topic={topic}
                          index={index}
                          onStartPractice={handleStartTopicPractice}
                          getLevelColor={getLevelColor}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Practice Modal */}
      <GrammarPracticeModal
        isOpen={practiceModalOpen}
        onClose={() => setPracticeModalOpen(false)}
        level={selectedLevel}
        category={selectedCategory}
        exerciseCount={10}
      />
    </div>
  );
}
