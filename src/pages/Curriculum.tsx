import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, Check, Lock, BookOpen, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { 
  CEFRLevel, 
  LevelCurriculum,
  SkillCategory,
  Skill,
  getCategoryProgress,
  getSkillProgress
} from "@/data/curriculumData";
import { enhancedCurriculumData, getEnhancedLevelProgress } from "@/data/enhancedCurriculumData";

const levelColors: Record<CEFRLevel, string> = {
  A1: "level-a1",
  A2: "level-a2",
  B1: "level-b1",
  B2: "level-b2",
  C1: "level-c1",
  C2: "level-c2",
};

const levelTextColors: Record<CEFRLevel, string> = {
  A1: "level-a1-text",
  A2: "level-a2-text",
  B1: "level-b1-text",
  B2: "level-b2-text",
  C1: "level-c1-text",
  C2: "level-c2-text",
};

export default function Curriculum() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const levelParam = searchParams.get("level") as CEFRLevel | null;
  
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(levelParam || "A1");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSkills, setExpandedSkills] = useState<string[]>([]);
  const [completedSkills, setCompletedSkills] = useState<string[]>([]);

  // Update level when URL param changes
  useEffect(() => {
    if (levelParam && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(levelParam)) {
      setSelectedLevel(levelParam);
    }
  }, [levelParam]);

  useEffect(() => {
    const saved = localStorage.getItem("curriculum-progress");
    if (saved) {
      setCompletedSkills(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("curriculum-progress", JSON.stringify(completedSkills));
  }, [completedSkills]);

  const currentLevelData = enhancedCurriculumData.find(l => l.level === selectedLevel)!;
  const levelProgress = getEnhancedLevelProgress(selectedLevel, completedSkills);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSkill = (skillId: string) => {
    setExpandedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const toggleSubSkill = (subSkillId: string) => {
    setCompletedSkills(prev =>
      prev.includes(subSkillId)
        ? prev.filter(id => id !== subSkillId)
        : [...prev, subSkillId]
    );
  };

  // All levels are unlocked for free access
  const isLevelUnlocked = (_level: CEFRLevel): boolean => {
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-cyan-500 to-sky-400 text-white p-6 shadow-aqua relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10 border border-white/40 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-shadow-sm">CEFR Curriculum</h1>
              <p className="text-white/90 text-sm font-medium">Your structured learning path</p>
            </div>
          </div>

          {/* Level selector */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {enhancedCurriculumData.map((level) => {
              const unlocked = isLevelUnlocked(level.level);
              const progress = getEnhancedLevelProgress(level.level, completedSkills);
              
              return (
                <button
                  key={level.level}
                  onClick={() => unlocked && setSelectedLevel(level.level)}
                  disabled={!unlocked}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 rounded-full font-bold transition-all border border-white/60 shadow-sm",
                    selectedLevel === level.level
                      ? "btn-gel-white text-primary shadow-aqua-sm scale-105"
                      : unlocked
                      ? "bg-white/30 backdrop-blur-md text-white hover:bg-white/50"
                      : "bg-white/10 text-white/50 cursor-not-allowed border-transparent"
                  )}
                >
                  <div className="text-sm font-display">{level.level}</div>
                  <div className="text-[11px] opacity-90 font-medium">
                    {unlocked ? `${progress}%` : <Lock className="w-3 h-3 inline" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level Overview */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
        <Card className="aero-card rounded-3xl overflow-hidden border-2" style={{ borderColor: `hsl(var(--${levelColors[selectedLevel].replace('level-', 'level-')}))` }}>
          <CardHeader className="pb-3 border-b border-white/60 bg-white/30">
            <div className="flex items-center justify-between">
              <div>
                <Badge className={cn("pill-bubble text-white font-bold mb-2 shadow-sm", levelColors[selectedLevel])}>
                  {selectedLevel} - {currentLevelData.title}
                </Badge>
                <CardTitle className="text-xl font-display font-bold text-foreground">{currentLevelData.description}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm">
                <Target className={cn("w-6 h-6 mx-auto mb-1.5", levelTextColors[selectedLevel])} />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vocabulary</p>
                <p className="font-display font-extrabold text-lg text-foreground mt-0.5">{currentLevelData.targetVocabulary}</p>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm">
                <Clock className={cn("w-6 h-6 mx-auto mb-1.5", levelTextColors[selectedLevel])} />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated hours</p>
                <p className="font-display font-extrabold text-lg text-foreground mt-0.5">{currentLevelData.estimatedHours}h</p>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm">
                <BookOpen className={cn("w-6 h-6 mx-auto mb-1.5", levelTextColors[selectedLevel])} />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categories</p>
                <p className="font-display font-extrabold text-lg text-foreground mt-0.5">{currentLevelData.categories.length}</p>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/80">
              <div className="flex justify-between items-center text-sm font-bold mb-2">
                <span className="text-foreground">Level progress</span>
                <span className={cn("font-extrabold text-base", levelTextColors[selectedLevel])}>{levelProgress}%</span>
              </div>
              <div className="h-3 rounded-full liquid-tube p-0.5">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", levelColors[selectedLevel])}
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="space-y-4">
          {currentLevelData.categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              level={selectedLevel}
              isExpanded={expandedCategories.includes(category.id)}
              onToggle={() => toggleCategory(category.id)}
              expandedSkills={expandedSkills}
              onToggleSkill={toggleSkill}
              completedSkills={completedSkills}
              onToggleSubSkill={toggleSubSkill}
              currentLevelData={currentLevelData}
              onNavigateToLesson={(level, categoryId, skillId) => {
                navigate(`/skill/${level}/${categoryId}/${skillId}`);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: SkillCategory;
  level: CEFRLevel;
  isExpanded: boolean;
  onToggle: () => void;
  expandedSkills: string[];
  onToggleSkill: (skillId: string) => void;
  completedSkills: string[];
  onToggleSubSkill: (subSkillId: string) => void;
  currentLevelData: LevelCurriculum;
  onNavigateToLesson: (level: CEFRLevel, categoryId: string, skillId: string) => void;
}

function CategoryCard({
  category,
  level,
  isExpanded,
  onToggle,
  expandedSkills,
  onToggleSkill,
  completedSkills,
  onToggleSubSkill,
  currentLevelData,
  onNavigateToLesson,
}: CategoryCardProps) {
  const progress = getCategoryProgress(category.id, completedSkills, currentLevelData);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="aero-card rounded-3xl overflow-hidden hover:shadow-aqua transition-all duration-300">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="pb-3 border-b border-white/40 bg-white/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/80 border border-white flex items-center justify-center text-2xl shadow-sm">
                  {category.icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-display font-bold text-foreground">{category.title}</CardTitle>
                    <Badge variant="secondary" className="pill-bubble-aqua text-[11px] font-bold px-2 py-0.5">
                      {category.skills.length} themes
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={cn("pill-bubble text-xs font-bold px-2.5 py-0.5", levelTextColors[level], "bg-white/80 border border-white shadow-sm")}>
                  {progress}%
                </span>
                <div className="w-8 h-8 rounded-full bg-white/60 border border-white/80 flex items-center justify-center shadow-sm">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
            <div className="h-2 rounded-full liquid-tube p-0.5 mt-3">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", levelColors[level])}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 space-y-3 bg-white/20">
            {category.skills.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                level={level}
                categoryId={category.id}
                isExpanded={expandedSkills.includes(skill.id)}
                onToggle={() => onToggleSkill(skill.id)}
                completedSkills={completedSkills}
                onToggleSubSkill={onToggleSubSkill}
                currentLevelData={currentLevelData}
                onNavigateToLesson={onNavigateToLesson}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface SkillRowProps {
  skill: Skill;
  level: CEFRLevel;
  categoryId: string;
  isExpanded: boolean;
  onToggle: () => void;
  completedSkills: string[];
  onToggleSubSkill: (subSkillId: string) => void;
  currentLevelData: LevelCurriculum;
  onNavigateToLesson: (level: CEFRLevel, categoryId: string, skillId: string) => void;
}

function SkillRow({
  skill,
  level,
  categoryId,
  isExpanded,
  onToggle,
  completedSkills,
  onToggleSubSkill,
  currentLevelData,
  onNavigateToLesson,
}: SkillRowProps) {
  const progress = getSkillProgress(skill.id, completedSkills, currentLevelData);
  const isComplete = progress === 100;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className={cn(
        "rounded-2xl border p-3.5 transition-all shadow-sm",
        isComplete 
          ? "bg-emerald-50/80 border-emerald-200/80 backdrop-blur-md" 
          : "bg-white/80 border-white/90 backdrop-blur-md hover:bg-white/95"
      )}>
        <CollapsibleTrigger className="w-full text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                isComplete
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : "bg-cyan-500 text-white shadow-cyan-200"
              )}>
                {isComplete ? <Check className="w-4 h-4" /> : `${progress}%`}
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-sm text-foreground">{skill.title}</p>
                <p className="text-xs text-muted-foreground">{skill.description}</p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/80 border border-white flex items-center justify-center shadow-xs">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-primary" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-3 pl-8 space-y-2 border-t border-black/5 pt-3">
            {skill.subSkills.map((subSkill) => {
              const isChecked = completedSkills.includes(subSkill.id);
              return (
                <button
                  key={subSkill.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSubSkill(subSkill.id);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors border",
                    isChecked
                      ? "bg-emerald-100/60 border-emerald-300 text-emerald-950 font-medium"
                      : "bg-white/70 border-white/80 text-foreground hover:bg-white"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-colors shadow-xs",
                    isChecked
                      ? "bg-emerald-500 border-emerald-600 text-white"
                      : "border-muted-foreground/30 bg-white"
                  )}>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className={cn(
                    "text-xs leading-relaxed",
                    isChecked && "line-through opacity-75 font-semibold"
                  )}>
                    {subSkill.title}
                  </span>
                </button>
              );
            })}
            
            {/* Practice Button */}
            <Button
              size="sm"
              className="w-full mt-2.5 btn-gel-aqua rounded-full font-bold text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToLesson(level, categoryId, skill.id);
              }}
            >
              <Target className="w-4 h-4 mr-2" />
              Practice {skill.title}
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
